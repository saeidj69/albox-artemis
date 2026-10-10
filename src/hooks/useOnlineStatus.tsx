'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { useRouter } from 'next/navigation'

import { HomeWifi } from 'iconsax-reactjs'
import { debounce } from 'lodash'
import { toast } from 'sonner'

const DEBOUNCE_DELAY = 1000

function subscribe(onStoreChange: () => void) {
  window.addEventListener('online', debounce(onStoreChange, DEBOUNCE_DELAY))
  window.addEventListener('offline', debounce(onStoreChange, DEBOUNCE_DELAY))

  return () => {
    window.removeEventListener(
      'online',
      debounce(onStoreChange, DEBOUNCE_DELAY),
    )
    window.removeEventListener(
      'offline',
      debounce(onStoreChange, DEBOUNCE_DELAY),
    )
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

const useOnlineStatus = () => {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const toastId = useRef<string | number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const shouldRegisterSw =
      process.env.NODE_ENV === 'production' ||
      window.location.hostname === 'localhost'

    if (!shouldRegisterSw || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration can fail in unsupported contexts; offline UI still works at runtime.
    })
  }, [])

  useEffect(() => {
    if (isOnline) {
      if (!toastId.current) return

      router.refresh()

      toast.success('اتصال اینترنت برقرار شد', {
        id: toastId.current,
        onAutoClose: () => {
          toastId.current = null
        },
        onDismiss: () => {
          toastId.current = null
        },
      })
    } else {
      toastId.current = toast.loading('اتصال اینترنت برقرار نیست', {
        invert: true,
        dismissible: false,
        action: <HomeWifi />,
      })
    }
  }, [isOnline, router])
}

export default useOnlineStatus
