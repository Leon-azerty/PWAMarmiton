import { sendNotification } from '@/app/(auth)/common/ServiceWorkerListener/pushNotif.action'
import {
  handleRecipeSchema,
  idSchema,
} from '@/app/(auth)/components/addRecipe/addRecipe.schema'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialisation du client Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function transformData(data: Record<string, unknown>) {
  return {
    id: data.id ? Number(data.id) : null,
    title: data.title,
    description: data.description,
    authorId: data.authorId ? Number(data.authorId) : null,
    ingredients: Object.keys(data)
      .filter((key) => key.startsWith('ingredients['))
      .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))
      .map((key) => ({ label: data[key] })),
    steps: Object.keys(data)
      .filter((key) => key.startsWith('steps['))
      .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))
      .map((key) => ({ label: data[key] })),
    image: data.image,
    favoritedBy: data.favoritedBy ? (data.favoritedBy as number[]) : [],
    comments: data.comments ?? [],
  }
}

// Fonction pour uploader une image sur Supabase
async function uploadImageToSupabase(
  file: File,
  userId: number,
): Promise<string | null> {
  const fileName = `recipes/${userId}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('Error uploading image:', error)
    return null
  }

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${fileName}`
}

// Fonction pour supprimer une image de Supabase
async function deleteImageFromSupabase(imageUrl: string) {
  const filePath = imageUrl.split('/storage/v1/object/public/images/')[1]

  if (!filePath) return

  const { error } = await supabase.storage.from('images').remove([filePath])

  if (error) {
    console.error('Error deleting image:', error)
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const rawData = Object.fromEntries(formData.entries())
    const data = transformData({ ...rawData, image: null })

    const parsedData = handleRecipeSchema.safeParse(data)
    const authorId = idSchema.safeParse(rawData.authorId)

    if (!parsedData.success || !authorId.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    let imageUrl: string | null | undefined
    const imageFile = formData.get('image') as File | null
    const imageToDelete = formData.get('imageToDelete') as string | null

    if (imageFile) {
      imageUrl = await uploadImageToSupabase(imageFile, authorId.data)
    }

    if (imageToDelete) {
      await deleteImageFromSupabase(imageToDelete)
      if (!imageFile) imageUrl = null
    }

    const recipe = parsedData.data.id
      ? await prisma.recipe.update({
          where: { id: parsedData.data.id },
          data: {
            title: parsedData.data.title,
            description: parsedData.data.description,
            ingredients: {
              deleteMany: {},
              createMany: { data: parsedData.data.ingredients },
            },
            steps: {
              deleteMany: {},
              createMany: { data: parsedData.data.steps },
            },
            image: imageUrl,
            authorId: authorId.data,
          },
        })
      : await prisma.recipe.create({
          data: {
            title: parsedData.data.title,
            description: parsedData.data.description,
            ingredients: { createMany: { data: parsedData.data.ingredients } },
            steps: { createMany: { data: parsedData.data.steps } },
            image: imageUrl,
            authorId: authorId.data,
          },
        })

    const [ingredients, steps, comments] = await Promise.all([
      prisma.ingredient.findMany({
        where: { recipeId: recipe.id },
        select: { id: true, label: true },
      }),
      prisma.step.findMany({
        where: { recipeId: recipe.id },
        select: { id: true, label: true },
      }),
      prisma.comment.findMany({
        where: { recipeId: recipe.id },
        include: {
          author: {
            select: {
              email: true,
            },
          },
        },
      }),
    ])

    console.log('new recipe created sending notification to everyone ', recipe)
    sendNotification('New recipe added from a user', undefined, `/${recipe.id}`)

    return NextResponse.json(
      { ...recipe, ingredients, steps, comments },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error handling recipe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = idSchema.safeParse(searchParams.get('id'))

    if (!id.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    }

    const recipe = await prisma.recipe.delete({ where: { id: id.data } })

    if (recipe.image) {
      await deleteImageFromSupabase(recipe.image)
    }

    return NextResponse.json({ message: 'Recipe deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error occurred while deleting recipe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const response = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        ingredients: true,
        steps: true,
        comments: {
          include: {
            author: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    })
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error occurred while fetching recipes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
