'use client'

import { useCallback, useState } from 'react'

import { toast } from 'sonner'

import type { MapViewState } from '@/components/Map/types'

const isSupported = typeof window !== 'undefined' && 'geolocation' in navigator

export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false)

  const getPosition = useCallback(
    (onSuccess: (location: MapViewState) => void) => {
      if (!isSupported) return

      setIsLoading(true)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false)
          onSuccess({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 15,
          })
        },
        (error) => {
          setIsLoading(false)
          if (error.code === error.PERMISSION_DENIED) {
            toast.error('دسترسی به موقعیت مکانی رد شد.')
          } else {
            toast.error('دریافت موقعیت مکانی با خطا مواجه شد.')
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    },
    [],
  )

  return { getPosition, isLoading, isSupported }
}
