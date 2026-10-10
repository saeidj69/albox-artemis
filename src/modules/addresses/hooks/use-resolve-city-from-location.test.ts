import { describe, expect, it } from 'vitest'

import { MapMapAreaType } from '@/api/models'
import type { ListMapAreas200 } from '@/api/models'

import {
  formatRegionLabel,
  selectFallbackRegionFromMapAreas,
  selectRegionFromMapAreas,
  selectProvinceNameFromSubdivision,
  selectRegionFromReverseGeocode,
  selectRegionFromSubdivision,
} from './use-resolve-city-from-location'

describe('selectRegionFromSubdivision', () => {
  it('returns province and city when both nameFa values exist', () => {
    expect(
      selectRegionFromSubdivision({
        province: { name: 'TEHRAN', nameFa: 'تهران' },
        city: { name: 'TEHRAN', nameFa: 'تهران' },
      }),
    ).toEqual({
      provinceName: 'تهران',
      cityName: 'تهران',
    })
  })

  it('prefers subCity over city when both are present', () => {
    expect(
      selectRegionFromSubdivision({
        province: { name: 'TEHRAN', nameFa: 'تهران' },
        city: { name: 'TEHRAN', nameFa: 'تهران' },
        subCity: { name: 'SHAHRIAR', nameFa: 'شهریار' },
      }),
    ).toEqual({
      provinceName: 'تهران',
      cityName: 'شهریار',
    })
  })

  it('falls back to city when subCity is missing', () => {
    expect(
      selectRegionFromSubdivision({
        province: { name: 'TEHRAN', nameFa: 'تهران' },
        city: { name: 'TEHRAN', nameFa: 'تهران' },
      }),
    ).toEqual({
      provinceName: 'تهران',
      cityName: 'تهران',
    })
  })

  it('returns null for empty subdivision payload', () => {
    expect(selectRegionFromSubdivision({})).toBeNull()
  })

  it('returns null when province nameFa is missing', () => {
    expect(
      selectRegionFromSubdivision({
        province: { name: 'FARS', nameFa: null },
        city: { name: 'DARAB', nameFa: 'داراب' },
      }),
    ).toBeNull()
  })
})

describe('selectProvinceNameFromSubdivision', () => {
  it('returns province-only when city nameFa is missing', () => {
    expect(
      selectProvinceNameFromSubdivision({
        province: { name: 'TEHRAN', nameFa: 'تهران' },
        city: { name: 'TEHRAN', nameFa: null },
      }),
    ).toBe('تهران')
  })

  it('returns null for empty subdivision payload', () => {
    expect(selectProvinceNameFromSubdivision({})).toBeNull()
  })
})

describe('selectRegionFromReverseGeocode', () => {
  it('returns province and city from reverse geocode strings', () => {
    expect(
      selectRegionFromReverseGeocode({
        province: 'فارس',
        city: 'داراب',
        address: 'خیابان نمونه',
      }),
    ).toEqual({
      provinceName: 'فارس',
      cityName: 'داراب',
    })
  })

  it('returns null when city or province is missing', () => {
    expect(
      selectRegionFromReverseGeocode({
        province: 'فارس',
      }),
    ).toBeNull()
  })
})

describe('selectRegionFromMapAreas', () => {
  it('returns city and province from sibling containment matches', () => {
    const data = {
      mapAreas: [
        {
          id: 1,
          name: 'داراب',
          type: { value: MapMapAreaType.city, label: 'شهر' },
          parentId: null,
          representativePoint: { latitude: 28.75, longitude: 54.55 },
          ancestors: [],
        },
        {
          id: 2,
          name: 'فارس',
          type: { value: MapMapAreaType.province, label: 'استان' },
          parentId: null,
          representativePoint: { latitude: 29.35, longitude: 53.31 },
          ancestors: [],
        },
      ],
      metadata: { nextCursor: null },
    } satisfies ListMapAreas200

    expect(selectRegionFromMapAreas(data)).toEqual({
      provinceName: 'فارس',
      cityName: 'داراب',
    })
  })
})

describe('selectFallbackRegionFromMapAreas', () => {
  it('uses county name as city when city polygon is missing', () => {
    const data = {
      mapAreas: [
        {
          id: 1,
          name: 'شهرستان داراب',
          type: { value: MapMapAreaType.county, label: 'شهرستان' },
          parentId: 2,
          representativePoint: { latitude: 28.75, longitude: 54.55 },
          ancestors: [],
        },
        {
          id: 2,
          name: 'فارس',
          type: { value: MapMapAreaType.province, label: 'استان' },
          parentId: null,
          representativePoint: { latitude: 29.35, longitude: 53.31 },
          ancestors: [],
        },
      ],
      metadata: { nextCursor: null },
    } satisfies ListMapAreas200

    expect(selectFallbackRegionFromMapAreas(data)).toEqual({
      provinceName: 'فارس',
      cityName: 'شهرستان داراب',
    })
  })
})

describe('formatRegionLabel', () => {
  it('formats province and city with Persian comma separator', () => {
    expect(formatRegionLabel({ provinceName: 'فارس', cityName: 'داراب' })).toBe(
      'فارس، داراب',
    )
  })
})
