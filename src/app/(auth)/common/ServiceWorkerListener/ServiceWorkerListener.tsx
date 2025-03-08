'use client'

import { useServiceWorkerStore } from '@/app/common/stores/serviceWorker'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { sendNotification } from './pushNotif.action'

export default function ServiceWorkerListener() {
  const isPushSupported = useServiceWorkerStore(
    (state) => state.isPushSupported,
  )
  const setIsPushSupported = useServiceWorkerStore(
    (state) => state.setIsPushSupported,
  )
  const subscription = useServiceWorkerStore((state) => state.subscription)
  const setSubscription = useServiceWorkerStore(
    (state) => state.setSubscription,
  )

  const registerServiceWorker = async () => {
    console.log('start of registerServiceWorker')
    const serviceWorker = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const ready = await navigator.serviceWorker.ready

    console.log('ready: ', ready)

    console.log('end of registerServiceWorker')
    return serviceWorker
  }

  const ListenMessage = () => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'NEW_DATA_AVAILABLE') {
        if (isPushSupported && subscription) {
          sendNotification('New recipes available. please refresh the page.')
        }
      }
      if (event.data.type === 'NEW_VERSION_AVAILABLE') {
        if (isPushSupported && subscription) {
          sendNotification('New version available. please refresh the page.')
        }
      }
      if (event.data.type === 'SEND_TOAST') {
        console.log('SEND_TOAST received in front')
        if (isPushSupported && subscription) {
          toast.info(event.data.message)
        }
      }
    })
  }

  useEffect(() => {
    const handleServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await registerServiceWorker()
        if ('PushManager' in window) {
          setIsPushSupported(true)
          const sub = await registration.pushManager.getSubscription()
          if (sub) setSubscription(sub)
        }
      }
    }
    handleServiceWorker()
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) ListenMessage()

    return () => {
      navigator.serviceWorker.removeEventListener('message', ListenMessage)
    }
  }, [isPushSupported, subscription])

  return null
}
