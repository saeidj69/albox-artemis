import { ROUTES } from '@/constants'

import { serializeSelectLocationUrl } from '@/modules/addresses/search-params/select-location'

type BuildAddressCreateSelectLocationOptions = {
  canSkip?: boolean
  lat?: number
  lng?: number
  postalCode?: string
}

type BuildAddressEditSelectLocationOptions = {
  addressId: number | string
  coordinates: { latitude: number; longitude: number }
  postalCode?: string
}

export const buildAddressCreateSelectLocationUrl = (
  options?: BuildAddressCreateSelectLocationOptions,
) => {
  return serializeSelectLocationUrl(ROUTES.SELECT_LOCATION, {
    next: ROUTES.ADDRESSES.NEW,
    canSkip: options?.canSkip ?? false,
    lat: options?.lat ?? null,
    lng: options?.lng ?? null,
    postalCode: options?.postalCode ?? null,
  })
}

export const buildAddressEditSelectLocationUrl = (
  options?: BuildAddressEditSelectLocationOptions,
) => {
  return serializeSelectLocationUrl(ROUTES.SELECT_LOCATION, {
    next: ROUTES.ADDRESSES.edit(options?.addressId ?? ''),
    lat: options?.coordinates?.latitude ?? null,
    lng: options?.coordinates?.longitude ?? null,
    postalCode: options?.postalCode ?? null,
  })
}
