import { parseAsFloat } from 'nuqs'

export const addressFormCoordinatesSearchParams = {
  lat: parseAsFloat,
  lng: parseAsFloat,
} as const
