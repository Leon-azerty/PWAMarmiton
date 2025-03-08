'use client'

import { getAllRecipes } from '@/utils/data'
import { useEffect, useState } from 'react'
import CommentsList from '../(auth)/[id]/components/commentsList'
import CommentUpdate from '../(auth)/[id]/components/commentUpdate'
import PostComment from '../(auth)/[id]/components/postComment'
import { TFullRecipe } from '../(auth)/components/addRecipe/addRecipe.schema'

interface IRecipeInfoWrapperProps {
  recipeId: number
  userId: number | undefined
  userEmail: string | undefined
}

export default function RecipeInfoWrapper(props: IRecipeInfoWrapperProps) {
  const [recipe, setRecipe] = useState<TFullRecipe | null | undefined>(
    undefined,
  )

  useEffect(() => {
    async function loadRecipes() {
      try {
        const data = await getAllRecipes()
        const recipe = data.find((recipe) => recipe.id === props.recipeId)
        setRecipe(recipe ?? null)
      } catch (error) {
        console.error('Impossible de récupérer les recettes', error)
      }
    }

    loadRecipes()
  }, [])

  if (props.recipeId === -1) {
    return <p>Invalid recipe ID</p>
  }

  if (recipe === undefined) {
    return <p>Loading recipe...</p>
  }

  if (recipe === null) {
    return <p>No recipe with this ID</p>
  }

  return (
    <>
      {recipe.offlineDelete && (
        <p className="mt-4 text-destructive">
          This recipe will be deleted the next time you will be connected to
          internet. Comment actions have been suspended.
        </p>
      )}
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-48 w-full object-cover"
        />
      )}
      <h1 className="text-3xl">{recipe.title}</h1>
      <p className="text-xl font-semibold">{recipe.description}</p>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <ul className="list-disc pl-5 text-lg">
          {recipe.ingredients.map((ingredient) => (
            <li key={`ingredient-${ingredient.id}`}>
              {ingredient.label.trim()}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Preparation Steps</h2>
        <ol className="list-decimal pl-5 text-lg">
          {recipe.steps.map((step) => (
            <li key={`step-${step.id}`}>{step.label.trim()}</li>
          ))}
        </ol>
      </div>

      <div>
        <h1 className="text-4xl">Comments</h1>
        {!recipe.offlineDelete && props.userEmail && props.userId && (
          <PostComment
            recipe={recipe}
            setRecipe={setRecipe}
            userEmail={props.userEmail}
            userId={props.userId}
          />
        )}
        {recipe.comments && recipe.comments.length > 0 ? (
          <CommentsList
            recipe={recipe}
            userId={props.userId}
            setRecipe={setRecipe}
          />
        ) : (
          <p>No comment have been posted yet</p>
        )}
      </div>
      <CommentUpdate recipe={recipe} setRecipe={setRecipe} />
    </>
  )
}
