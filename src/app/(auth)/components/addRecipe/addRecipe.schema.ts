import type { Recipe } from '@prisma/client'
import { z } from 'zod'

const REQUIRED_FIELD = 'This field is required.'

const requiredField = z.string().min(1, { message: REQUIRED_FIELD })

export const idSchema = z.coerce
  .number({ invalid_type_error: REQUIRED_FIELD })
  .min(0)

export const ingredientSchema = z.object({
  label: requiredField,
  id: idSchema.optional(),
})

export const stepSchema = z.object({
  label: requiredField,
  id: idSchema.optional(),
})

export const commentSchema = z.object({
  id: z.number(),
  content: z.string(),
  createdAt: z.coerce.date(),
  author: z.object({
    email: z.string(),
  }),
  authorId: idSchema,
  recipeId: idSchema,
})

export const handleRecipeSchema = z.object({
  title: requiredField,
  description: requiredField,
  ingredients: z
    .array(ingredientSchema)
    .min(1, 'You must add at least one ingredient'),
  steps: z.array(stepSchema).min(1, 'You must add at least one step'),
  id: idSchema.nullish(), // utilisé seulement pour la modification
  image: z.string().nullable(),
  createdAt: z.date().nullish(),
  comments: z.array(commentSchema),
})

export const addCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  recipeId: z.number(),
})

export const deleteCommentSchema = z.object({
  commentId: z.number(),
})

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  commentId: z.number(),
})

export type THandleRecipeData = z.infer<typeof handleRecipeSchema>
export type TIngredientData = z.infer<typeof ingredientSchema>
export type TStepData = z.infer<typeof stepSchema>
export type TCommentData = z.infer<typeof commentSchema> & {
  syncPending?: boolean
  offlineDelete?: boolean
}

export type TFullRecipe = Recipe & {
  ingredients: TIngredientData[]
  steps: TStepData[]
  isFavorite?: boolean
  comments: TCommentData[]
  syncPending?: boolean
  offlineDelete?: boolean
  imageToDelete?: string
  localFavorite?: boolean
}
