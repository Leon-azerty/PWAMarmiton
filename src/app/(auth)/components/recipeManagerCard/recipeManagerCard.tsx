'use client'

import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog'
import { useState } from 'react'
import AddRecipe from '../addRecipe/addRecipe'
import type { TFullRecipe } from '../addRecipe/addRecipe.schema'

interface IRecipeManagerCardProps {
  userId: number
  recipes: TFullRecipe[]
  setRecipes: (recipes: TFullRecipe[]) => void
}

export default function RecipeManagerCard(props: IRecipeManagerCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="w-full">
      <CardContent className="flex p-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <Button asChild>
            <DialogTrigger>Add Recipe</DialogTrigger>
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Recipe</DialogTitle>
              <DialogDescription>Add your recipe...</DialogDescription>
            </DialogHeader>
            <AddRecipe
              setOpen={setOpen}
              userId={props.userId}
              recipes={props.recipes}
              setRecipes={props.setRecipes}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
