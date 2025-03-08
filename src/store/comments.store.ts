import { Prisma } from '@prisma/client'
import { create } from 'zustand'

interface CommentsState {
  comments: Prisma.CommentGetPayload<{
    include: { author: { select: { email: true } } }
  }>[]
  setComments: (
    comments: Prisma.CommentGetPayload<{
      include: { author: { select: { email: true } } }
    }>[],
  ) => void
  addComment: (
    comment: Prisma.CommentGetPayload<{
      include: { author: { select: { email: true } } }
    }>,
  ) => void
  removeComment: (commentId: number) => void
  updateComment: (
    comment: Prisma.CommentGetPayload<{
      include: { author: { select: { email: true } } }
    }>,
  ) => void
}

export const useCommentsStore = create<CommentsState>()((set) => ({
  comments: [],
  setComments: (
    comments: Prisma.CommentGetPayload<{
      include: { author: { select: { email: true } } }
    }>[],
  ) => set({ comments }),

  addComment: (
    comment: Prisma.CommentGetPayload<{
      include: { author: { select: { email: true } } }
    }>,
  ) =>
    set((state) => ({
      comments: [
        ...state.comments,
        {
          ...comment,
          author: { ...comment.author, email: comment.author.email },
        },
      ],
    })),

  removeComment: (commentId: number) =>
    set((state) => ({
      comments: state.comments.filter((comment) => comment.id !== commentId),
    })),
  updateComment: (
    comment: Prisma.CommentGetPayload<{
      include: { author: { select: { email: true } } }
    }>,
  ) =>
    set((state) => ({
      comments: state.comments.map((r) => (r.id === comment.id ? comment : r)),
    })),
}))
