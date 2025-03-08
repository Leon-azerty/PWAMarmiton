import { sendNotification } from '@/app/(auth)/common/ServiceWorkerListener/pushNotif.action'
import {
  addCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from '@/app/(auth)/components/addRecipe/addRecipe.schema'
import { getUser } from '@/app/common/user'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST pour créer un comment
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsedData = addCommentSchema.safeParse(body)
    const user = await getUser()

    if (!parsedData.success) {
      console.error('Invalid request body')
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    if (!user) {
      console.error('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    const { content, recipeId } = parsedData.data

    const newComment = await prisma.comment.create({
      data: {
        content,
        recipeId,
        authorId: user.id,
      },
      include: {
        author: true,
        recipe: {
          include: {
            author: true,
          },
        },
      },
    })

    sendNotification(
      'Someone commented on your recipe',
      newComment.recipe.author.id,
      `/${recipeId}`,
    )

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Error occurred while adding comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// PUT update un de nos comments
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const parsedData = updateCommentSchema.safeParse(body)
    const user = await getUser()

    if (!parsedData.success) {
      console.error('Invalid request body')
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    if (!user) {
      console.error('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    const { commentId, content } = parsedData.data

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
      },
      include: {
        author: true,
      },
    })

    return NextResponse.json(updatedComment, { status: 201 })
  } catch (error) {
    console.error('Error occurred while adding comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// DELETE un de mes comments
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const parsedData = deleteCommentSchema.safeParse(body)
    const user = await getUser()

    if (!parsedData.success) {
      console.error('Invalid request body')
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    if (!user) {
      console.error('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    const { commentId } = parsedData.data

    const deletedComment = await prisma.comment.delete({
      where: {
        id: commentId,
      },
    })

    return NextResponse.json(deletedComment, { status: 201 })
  } catch (error) {
    console.error('Error occurred while adding comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
