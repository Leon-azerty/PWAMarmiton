import type { TFullRecipe } from '@/app/(auth)/components/addRecipe/addRecipe.schema'
import { getPendingRecipes } from './db'

export async function getAllRecipes(): Promise<TFullRecipe[]> {
  const response = await fetch('/api/recipe')
  if (!response.ok) throw new Error('Réponse non valide')

  const favoriteRecipes: TFullRecipe[] = JSON.parse(
    localStorage.getItem('favorite') ?? '[]',
  )

  const data = await response.json()
  if (Array.isArray(data)) {
    const pendingRecipes = (await getPendingRecipes()) as TFullRecipe[]
    const newPendingRecipes = pendingRecipes.filter(
      (recipe) => !data.some((r) => r.id === recipe.id),
    )
    const newData = data.map((recipe) => {
      const pendingRecipe = pendingRecipes.find((r) => r.id === recipe.id)

      if (pendingRecipe) {
        return pendingRecipe
      }
      return recipe
    })

    const recipes = [...newPendingRecipes, ...newData]

    const favoriteRecipesIds = favoriteRecipes.map((recipe) => recipe.id)

    const updatedRecipes = recipes.map((recipe) => {
      if (favoriteRecipesIds.includes(recipe.id)) {
        return { ...recipe, isFavorite: true }
      }
      return recipe
    })

    const localFavoriteRecipes = favoriteRecipes
      .filter((recipe) => !updatedRecipes.some((r) => r.id === recipe.id))
      .map((recipe) => ({ ...recipe, isFavorite: true, localFavorite: true }))

    return [...localFavoriteRecipes, ...updatedRecipes]
  }

  return []
}
