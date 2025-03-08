'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/ui/card'
import { getAllRecipes } from '@/utils/data'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { TFullRecipe } from '../addRecipe/addRecipe.schema'
import RecipeActions from './recipeActions'
import RecipeUpdate from './recipeUpdate'

interface IRecipeListProps {
  userId: number | undefined
  recipes: TFullRecipe[]
  setRecipes: (recipes: TFullRecipe[]) => void
  favoritesOnly?: boolean
  search: string
}

export default function RecipeList(props: IRecipeListProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecipes() {
      setLoading(true)

      try {
        const data = await getAllRecipes()
        props.setRecipes(data)
      } catch (error) {
        console.error('Impossible de récupérer les recettes', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [props.setRecipes])

  const recipesToDisplay = (
    props.favoritesOnly
      ? props.recipes.filter((recipe) => recipe.isFavorite)
      : props.recipes.filter((recipe) => !recipe.localFavorite)
  ).filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(props.search.toLowerCase()) ||
      recipe.ingredients.some((ingredient) =>
        ingredient.label.toLowerCase().includes(props.search.toLowerCase()),
      ),
  )

  const sortedRecipe = recipesToDisplay
    ? recipesToDisplay.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : []

  return (
    <section className="w-full">
      <RecipeUpdate recipes={props.recipes} setRecipes={props.setRecipes} />
      {loading ? (
        <p>Loading...</p>
      ) : sortedRecipe.length > 0 ? (
        <div className="flex flex-col gap-1">
          {sortedRecipe.map((recipe) => (
            <Card
              key={recipe.id}
              className={cn(
                'flex w-full flex-col gap-1',
                !recipe.offlineDelete ||
                  (props.favoritesOnly && 'hover:bg-secondary'),
              )}
            >
              {recipe.offlineDelete && !props.favoritesOnly ? (
                <p className="px-2 pt-2 text-sm italic text-destructive">
                  Recipe <span className="font-semibold">{recipe.title}</span>{' '}
                  deleted offline
                </p>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <Link className="flex flex-1 gap-2" href={`/${recipe.id}`}>
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex flex-col gap-2">
                      <h2>{recipe.title}</h2>
                      <p>{recipe.description}</p>
                    </div>
                  </Link>

                  {props.userId && (
                    <RecipeActions
                      recipe={recipe}
                      userId={props.userId}
                      recipes={props.recipes}
                      setRecipes={props.setRecipes}
                      synchronizing={navigator.onLine && recipe.syncPending}
                    />
                  )}
                </div>
              )}

              {recipe.syncPending && (
                <p className="px-2 pb-2 text-sm italic text-neutral-400">
                  Waiting for synchronization...
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p>No recipes found</p>
      )}
    </section>
  )
}
