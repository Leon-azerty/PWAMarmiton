'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import RecipeInfoWrapper from './RecipeInfoWrapper'
import RecipeWrapper from './RecipeWrapper'

interface IRecipePageHandlerProps {
  userId: number | undefined
  userEmail: string | undefined
}

export default function RecipePageHandler(
  props: IRecipePageHandlerProps,
): JSX.Element {
  const pathname = usePathname()
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)

  useEffect(() => {
    setCurrentUrl(pathname)
  }, [pathname])

  if (!currentUrl) {
    return <p>Loading...</p>
  }

  if (currentUrl === '/settings' || currentUrl === '/login') {
    return <p className="p-24">Page not accessible offline</p>
  }

  if (currentUrl === '/favorite' && props.userId) {
    return (
      <section className="flex min-h-screen w-full flex-col items-center space-y-2 p-24">
        <RecipeWrapper userId={props.userId} favoritesOnly />
      </section>
    )
  }

  if (currentUrl === '/') {
    return (
      <section className="flex min-h-screen w-full flex-col items-center space-y-2 p-24">
        <RecipeWrapper userId={props.userId} />
      </section>
    )
  }

  const id = currentUrl.split('/').pop()

  const recipeId = id ? Number(id) : -1

  return (
    <section className="mt-8 flex flex-col items-start gap-12">
      <RecipeInfoWrapper
        recipeId={!isNaN(recipeId) ? recipeId : -1}
        userId={props.userId}
        userEmail={props.userEmail}
      />
    </section>
  )
}
