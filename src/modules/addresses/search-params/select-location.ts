import {
  createSerializer,
  parseAsBoolean,
  parseAsFloat,
  parseAsString,
} from 'nuqs'

export const selectLocationSearchParams = {
  next: parseAsString,
  canSkip: parseAsBoolean,
  lat: parseAsFloat,
  lng: parseAsFloat,
  postalCode: parseAsString,
} as const

export const serializeSelectLocationUrl = createSerializer(
  selectLocationSearchParams,
)
