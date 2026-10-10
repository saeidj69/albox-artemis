'use client'

import { useCallback } from 'react'

import { useGeolocation } from 'rooks'

import { AzadiTowerLocation } from '@/components/Map/constants'
import { MapViewState } from '@/components/Map/types'

import type { UserAddress } from '@/api/models'

import { LocationSource } from '../atoms'
import { useUserAddresses } from './useUserAddresses'

export type UseLocationReturn = {
  location: MapViewState
  source: LocationSource
  address: UserAddress | null
  isLoading: boolean
}

export const useLocation = (): UseLocationReturn => {
  const { primaryAddress, isLoading: isAddressesLoading } = useUserAddresses()

  const geolocation = useGeolocation({
    timeout: 10000,
    maximumAge: 60000,
    enableHighAccuracy: true,
    when: !isAddressesLoading && !primaryAddress,
  })

  const decideLocation = useCallback(() => {
    if (primaryAddress) {
      return {
        address: primaryAddress,
        location: {
          latitude: primaryAddress?.location?.latitude,
          longitude: primaryAddress?.location?.longitude,
          zoom: 15,
        },
        source: LocationSource.PRIMARY_ADDRESS,
      }
    }

    if (geolocation?.lat && geolocation?.lng) {
      return {
        address: null,
        location: {
          latitude: geolocation.lat,
          longitude: geolocation.lng,
          zoom: 15,
        },
        source: LocationSource.GEOLOCATION,
      }
    }

    return {
      address: null,
      location: AzadiTowerLocation,
      source: LocationSource.FALLBACK,
    }
  }, [geolocation, primaryAddress])

  const resolvedLocation = decideLocation()

  return {
    location: resolvedLocation.location,
    source: resolvedLocation.source,
    address: resolvedLocation.address,
    isLoading: isAddressesLoading,
  }
}
