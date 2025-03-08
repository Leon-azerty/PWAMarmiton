import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const getUser = cache(async () => {
  const session = await verifySession()

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })
  if (user === null) {
    return redirect('/login')
  }
  return user
})
