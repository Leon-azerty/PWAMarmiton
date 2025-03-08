'use client'

import { syncPendingRecipes } from '@/utils/db'
import { useEffect, useRef } from 'react'
import { TFullRecipe } from '../../components/addRecipe/addRecipe.schema'

interface IRecipeUpdateProps {
  recipe: TFullRecipe
  setRecipe: (recipe: TFullRecipe) => void
}

export default function RecipeUpdate(props: IRecipeUpdateProps) {
  const isSyncing = useRef(false)

  useEffect(() => {
    const checkInternetConnection = async () => {
      if (isSyncing.current) return // Empêche d'exécuter plusieurs syncs en parallèle
      if (
        navigator.onLine &&
        props.recipe.comments.some((comment) => comment.syncPending)
      ) {
        isSyncing.current = true

        // on synchronise les recettes + on récup le retour de leur fetch
        const newRecipes = await syncPendingRecipes()

        const correspondingRecipe = newRecipes.find(
          (recipe) => recipe.id === props.recipe.id,
        )

        if (correspondingRecipe) {
          props.setRecipe(correspondingRecipe)
        } else {
          // en vérité ça c'est pas le meilleur truc car 2 recipes peuvent
          // avoir le même titre et la même description mais ça fera l'affaire
          const recipeWithSameTitleAndSameDesc = newRecipes.find(
            (recipe) =>
              recipe.title === props.recipe.title &&
              recipe.description === props.recipe.description,
          )
          if (recipeWithSameTitleAndSameDesc) {
            window.location.href = `/${recipeWithSameTitleAndSameDesc.id}`
          } else {
            window.location.href = `/`
          }
        }

        isSyncing.current = false
      }
    }

    // Vérification initiale
    checkInternetConnection()

    // Vérifie toutes les 2 secondes
    const interval = setInterval(checkInternetConnection, 2000)

    return () => clearInterval(interval)
  }, [props.recipe])

  return null
}
