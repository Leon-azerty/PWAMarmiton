'use client'

import { useServiceWorkerStore } from '@/app/common/stores/serviceWorker'
import { urlBase64ToUint8Array } from '@/app/common/utils'
import { Button } from '@/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/card'
import { Input } from '@/ui/input'
import { useState } from 'react'
import {
  sendNotification,
  subscribeUser,
  unsubscribeUser,
} from '../common/ServiceWorkerListener/pushNotif.action'

export function PushNotificationManager() {
  const isPushSupported = useServiceWorkerStore(
    (state) => state.isPushSupported,
  )
  const subscription = useServiceWorkerStore((state) => state.subscription)
  const isSubscribed = useServiceWorkerStore((state) => state.isSubscribed)
  const setIsSubscribed = useServiceWorkerStore(
    (state) => state.setIsSubscribed,
  )
  const setSubscription = useServiceWorkerStore(
    (state) => state.setSubscription,
  )
  const removeSubscription = useServiceWorkerStore(
    (state) => state.removeSubscription,
  )

  const [message, setMessage] = useState('')

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
      setIsSubscribed(true)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.log('User denied the notification permission')
        setIsSubscribed(false)
      } else {
        console.error('Failed to subscribe to push notifications', error)
      }
    }
  }

  async function unsubscribeFromPush() {
    const endpoint = subscription?.endpoint
    await subscription?.unsubscribe()
    removeSubscription()
    if (endpoint) await unsubscribeUser(endpoint)
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message)
      setMessage('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>Allow us to send you notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {!isPushSupported ? (
          <p>Push notifications are not supported in this browser.</p>
        ) : subscription ? (
          <>
            <p>You are subscribed to push notifications.</p>
            <Button onClick={unsubscribeFromPush}>Unsubscribe</Button>
            <Input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendTestNotification}>Send Test</Button>
          </>
        ) : (
          <>
            {isSubscribed === null && (
              <p>You are not subscribed to push notifications.</p>
            )}
            {isSubscribed === false && <p>You have disabled notifications</p>}
            <Button
              onClick={subscribeToPush}
              className={
                isSubscribed === false ? 'cursor-not-allowed opacity-50' : ''
              }
              disabled={isSubscribed === false}
            >
              Subscribe
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter />
    </Card>
  )
}
