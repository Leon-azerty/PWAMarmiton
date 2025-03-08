'use client'

import { isDateId, syncPendingRecipes } from '@/utils/db'
import { useEffect, useRef } from 'react'
import type { TFullRecipe } from '../addRecipe/addRecipe.schema'

interface IRecipeUpdateProps {
  recipes: TFullRecipe[]
  setRecipes: (recipes: TFullRecipe[]) => void
}

export default function RecipeUpdate(props: IRecipeUpdateProps) {
  const isSyncing = useRef(false)

  useEffect(() => {
    const checkInternetConnection = async () => {
      if (isSyncing.current) return // Empêche d'exécuter plusieurs syncs en parallèle
      if (
        navigator.onLine &&
        props.recipes.some((recipe) => recipe.syncPending)
      ) {
        isSyncing.current = true

        // on synchronise les recettes + on récup le retour de leur fetch
        const newRecipes = await syncPendingRecipes()

        // on remplace les recette modifiées en offline
        const updatedRecipes = props.recipes.map((recipe) => {
          if (newRecipes.length > 0) {
            const newRecipe = !isDateId(recipe.id)
              ? newRecipes.find((r) => r.id === recipe.id)
              : undefined

            if (newRecipe) {
              // on enlève la recette des new recipes vu qu'elle existe déjà, on la met juste à jour
              newRecipes.splice(newRecipes.indexOf(newRecipe), 1)
              return newRecipe
            }
          }

          return recipe
        })

        // on enlève toutes les recettes en synchro
        const clearPending = updatedRecipes.filter(
          (recipe) => !recipe.syncPending,
        )

        // on met à jour les recettes avec les nouvelles
        props.setRecipes([...newRecipes, ...clearPending])

        isSyncing.current = false
      }
    }

    // Vérification initiale
    checkInternetConnection()

    // Vérifie toutes les 2 secondes
    const interval = setInterval(checkInternetConnection, 2000)

    return () => clearInterval(interval)
  }, [props.recipes])

  return null
}
