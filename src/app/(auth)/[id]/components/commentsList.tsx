'use client'

import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/tooltip'
import { CircleUserRound } from 'lucide-react'
import type { TFullRecipe } from '../../components/addRecipe/addRecipe.schema'
import CommentsActions from './commentsActions'

export default function CommentsList({
  recipe,
  userId,
  setRecipe,
}: {
  recipe: TFullRecipe
  userId: number | undefined
  setRecipe: (recipe: TFullRecipe) => void
}) {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-[500px] flex-col space-y-4">
        {recipe.comments.map((comment) => (
          <div key={comment.id} className="flex w-full justify-center">
            <Card className="flex min-h-20 w-full flex-col gap-1 p-2">
              {comment.offlineDelete ? (
                <p className="px-2 pb-2 text-sm italic text-destructive">
                  Comment deleted offline
                </p>
              ) : (
                <div className="flex w-full">
                  <CardHeader className="p-2">
                    <CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CircleUserRound />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{comment.author.email}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  {!recipe.offlineDelete && (
                    <CommentsActions
                      currentComment={comment}
                      userId={userId}
                      recipe={recipe}
                      setRecipe={setRecipe}
                    />
                  )}
                </div>
              )}
              {comment.syncPending && (
                <p className="px-2 pb-2 text-sm italic text-neutral-400">
                  Waiting for synchronization...
                </p>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
