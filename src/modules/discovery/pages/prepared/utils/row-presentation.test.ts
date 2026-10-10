import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { ListingBannerHydratedWidget } from '@/api/models'

import type { PreparedPageRow } from '../hooks/use-home-data-populate'
import {
  ROW_PRESENTATION,
  getBillboardSlides,
  isBillboardRow,
} from './row-presentation'

const banner = (
  id: number,
  image: Partial<ListingBannerHydratedWidget['image']> = {},
): ListingBannerHydratedWidget => ({
  id,
  type: 'banner',
  image: {
    original: `banner-${id}.jpg`,
    metadata: {
      id: `media-${id}`,
      type: { value: 'image', label: 'تصویر' },
      originalMimeType: 'image/jpeg',
      originalFileName: `banner-${id}.jpg`,
      originalSize: 1,
    },
    ...image,
  },
  href: `/banner/${id}`,
  styles: {},
})

const billboardRow = (
  widgets: PreparedPageRow['columns'][number]['widget'][],
): PreparedPageRow => ({
  trackingId: 'row-0',
  position: 0,
  style: { presentation: ROW_PRESENTATION.BILLBOARD },
  columns: widgets.map((widget) => ({
    trackingId: `banner-${'id' in widget ? widget.id : 'x'}`,
    widget,
    style: {},
  })),
})

describe('isBillboardRow', () => {
  test('detects only the explicit protocol marker', () => {
    expect(isBillboardRow({ presentation: 'billboard' })).toBe(true)
    expect(isBillboardRow({ presentation: 'banner_carousel' })).toBe(false)
    expect(isBillboardRow({})).toBe(false)
    expect(isBillboardRow()).toBe(false)
  })
})

describe('getBillboardSlides', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('keeps authored order and picks the largest available rendition', () => {
    const slides = getBillboardSlides(
      billboardRow([
        banner(2, { lg: 'large-2', md: 'medium-2' }),
        banner(3, { md: 'medium-3' }),
        banner(1, { original: 'original-1' }),
      ]),
    )

    expect(slides).toEqual([
      {
        id: 2,
        trackingId: 'banner-2',
        src: 'large-2',
        href: '/banner/2',
        openInNewTab: false,
      },
      {
        id: 3,
        trackingId: 'banner-3',
        src: 'medium-3',
        href: '/banner/3',
        openInNewTab: false,
      },
      {
        id: 1,
        trackingId: 'banner-1',
        src: 'original-1',
        href: '/banner/1',
        openInNewTab: false,
      },
    ])
  })

  test('carries each slide its own new-tab flag', () => {
    const flagged = banner(1)
    flagged.styles = { openInNewTab: 'true' }
    const slides = getBillboardSlides(billboardRow([flagged, banner(2)]))

    expect(slides?.map((slide) => slide.openInNewTab)).toEqual([true, false])
  })

  test('drops a single banner that ships no artwork', () => {
    const slides = getBillboardSlides(
      billboardRow([banner(1, { lg: '', original: '' }), banner(2)]),
    )

    expect(slides?.map(({ id }) => id)).toEqual([2])
  })

  test('falls back to an ordinary row when the builder did not mark it', () => {
    const row = billboardRow([banner(1)])
    row.style = {}

    expect(getBillboardSlides(row)).toBeNull()
  })

  test('falls back to an ordinary row for an empty row', () => {
    expect(getBillboardSlides(billboardRow([]))).toBeNull()
  })

  test('falls back to an ordinary row when a column is not a banner', () => {
    expect(
      getBillboardSlides(
        billboardRow([banner(1), { type: 'SURENA', surenaCode: 'code' }]),
      ),
    ).toBeNull()
  })

  test('falls back to an ordinary row when no banner ships artwork', () => {
    expect(
      getBillboardSlides(billboardRow([banner(1, { lg: '', original: '' })])),
    ).toBeNull()
  })

  test('falls back to an ordinary row when presentations are flagged off', () => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'false')
    expect(getBillboardSlides(billboardRow([banner(1)]))).toBeNull()
  })
})
