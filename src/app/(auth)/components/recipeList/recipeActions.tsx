'use client'

import DialogWrapper from '@/app/wrappers/DialogWrapper'
import { Edit, Star, Trash } from 'lucide-react'
import { useState } from 'react'
import AddRecipe from '../addRecipe/addRecipe'
import type { TFullRecipe } from '../addRecipe/addRecipe.schema'
import DeleteRecipe from '../deleteRecipe/deleteRecipe'

import { Button } from '@/ui/button'
import { Dialog, DialogTrigger } from '@/ui/dialog'
import { sendNotification } from '../../common/ServiceWorkerListener/pushNotif.action'

interface IRecipeActionsProps {
  userId: number
  recipe: TFullRecipe
  recipes: TFullRecipe[]
  setRecipes: (recipes: TFullRecipe[]) => void
  synchronizing?: boolean
}

export default function RecipeActions(props: IRecipeActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  async function toggleFavorite() {
    const updatedRecipes = props.recipes.map((recipe) => {
      if (recipe.id === props.recipe.id) {
        return { ...recipe, isFavorite: !props.recipe.isFavorite }
      }
      return recipe
    })

    props.setRecipes(updatedRecipes)

    const favoriteRecipes = updatedRecipes.filter((recipe) => recipe.isFavorite)
    localStorage.setItem('favorite', JSON.stringify(favoriteRecipes))
    sendNotification(
      'Someone added/remove your recipe to their favorites !',
      props.recipe.authorId,
      `/${props.recipe.id}`,
    )
  }

  return (
    <div className="flex items-center gap-2">
      {props.userId === props.recipe.authorId && (
        <DialogWrapper
          synchronizing={props.synchronizing}
          trigger={<Edit />}
          title="Edit a recipe"
          description="Edit your recipe..."
          content={
            <AddRecipe
              defaultValues={{
                ...props.recipe,
                createdAt: new Date(props.recipe.createdAt),
              }}
              setOpen={setEditDialogOpen}
              userId={props.userId}
              recipes={props.recipes}
              setRecipes={props.setRecipes}
            />
          }
          variant="default"
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
        />
      )}

      <Dialog>
        <Button
          asChild
          variant="outline"
          onClick={() => toggleFavorite()}
          disabled={props.synchronizing}
        >
          <DialogTrigger>
            {props.recipe.isFavorite ? (
              <Star className="text-yellow-700" style={{ fill: 'yellow' }} />
            ) : (
              <Star className="text-black-500" />
            )}
          </DialogTrigger>
        </Button>
      </Dialog>

      {props.userId === props.recipe.authorId && (
        <DialogWrapper
          synchronizing={props.synchronizing}
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          trigger={<Trash />}
          title="Are you sure to delete your recipe ?"
          description="Your recipe will be completely deleted from the database"
          content={
            <DeleteRecipe
              id={props.recipe.id}
              setOpen={setDeleteDialogOpen}
              recipes={props.recipes}
              setRecipes={props.setRecipes}
            />
          }
          variant="destructive"
        />
      )}
    </div>
  )
}
