'use client'

import { formatDateTime } from '@/lib/day'
import { CardContent, CardDescription } from '@/ui/card'
import { TextArea } from '@/ui/textarea'
import { useState } from 'react'
import {
  TCommentData,
  TFullRecipe,
} from '../../components/addRecipe/addRecipe.schema'
import DeleteComment from './deleteComment'
import UpdateComment from './updateComment'

interface ICommentActionsProps {
  currentComment: TCommentData
  userId: number | undefined
  recipe: TFullRecipe
  setRecipe: (recipe: TFullRecipe) => void
  synchronizing?: boolean
}

export default function CommentsActions(props: ICommentActionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newContent, setNewContent] = useState('')

  return (
    <>
      <CardContent className="flex w-full">
        {isEditing ? (
          <TextArea
            defaultValue={props.currentComment.content}
            onChange={(e) => setNewContent(e.target.value)}
          ></TextArea>
        ) : (
          props.currentComment.content
        )}
      </CardContent>
      <CardDescription className="flex min-w-fit flex-col items-center">
        {formatDateTime(props.currentComment.createdAt)}
        {props.userId == props.currentComment.authorId && (
          <span className="flex gap-2">
            <UpdateComment
              commentId={props.currentComment.id}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              newContent={newContent}
              recipe={props.recipe}
              setRecipe={props.setRecipe}
            />
            <DeleteComment
              commentId={props.currentComment.id}
              recipe={props.recipe}
              setRecipe={props.setRecipe}
            />
          </span>
        )}
      </CardDescription>
    </>
  )
}
