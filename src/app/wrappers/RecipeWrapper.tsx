'use client'

import { useState } from 'react'
import type { TFullRecipe } from '../(auth)/components/addRecipe/addRecipe.schema'
import RecipeList from '../(auth)/components/recipeList/recipeList'
import RecipeManagerCard from '../(auth)/components/recipeManagerCard/recipeManagerCard'
import Search from '../(auth)/components/Search'

interface IRecipeWrapperProps {
  userId: number | undefined
  favoritesOnly?: boolean
}

export default function RecipeWrapper(props: IRecipeWrapperProps) {
  const [recipes, setRecipes] = useState<TFullRecipe[]>([])
  const [search, setSearch] = useState('')

  return (
    <>
      <Search search={search} setSearch={setSearch} />
      {!props.favoritesOnly && props.userId && (
        <RecipeManagerCard
          userId={props.userId}
          recipes={recipes}
          setRecipes={setRecipes}
        />
      )}
      <RecipeList
        userId={props.userId}
        recipes={recipes}
        setRecipes={setRecipes}
        favoritesOnly={props.favoritesOnly}
        search={search}
      />
    </>
  )
}
