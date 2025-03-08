'use client'

import { Button } from '@/ui/button'
import { isDateId, saveRecipeOffline } from '@/utils/db'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TFullRecipe } from '../../components/addRecipe/addRecipe.schema'

interface IDeleteCommentProps {
  commentId: number
  recipe: TFullRecipe
  setRecipe: (recipe: TFullRecipe) => void
  synchronizing?: boolean
}

export default function DeleteComment(props: IDeleteCommentProps) {
  const [isLoading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (navigator.onLine) {
      setLoading(true)
      const res = await fetch(`/api/comments`, {
        method: 'DELETE',
        body: JSON.stringify({ commentId: props.commentId }),
      })
      if (res.ok) {
        const data = await res.json()

        props.setRecipe({
          ...props.recipe,
          comments: props.recipe.comments.filter(
            (comment) => comment.id !== data.id,
          ),
        })

        toast.success('Comment deleted')
      }
      setLoading(false)
    } else {
      if (isDateId(props.commentId)) {
        // le commentaire n'existe que dans la BDD de Chrome
        const newRecipe = {
          ...props.recipe,
          comments: props.recipe.comments.filter(
            (comment) => comment.id !== props.commentId,
          ),
        }

        saveRecipeOffline(newRecipe)
        props.setRecipe(newRecipe)
      } else {
        // le commentaire est dans supabase/docker
        const newRecipe = {
          ...props.recipe,
          comments: props.recipe.comments.map((c) =>
            c.id === props.commentId
              ? { ...c, syncPending: true, offlineDelete: true }
              : c,
          ),
        }

        saveRecipeOffline(newRecipe)
        props.setRecipe(newRecipe)
      }
      toast.success('Comment deleted offline')
    }
  }

  return (
    <Button
      variant={'destructive'}
      size={'icon'}
      onClick={handleSubmit}
      disabled={isLoading || props.synchronizing}
    >
      <Trash />
    </Button>
  )
}
