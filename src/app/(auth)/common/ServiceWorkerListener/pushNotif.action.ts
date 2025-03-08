'use server'

import { getUser } from '@/app/common/user'
import prisma from '@/lib/prisma'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:maxime.noel@epitech.eu',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function subscribeUser(sub: PushSubscription) {
  const user = await getUser()

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  await prisma.subscription.create({
    data: {
      endpoint: sub.endpoint,
      auth: ((sub as any).keys as any).auth,
      p256dh: ((sub as any).keys as any).p256dh,
      user: {
        connect: { id: user.id },
      },
    },
  })
  return { success: true }
}

export async function unsubscribeUser(endpoint: string) {
  await prisma.subscription.delete({
    where: { endpoint },
  })
  return { success: true }
}

export async function sendNotification(
  message: string,
  to?: number,
  url: string = '/',
) {
  const subscriptions = to
    ? await prisma.subscription.findMany({
        where: { user: { id: to } },
      })
    : await prisma.subscription.findMany()

  try {
    if (subscriptions.length === 0) {
      throw new Error('No subscriptions available')
    }

    const notificationPromises = subscriptions.map((sub) => {
      return webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { auth: sub.auth, p256dh: sub.p256dh },
        },
        JSON.stringify({
          title: 'PWA Marmiton new notification !',
          body: message,
          icon: '/icons/icon-48x48.png',
          url: url,
        }),
      )
    })
    await Promise.all(notificationPromises)

    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
