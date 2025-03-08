import { create } from 'zustand'

interface ServiceWorkerState {
  isPushSupported: boolean
  setIsPushSupported: (value: boolean) => void
  removeIsPushSupported: () => void

  subscription: PushSubscription | null
  setSubscription: (value: PushSubscription | null) => void
  removeSubscription: () => void

  isSubscribed: boolean | null
  setIsSubscribed: (value: boolean) => void
  removeIsSubscribed: () => void
}

export const useServiceWorkerStore = create<ServiceWorkerState>()((set) => ({
  isPushSupported: false,
  setIsPushSupported: (value) => {
    set({ isPushSupported: value })
    localStorage.setItem('isPushSupported', JSON.stringify(value))
  },
  removeIsPushSupported: () => {
    set({ isPushSupported: false })
    localStorage.removeItem('isPushSupported')
  },

  subscription: null,
  setSubscription: (value) => {
    set({ subscription: value })
    localStorage.setItem('subscription', JSON.stringify(value))
  },
  removeSubscription: () => {
    set({ subscription: null })
    localStorage.removeItem('subscription')
  },

  isSubscribed: null,
  setIsSubscribed: (value) => {
    set({ isSubscribed: value })
    localStorage.setItem('isSubscribed', JSON.stringify(value))
  },
  removeIsSubscribed: () => {
    set({ isSubscribed: null })
    localStorage.removeItem('isSubscribed')
  },
}))
