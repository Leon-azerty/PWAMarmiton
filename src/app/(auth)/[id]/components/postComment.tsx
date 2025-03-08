'use client'

import { Button } from '@/ui/button'
import { TextArea } from '@/ui/textarea'
import { saveRecipeOffline } from '@/utils/db'
import { useState } from 'react'
import { toast } from 'sonner'
import type { TFullRecipe } from '../../components/addRecipe/addRecipe.schema'

interface IPostCommentProps {
  recipe: TFullRecipe
  setRecipe: (recipe: TFullRecipe) => void
  userEmail: string
  userId: number
}

export default function PostComment(props: IPostCommentProps) {
  const [content, setContent] = useState('')
  const [isLoading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (navigator.onLine) {
      setLoading(true)
      const res = await fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          content,
          recipeId: props.recipe.id,
        }),
      })
      if (res.ok) {
        const data = await res.json()

        props.setRecipe({
          ...props.recipe,
          comments: [...props.recipe.comments, data],
        })

        toast.success('Comment posted')
        setContent('')
      }
      setLoading(false)
    } else {
      const newComment = {
        content,
        recipeId: props.recipe.id,
        id: Date.now(),
        createdAt: new Date(),
        author: {
          email: props.userEmail,
        },
        authorId: props.userId,
        syncPending: true,
      }

      const newRecipe = {
        ...props.recipe,
        comments: [...props.recipe.comments, newComment],
      }

      saveRecipeOffline(newRecipe)

      props.setRecipe(newRecipe)

      toast.success('Comment posted offline')
      setContent('')
    }
  }

  return (
    <section className="flex w-full justify-center ">
      <div className="flex w-[800px] items-end space-x-4">
        <TextArea
          placeholder="add comments"
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />
        <Button onClick={handleSubmit} disabled={isLoading}>
          Submit
        </Button>
      </div>
    </section>
  )
}
