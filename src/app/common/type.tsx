import type { Ingredient, Recipe, Step } from '@prisma/client'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2).max(50),
})

export const uploadSchema = z.object({
  url: z.string().min(2).max(50),
})

export type FormResult = {
  type: 'error' | 'success' | undefined
  message: string
}
