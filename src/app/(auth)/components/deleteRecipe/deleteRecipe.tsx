'use client'

import { Button } from '@/ui/button'
import { DialogClose } from '@/ui/dialog'
import { deleteRecipe, isDateId, saveRecipeOffline } from '@/utils/db'
import { useState } from 'react'
import { toast } from 'sonner'
import type { TFullRecipe } from '../addRecipe/addRecipe.schema'

interface IDeleteRecipeProps {
  id: number
  setOpen: (open: boolean) => void
  recipes: TFullRecipe[]
  setRecipes: (recipes: TFullRecipe[]) => void
}

export default function DeleteRecipe(props: IDeleteRecipeProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onDelete = async () => {
    setIsLoading(true)
    if (navigator.onLine) {
      const response = await fetch(`/api/recipe?id=${props.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        props.setOpen(false)
        toast.success('Recipe deleted')
        props.setRecipes(
          props.recipes.filter((recipe) => recipe.id !== props.id),
        )
      }
    } else {
      const recipe = props.recipes.find((r) => r.id === props.id)

      if (recipe) {
        if (isDateId(recipe.id)) {
          await deleteRecipe(props.id)
          props.setRecipes(props.recipes.filter((r) => r.id !== props.id))
        } else {
          const newRecipe = {
            ...recipe,
            offlineDelete: true,
            syncPending: true,
          }
          saveRecipeOffline(newRecipe)
          props.setRecipes([
            newRecipe,
            ...props.recipes.filter((r) => r.id !== props.id),
          ])
        }
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="flex justify-center gap-2">
      <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
        Delete
      </Button>
      <Button variant="secondary" asChild>
        <DialogClose>Cancel</DialogClose>
      </Button>
    </div>
  )
}
