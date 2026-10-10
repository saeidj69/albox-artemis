'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import {
  parseAsBoolean,
  parseAsFloat,
  parseAsString,
  useQueryStates,
} from 'nuqs'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import LocationPicker from '@/components/Map/components/LocationPicker'
import { AzadiTowerLocation } from '@/components/Map/constants'
import { MapViewState } from '@/components/Map/types'

import Button from '@/lib/Button'

const isSafeInternalPath = (path: string) =>
  path.startsWith('/') && !path.startsWith('//')

const appendLocationSearchParams = (
  path: string,
  coordinates: MapViewState,
): string => {
  const [pathname, search = ''] = path.split('?')
  const params = new URLSearchParams(search)

  params.set('lat', String(coordinates.latitude))
  params.set('lng', String(coordinates.longitude))

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

const SelectLocationPage = () => {
  const router = useRouter()

  const [{ next, canSkip, lat, lng, postalCode }] = useQueryStates({
    next: parseAsString,
    canSkip: parseAsBoolean.withDefault(false),
    lat: parseAsFloat,
    lng: parseAsFloat,
    postalCode: parseAsString,
  })

  const [viewState, setViewState] = useState<MapViewState | null>(null)
  const [isMapMoving, setIsMapMoving] = useState(false)

  const initialViewState = useMemo<MapViewState>(() => {
    if (
      lat != null &&
      lng != null &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    ) {
      return { latitude: lat, longitude: lng, zoom: 15 }
    }

    return AzadiTowerLocation
  }, [lat, lng])

  const handleConfirm = () => {
    if (!next || !viewState || !isSafeInternalPath(next)) return

    router.replace(appendLocationSearchParams(next, viewState))
  }

  const handleSkip = () => {
    router.replace(ROUTES.HOME)
  }

  useEffect(() => {
    if (!next || !isSafeInternalPath(next)) {
      router.back()
    }
  }, [next, router])

  if (!next || !isSafeInternalPath(next)) return null

  return (
    <div className="-mx-4 flex h-dvh flex-col">
      <Header
        center="انتخاب موقعیت"
        right={
          canSkip ? (
            <Button variant="text" size="small" onClick={handleSkip}>
              <span className="text-nowrap">رد کردن</span>
            </Button>
          ) : (
            <HeaderBackButton />
          )
        }
      />

      <main className="flex-1">
        <LocationPicker
          postalCode={postalCode}
          initialViewState={initialViewState}
          onViewStateChange={setViewState}
          onMovingChange={setIsMapMoving}
        />
      </main>

      <div className="bg-background-main p-4 shadow-sm">
        <Button
          size="large"
          variant="primary"
          className="w-full"
          disabled={!viewState || isMapMoving}
          onClick={handleConfirm}
        >
          ثبت موقعیت و ادامه
        </Button>
      </div>
    </div>
  )
}

export default SelectLocationPage
