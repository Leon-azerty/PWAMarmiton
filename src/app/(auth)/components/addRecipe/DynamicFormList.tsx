import { Button } from '@/ui/button'
import { FormControl, FormField, FormItem, FormMessage } from '@/ui/form'
import { Input } from '@/ui/input'
import { IngredientList } from '@prisma/client'
import { Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { THandleRecipeData } from './addRecipe.schema'

function AddButton({
  singular,
  append,
}: {
  singular: string
  append: (data: { label: string }) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <p className="text-sm text-input">Add {singular}</p>
      <Button type="button" onClick={() => append({ label: '' })}>
        <Plus />
      </Button>
    </div>
  )
}

interface DynamicFormListProps {
  name: 'ingredients' | 'steps'
  title: string
  placeholder: string
}

export default function DynamicFormList({
  name,
  title,
  placeholder,
}: DynamicFormListProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<THandleRecipeData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })

  const [ingredients, setIngredients] = useState<IngredientList[]>([])

  useEffect(() => {
    if (name === 'ingredients') {
      fetchIngredients()
    }
  }, [])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')

      if (response.ok) {
        const data = await response.json()

        setIngredients(data)
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    }
  }

  const singular = title.slice(0, -1).toLowerCase()
  const plurial = title.toLowerCase()

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm">{title}</h2>
      <div className="flex flex-col gap-2 rounded border border-input px-2 py-1">
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <FormField
              key={field.id}
              control={control}
              name={`${name}.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex w-full items-center justify-between gap-2">
                    <FormControl>
                      {plurial === 'ingredients' ? (
                        <select
                          {...field}
                          className="w-full rounded border p-2"
                        >
                          <option value="">Select an ingredient</option>
                          {ingredients.map((ingredient) => (
                            <option
                              key={`ingredient-${ingredient.id}`}
                              value={ingredient.label}
                            >
                              {ingredient.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          placeholder={placeholder}
                          {...field}
                          autoComplete="off"
                        />
                      )}
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="destructive"
                    >
                      <Minus />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-input">No {plurial} added for now</p>
            <AddButton append={append} singular={singular} />
          </div>
        )}
        {errors?.[name] && fields.length === 0 && (
          <p className="text-destructive">
            There must be at least one {singular}
          </p>
        )}
        {fields.length > 0 && <AddButton append={append} singular={singular} />}
      </div>
    </div>
  )
}
