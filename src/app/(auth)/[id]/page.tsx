import { getUser } from '@/app/common/user'
import RecipeInfoWrapper from '@/app/wrappers/RecipeInfoWrapper'
import { notFound } from 'next/navigation'
import { idSchema } from '../components/addRecipe/addRecipe.schema'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const params = await props.params

  const id = idSchema.safeParse(params.id)

  if (!id.success) {
    return notFound()
  }

  return (
    <section className="mt-8 flex flex-col gap-12">
      <RecipeInfoWrapper
        recipeId={id.data}
        userId={user?.id}
        userEmail={user?.email}
      />
    </section>
  )
}
