import { getUser } from '../common/user'
import RecipePageHandler from '../wrappers/RecipePageHandler'

export default async function Home() {
  const user = await getUser()

  return (
    <main className="h-full w-full">
      <RecipePageHandler userId={user?.id} userEmail={user?.email} />
    </main>
  )
}
