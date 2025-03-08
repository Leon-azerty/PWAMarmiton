import { notFound } from 'next/navigation'
import { getUser } from '../../common/user'
import RecipeWrapper from '../../wrappers/RecipeWrapper'

export default async function Page() {
  const user = await getUser()

  if (!user) {
    return notFound()
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center space-y-2 p-24">
      <RecipeWrapper userId={user.id} favoritesOnly />
    </main>
  )
}
