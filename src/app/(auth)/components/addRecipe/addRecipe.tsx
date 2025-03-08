'use client'

import { Button } from '@/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import { recipeToFormData, saveRecipeOffline } from '@/utils/db'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import DynamicFormList from './DynamicFormList'
import {
  type TFullRecipe,
  type THandleRecipeData,
  handleRecipeSchema,
  idSchema,
} from './addRecipe.schema'

interface IAddRecipeProps {
  userId: number
  defaultValues?: THandleRecipeData
  setOpen: (open: boolean) => void
  setRecipes: (recipes: TFullRecipe[]) => void
  recipes: TFullRecipe[]
}

export default function AddRecipe(props: IAddRecipeProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [imagePreview, setImagePreview] = useState<string | null>(
    props.defaultValues?.image ?? null,
  )
  const [fileName, setFileName] = useState<string | undefined>(
    imagePreview?.split('/').pop()?.split('-').slice(1).join('-'),
  )
  const [image, setImage] = useState<File | null>(null)

  const form = useForm<THandleRecipeData>({
    resolver: zodResolver(handleRecipeSchema),
    defaultValues: {
      title: '',
      description: '',
      ingredients: [],
      steps: [],
      comments: [],
      image: null,
      ...props.defaultValues,
    },
  })

  async function onSubmit(values: THandleRecipeData) {
    setIsLoading(true)

    const formData = recipeToFormData(values, props.userId, image)

    if (
      props.defaultValues?.image &&
      imagePreview !== props.defaultValues.image
    ) {
      formData.append('imageToDelete', props.defaultValues.image)
    }

    if (navigator.onLine) {
      const response = await fetch('/api/recipe', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        props.setOpen(false)

        const responseRecipe = await response.json()

        responseRecipe.createdAt = new Date(responseRecipe.createdAt)

        const parsedRecipe = handleRecipeSchema.safeParse(responseRecipe)

        if (!parsedRecipe.success) {
          toast.error('Error occurred while parsing recipe')
          console.error(
            'Error occurred while parsing recipe:',
            parsedRecipe.error,
          )
          return
        }

        const id = parsedRecipe.data.id
        const createdAt = parsedRecipe.data.createdAt
        const authorId = idSchema.safeParse(responseRecipe.authorId)

        if (!id || !authorId.success || !createdAt) {
          toast.error(
            'Error occurred while fetching recipe id or author id or createdAt',
          )
          return
        }

        const newRecipe = {
          ...parsedRecipe.data,
          id,
          createdAt,
          authorId: authorId.data,
        }

        if (values.id) {
          props.setRecipes(
            props.recipes.map((r) => (r.id === values.id ? newRecipe : r)),
          )
        } else {
          props.setRecipes([newRecipe, ...props.recipes])
        }

        toast.success(values.id ? 'Recipe updated' : 'Recipe added')
      }
    } else {
      const parsedData = handleRecipeSchema.safeParse(values)

      if (parsedData.success) {
        let imageData: string | null = props.defaultValues?.image ?? null

        if (image) {
          imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(image)
          })
        }

        let imageToDelete: string | undefined

        const isExistingRecipe = props.recipes.some(
          (r) => r.id === parsedData.data.id,
        )

        if (
          props.defaultValues?.image &&
          imagePreview !== props.defaultValues.image &&
          isExistingRecipe
        ) {
          imageToDelete = props.defaultValues.image
        }

        if (props.defaultValues?.image && !image) {
          imageData = null
        }

        const newRecipe = {
          ...parsedData.data,
          id: parsedData.data.id ?? Date.now(),
          createdAt: parsedData.data.createdAt ?? new Date(),
          authorId: props.userId,
          syncPending: true,
          image: imageData,
          imageToDelete,
        }
        saveRecipeOffline(newRecipe)
        if (isExistingRecipe) {
          // EDIT
          props.setRecipes(
            props.recipes.map((r) =>
              r.id === parsedData.data.id ? newRecipe : r,
            ),
          )
        } else {
          // ADD
          props.setRecipes([newRecipe, ...props.recipes])
        }
        props.setOpen(false)
        toast.success(
          values.id ? 'Recipe updated offline' : 'Recipe added offline',
        )
      }
    }

    setIsLoading(false)
  }

  const deleteImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  return (
    <section>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Chocolate Cake"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="A delicious chocolate cake"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DynamicFormList
            name="ingredients"
            title="Ingredients"
            placeholder="500g flour"
          />

          <DynamicFormList
            name="steps"
            title="Steps"
            placeholder="Mix ingredients"
          />

          <FormItem>
            <div className="flex flex-col gap-2">
              <FormLabel>Image (optional)</FormLabel>

              {imagePreview ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-input">
                    <span className="text-sm">{fileName}</span>
                    <button type="button" onClick={deleteImage}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <img src={imagePreview} alt="Preview" className="mt-2 w-32" />
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImage(file)
                      setImagePreview(URL.createObjectURL(file))
                      setFileName(file.name)
                    }
                  }}
                />
              )}
            </div>
          </FormItem>

          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </Form>
    </section>
  )
}
