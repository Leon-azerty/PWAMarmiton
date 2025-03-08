import type {
  TFullRecipe,
  THandleRecipeData,
} from '@/app/(auth)/components/addRecipe/addRecipe.schema'

const DB_NAME = 'recipesDB'
const STORE_RECIPES_NAME = 'recipes'
const DB_VERSION = 1

export function isDateId(id: number): boolean {
  return id >= 10000000
}

export function recipeToFormData(
  recipe: THandleRecipeData,
  userId: number,
  image: File | null,
): FormData {
  const formData = new FormData()

  formData.append('title', recipe.title)
  formData.append('description', recipe.description)
  formData.append('authorId', userId.toString())

  recipe.ingredients.forEach((ingredient, index) => {
    formData.append(`ingredients[${index}]`, ingredient.label)
  })

  recipe.steps.forEach((step, index) => {
    formData.append(`steps[${index}]`, step.label)
  })

  recipe.comments.forEach((comment, index) => {
    formData.append(`comments[${index}]`, comment.content)
  })

  if (image) {
    formData.append('image', image)
  }

  if (recipe.id && !isDateId(recipe.id)) {
    formData.append('id', recipe.id.toString())
  }

  return formData
}

/**
 * Open the database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_RECIPES_NAME)) {
        db.createObjectStore(STORE_RECIPES_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Save recipe offline
 */
export async function saveRecipeOffline(recipe: TFullRecipe): Promise<void> {
  const db = await openDatabase()
  const tx = db.transaction(STORE_RECIPES_NAME, 'readwrite')
  const store = tx.objectStore(STORE_RECIPES_NAME)

  recipe.id = recipe.id ?? Date.now()

  store.put(recipe)

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteRecipe(id: number) {
  const db = await openDatabase()
  const tx = db.transaction(STORE_RECIPES_NAME, 'readwrite')
  tx.objectStore(STORE_RECIPES_NAME).delete(id)

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingRecipes() {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECIPES_NAME, 'readonly')
    const store = tx.objectStore(STORE_RECIPES_NAME)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const urlToFile = async (url: string, filename: string) => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename)
}

function containsPendingComments(recipe: TFullRecipe) {
  const nbPendingComments = recipe.comments.filter(
    (comment) => comment.syncPending,
  ).length

  return nbPendingComments > 0
}

export async function syncPendingComments(recipe: TFullRecipe) {
  const syncPromises = recipe.comments
    .filter((comment) => comment.syncPending)
    .map(async (comment) => {
      try {
        if (comment.offlineDelete) {
          await fetch('/api/comments', {
            method: 'DELETE',
            body: JSON.stringify({
              commentId: comment.id,
            }),
          })

          return comment
        } else if (isDateId(comment.id)) {
          const response = await fetch('/api/comments', {
            method: 'POST',
            body: JSON.stringify({
              content: comment.content,
              recipeId: recipe.id,
            }),
          })

          if (response.ok) {
            return response.json()
          }
        } else {
          const response = await fetch('/api/comments', {
            method: 'PUT',
            body: JSON.stringify({
              commentId: comment.id,
              content: comment.content,
            }),
          })

          if (response.ok) {
            return response.json()
          }
        }
      } catch (err) {
        console.error('Échec de la synchro', err)
      }
      return null
    })

  const results = await Promise.all(syncPromises)
  const newComments = results.filter(Boolean) // Supprime les valeurs null du tableau final

  return newComments
}

export async function syncPendingRecipes() {
  const recipes = (await getPendingRecipes()) as TFullRecipe[]

  const syncPromises = recipes.map(async (recipe) => {
    try {
      if (recipe.offlineDelete) {
        const response = await fetch(`/api/recipe?id=${recipe.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await deleteRecipe(recipe.id)
          return null
        }
      } else {
        const formData = recipeToFormData(recipe, recipe.authorId, null)

        if (recipe.image) {
          const imageFile = await urlToFile(recipe.image, recipe.title)
          formData.append('image', imageFile)
        }
        if (recipe.imageToDelete) {
          formData.append('imageToDelete', recipe.imageToDelete)
        }

        const response = await fetch('/api/recipe', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          let newComments: { id: number }[] = []

          const newRecipe = await response.json()

          if (containsPendingComments(recipe)) {
            newComments = await syncPendingComments({
              ...recipe,
              id: newRecipe.id,
            })

            // supprime les commentaires supprimés
            const commentsToDelete = recipe.comments.filter(
              (comment) => comment.offlineDelete,
            )
            newRecipe.comments = newRecipe.comments.filter(
              (comment: { id: number }) =>
                !commentsToDelete.some((c) => c.id === comment.id),
            )

            // remplace les commentaires existants
            newRecipe.comments = newRecipe.comments.map(
              (comment: { id: number }) => {
                const editedComment = newComments.find(
                  (newComment) => newComment.id === comment.id,
                )

                return editedComment ?? comment
              },
            )

            // ajoute les nouveaux commentaires
            const commentsCreated = newComments.filter((newComment) =>
              recipe.comments.every((comment) => comment.id !== newComment.id),
            )

            newRecipe.comments.push(...commentsCreated)
          }
          await deleteRecipe(recipe.id)

          return newRecipe
        }
      }
    } catch (err) {
      console.error('Échec de la synchro', err)
    }
    return null
  })

  const results = await Promise.all(syncPromises)
  return results.filter(Boolean) // Supprime les valeurs null du tableau final
}
