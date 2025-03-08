'use client'

import { Button } from '@/ui/button'
import { saveRecipeOffline } from '@/utils/db'
import { Edit, Send } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'
import { TFullRecipe } from '../../components/addRecipe/addRecipe.schema'

export default function UpdateComment({
  commentId,
  isEditing,
  setIsEditing,
  newContent,
  recipe,
  setRecipe,
  synchronizing,
}: {
  commentId: number
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  newContent: string
  recipe: TFullRecipe
  setRecipe: (recipe: TFullRecipe) => void
  synchronizing?: boolean
}) {
  const [isLoading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (isEditing) {
      if (navigator.onLine) {
        setLoading(true)
        const res = await fetch(`/api/comments`, {
          method: 'PUT',
          body: JSON.stringify({ commentId, content: newContent }),
        })

        if (res.ok) {
          const comment = await res.json()

          const newRecipe = {
            ...recipe,
            comments: recipe.comments.map((c) =>
              c.id === comment.id ? comment : c,
            ),
          }

          setRecipe(newRecipe)
          toast.success('Comment updated')
        }
        setLoading(false)
      } else {
        const newRecipe = {
          ...recipe,
          comments: recipe.comments.map((c) =>
            c.id === commentId
              ? { ...c, content: newContent, syncPending: true }
              : c,
          ),
        }

        saveRecipeOffline(newRecipe)

        setRecipe(newRecipe)
        toast.success('Comment updated offline')
      }
    }
    setIsEditing((prev) => !prev)
  }

  return (
    <Button
      size={'icon'}
      onClick={handleSubmit}
      disabled={isLoading || synchronizing}
    >
      {isEditing ? <Send /> : <Edit />}
    </Button>
  )
}
