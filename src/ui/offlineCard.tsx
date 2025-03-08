'use client'

import { useEffect, useState } from 'react'

export default function OfflineCard() {
  const [isNetworkOffline, setIsNetworkOffline] = useState(false)
  const [isBrowserOffline, setIsBrowserOffline] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkInternetConnection = async () => {
      if (navigator.onLine) {
        setIsNetworkOffline(false)
      } else {
        setIsNetworkOffline(true)
      }
    }

    // Vérification initiale
    checkInternetConnection()

    // Vérifie toutes les 2 secondes
    const interval = setInterval(checkInternetConnection, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsBrowserOffline(!navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Vérifie l'état initial
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const offline = isNetworkOffline || isBrowserOffline

  if (dismissed || !offline) {
    return null
  }

  return (
    <div className="fixed left-0 top-0 z-20 flex w-full items-center justify-center bg-red-600 px-2 py-0.5 text-center text-sm text-white">
      <span>You are offline. The app is working thanks to the cache.</span>
      <button
        className="ml-4 rounded bg-red-800 p-1 hover:bg-red-900"
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </div>
  )
}
