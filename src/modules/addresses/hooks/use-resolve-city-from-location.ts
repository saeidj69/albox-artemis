'use client'

import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
  getListMapAreasQueryOptions,
  useListMapAreas,
} from '@/api/functions/map'
import {
  getGetSubdivisionQueryOptions,
  useGetSubdivision,
} from '@/api/functions/mapsi/geofence'
import {
  getReverseGeocodeQueryOptions,
  useReverseGeocode,
} from '@/api/functions/mapsi/reverse-geocoding'
import type { ListMapAreas200, ListMapAreasParams } from '@/api/models'
import { MapMapAreaType } from '@/api/models'
import type {
  ReverseGeocodingResponse,
  SubdivisionSuccessResponse,
} from '@/api/models/mapsi'

export type ResolvedCityRegion = {
  provinceName: string
  cityName: string
}

// point→city containment is effectively immutable
const REGION_LOOKUP_STALE_TIME = Infinity

// a point sits in at most one area per admin layer (city/county/province/…),
// so this never paginates — it only guards the province against being clipped
// by the default limit of 20. The server rejects values above 50 (the swagger
// max of 100 is wrong).
const REGION_LOOKUP_LIMIT = 50

const buildLocationRequest = (latitude: number, longitude: number) => ({
  location: { latitude, longitude },
})

// no `type` filter: the containment result must include the province row too,
// since selectRegion falls back to it when the city has no linked ancestors
const buildRegionLookupParams = (
  latitude: number,
  longitude: number,
): ListMapAreasParams => ({
  latitude,
  longitude,
  limit: REGION_LOOKUP_LIMIT,
})

export const formatRegionLabel = (region: {
  provinceName?: string | null
  cityName?: string | null
}) => {
  if (!region.provinceName) return ''
  if (!region.cityName) return region.provinceName

  return `${region.provinceName}، ${region.cityName}`
}

export const selectRegionFromSubdivision = (
  data: SubdivisionSuccessResponse | null | undefined,
): ResolvedCityRegion | null => {
  const provinceName = data?.province?.nameFa
  // subCity is the actual town/city containing the point; city is its parent
  // metro area and misnames nearby smaller cities with the larger city's name
  const cityName = data?.subCity?.nameFa ?? data?.city?.nameFa

  if (!provinceName || !cityName) return null

  return { provinceName, cityName }
}

export const selectRegionFromReverseGeocode = (
  data: ReverseGeocodingResponse | null | undefined,
): ResolvedCityRegion | null => {
  const provinceName = data?.province?.trim()
  const cityName = data?.city?.trim()

  if (!provinceName || !cityName) return null

  return { provinceName, cityName }
}

export const selectProvinceNameFromSubdivision = (
  data: SubdivisionSuccessResponse | null | undefined,
): string | null => {
  const provinceName = data?.province?.nameFa?.trim()
  return provinceName || null
}

export const selectProvinceNameFromReverseGeocode = (
  data: ReverseGeocodingResponse | null | undefined,
): string | null => {
  const provinceName = data?.province?.trim()
  return provinceName || null
}

const findProvinceArea = (data: ListMapAreas200) => {
  const county = data.mapAreas.find(
    (area) => area.type.value === MapMapAreaType.county,
  )

  return (
    data.mapAreas.find((area) => area.type.value === MapMapAreaType.province) ??
    county?.ancestors.find(
      (ancestor) => ancestor.type.value === MapMapAreaType.province,
    ) ??
    null
  )
}

export const selectProvinceNameFromMapAreas = (
  data: ListMapAreas200,
): string | null => {
  return findProvinceArea(data)?.name ?? null
}

/** Submit fallback when city polygon is missing but province (and maybe county) exist. */
export const selectFallbackRegionFromMapAreas = (
  data: ListMapAreas200,
): ResolvedCityRegion | null => {
  const province = findProvinceArea(data)
  if (!province) return null

  const county = data.mapAreas.find(
    (area) => area.type.value === MapMapAreaType.county,
  )

  return {
    provinceName: province.name,
    cityName: county?.name ?? province.name,
  }
}

export const selectRegionFromMapAreas = (
  data: ListMapAreas200,
): ResolvedCityRegion | null => {
  const city = data.mapAreas.find(
    (area) => area.type.value === MapMapAreaType.city,
  )
  if (!city) return null

  // the province arrives linked as the city's ancestor; while the map-areas
  // tree is unlinked (stage returns ancestors: []) it still appears as a
  // sibling containment match for the same point
  const province =
    city.ancestors.find(
      (ancestor) => ancestor.type.value === MapMapAreaType.province,
    ) ??
    data.mapAreas.find((area) => area.type.value === MapMapAreaType.province)
  // creating an address requires both names, so a city without a resolvable
  // province counts as unresolved
  if (!province) return null

  return { provinceName: province.name, cityName: city.name }
}

type UseResolveCityFromLocationParams = {
  latitude: number | null | undefined
  longitude: number | null | undefined
}

/**
 * Derives the province/city containing a coordinate. Tries Mapsi subdivision,
 * then reverse geocoding, then Jupiter map-areas point-in-polygon lookup.
 * Submit resolution also uses county/province names from map-areas as a last resort.
 */
export const useResolveCityFromLocation = (
  coordinates: UseResolveCityFromLocationParams,
) => {
  const queryClient = useQueryClient()
  const { latitude, longitude } = coordinates

  const hasCoordinates = latitude != null && longitude != null

  const locationRequest = useMemo(
    () =>
      hasCoordinates
        ? buildLocationRequest(latitude, longitude)
        : buildLocationRequest(0, 0),
    [hasCoordinates, latitude, longitude],
  )

  const subdivisionQuery = useGetSubdivision(locationRequest, {
    query: {
      enabled: hasCoordinates,
      staleTime: REGION_LOOKUP_STALE_TIME,
    },
  })

  const subdivisionRegion = useMemo(
    () => selectRegionFromSubdivision(subdivisionQuery.data?.data),
    [subdivisionQuery.data],
  )

  const shouldTryReverseGeocode =
    hasCoordinates && subdivisionRegion === null && subdivisionQuery.isFetched

  const reverseGeocodeQuery = useReverseGeocode(locationRequest, {
    query: {
      enabled: shouldTryReverseGeocode,
      staleTime: REGION_LOOKUP_STALE_TIME,
    },
  })

  const reverseGeocodeRegion = useMemo(
    () => selectRegionFromReverseGeocode(reverseGeocodeQuery.data?.data),
    [reverseGeocodeQuery.data],
  )

  const shouldTryMapAreas =
    hasCoordinates &&
    subdivisionRegion === null &&
    reverseGeocodeRegion === null &&
    subdivisionQuery.isFetched &&
    (!shouldTryReverseGeocode || reverseGeocodeQuery.isFetched)

  const mapAreasParams: ListMapAreasParams | undefined = shouldTryMapAreas
    ? buildRegionLookupParams(latitude!, longitude!)
    : undefined

  const mapAreasQuery = useListMapAreas(mapAreasParams, {
    query: {
      enabled: shouldTryMapAreas,
      staleTime: REGION_LOOKUP_STALE_TIME,
    },
  })

  const mapAreasRegion = useMemo(
    () =>
      mapAreasQuery.data ? selectRegionFromMapAreas(mapAreasQuery.data) : null,
    [mapAreasQuery.data],
  )

  const region =
    subdivisionRegion ?? reverseGeocodeRegion ?? mapAreasRegion ?? null

  const provinceFallback = useMemo(() => {
    if (region) return null

    if (subdivisionQuery.isFetched) {
      const fromSubdivision = selectProvinceNameFromSubdivision(
        subdivisionQuery.data?.data,
      )
      if (fromSubdivision) return fromSubdivision
    }

    if (reverseGeocodeQuery.isFetched) {
      const fromReverse = selectProvinceNameFromReverseGeocode(
        reverseGeocodeQuery.data?.data,
      )
      if (fromReverse) return fromReverse
    }

    if (!shouldTryMapAreas || !mapAreasQuery.isFetched) return null

    return mapAreasQuery.data
      ? selectProvinceNameFromMapAreas(mapAreasQuery.data)
      : null
  }, [
    region,
    subdivisionQuery.isFetched,
    subdivisionQuery.data,
    reverseGeocodeQuery.isFetched,
    reverseGeocodeQuery.data,
    shouldTryMapAreas,
    mapAreasQuery.isFetched,
    mapAreasQuery.data,
  ])

  const regionLabel = region
    ? formatRegionLabel(region)
    : (provinceFallback ?? '')

  const isResolving =
    hasCoordinates &&
    (subdivisionQuery.isLoading ||
      (shouldTryReverseGeocode && reverseGeocodeQuery.isLoading) ||
      (shouldTryMapAreas && mapAreasQuery.isLoading))

  const isUnresolvable =
    hasCoordinates &&
    subdivisionQuery.isFetched &&
    (!shouldTryReverseGeocode || reverseGeocodeQuery.isFetched) &&
    (!shouldTryMapAreas || mapAreasQuery.isFetched) &&
    !regionLabel

  const isResolveError =
    hasCoordinates &&
    subdivisionQuery.isFetched &&
    (!shouldTryReverseGeocode || reverseGeocodeQuery.isFetched) &&
    (!shouldTryMapAreas || mapAreasQuery.isFetched) &&
    !regionLabel &&
    (subdivisionQuery.isError ||
      reverseGeocodeQuery.isError ||
      mapAreasQuery.isError)

  const resolveRegion =
    useCallback(async (): Promise<ResolvedCityRegion | null> => {
      if (!hasCoordinates) return null

      const request = buildLocationRequest(latitude, longitude)

      try {
        const subdivisionResponse = await queryClient.ensureQueryData(
          getGetSubdivisionQueryOptions(request, {
            query: { staleTime: REGION_LOOKUP_STALE_TIME },
          }),
        )

        const fromSubdivision = selectRegionFromSubdivision(
          subdivisionResponse.data,
        )
        if (fromSubdivision) return fromSubdivision
      } catch {
        // fall through to reverse geocoding
      }

      try {
        const reverseResponse = await queryClient.ensureQueryData(
          getReverseGeocodeQueryOptions(request, {
            query: { staleTime: REGION_LOOKUP_STALE_TIME },
          }),
        )

        const fromReverse = selectRegionFromReverseGeocode(reverseResponse.data)
        if (fromReverse) return fromReverse
      } catch {
        // fall through to map-areas lookup
      }

      const mapAreasData = await queryClient.ensureQueryData(
        getListMapAreasQueryOptions(
          buildRegionLookupParams(latitude, longitude),
          {
            query: { staleTime: REGION_LOOKUP_STALE_TIME },
          },
        ),
      )

      const fromMapAreas = selectRegionFromMapAreas(mapAreasData)
      if (fromMapAreas) return fromMapAreas

      return selectFallbackRegionFromMapAreas(mapAreasData)
    }, [hasCoordinates, latitude, longitude, queryClient])

  return {
    region,
    regionLabel,
    isResolving,
    isUnresolvable,
    isResolveError,
    resolveRegion,
  }
}
