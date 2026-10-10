import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Media } from '@/api/models'

import { PLACEHOLDER_SRC } from './constants'
import {
  collectSourceCandidates,
  isCachedImageComplete,
  preferredMediaSource,
  setLoadedAppearance,
  sourceKey,
  uniqueSources,
} from './functions'

const media = {
  original: 'https://images.test/original.jpg',
  md: 'https://images.test/md.webp',
  lg: 'https://images.test/lg.webp',
} as Media

describe('preferredMediaSource', () => {
  it('returns undefined when media is missing', () => {
    expect(preferredMediaSource(undefined, 'md')).toBeUndefined()
    expect(preferredMediaSource(null, 'md')).toBeUndefined()
  })

  it('returns original when no preferred size is set', () => {
    expect(preferredMediaSource(media, undefined)).toBe(media.original)
  })

  it('returns the preferred size when it exists', () => {
    expect(preferredMediaSource(media, 'md')).toBe(media.md)
  })

  it('walks up then back to the nearest available size', () => {
    expect(preferredMediaSource(media, 'sm')).toBe(media.md)
    expect(preferredMediaSource(media, 'xl')).toBe(media.lg)
    expect(preferredMediaSource(media, 'xs')).toBe(media.md)
  })

  it('falls back to original when no sized variants exist', () => {
    expect(
      preferredMediaSource({ original: media.original } as Media, 'md'),
    ).toBe(media.original)
  })
})

describe('collectSourceCandidates', () => {
  beforeEach(() => {
    vi.stubEnv('FALLBACK_IMAGE_URL', '')
  })

  it('keeps unique sources in fallback order', () => {
    expect(
      collectSourceCandidates(
        'https://images.test/primary.webp',
        'https://images.test/fallback.jpg',
        'https://images.test/primary.webp',
      ),
    ).toEqual([
      'https://images.test/primary.webp',
      'https://images.test/fallback.jpg',
      PLACEHOLDER_SRC,
    ])
  })
})

describe('source helpers', () => {
  it('keys string and static import sources', () => {
    expect(sourceKey('https://images.test/a.webp')).toBe(
      'https://images.test/a.webp',
    )
    expect(sourceKey({ src: '/icon.png', height: 1, width: 1 })).toBe(
      '/icon.png',
    )
    expect(sourceKey(null)).toBe('')
  })

  it('drops empty duplicate sources', () => {
    expect(uniqueSources([undefined, 'a', null, 'a', 'b'])).toEqual(['a', 'b'])
  })
})

describe('image appearance', () => {
  it('toggles image and placeholder opacity without a render', () => {
    const image = document.createElement('img')
    const placeholder = document.createElement('div')

    setLoadedAppearance(image, placeholder, true)
    expect(image.style.opacity).toBe('1')
    expect(placeholder.style.opacity).toBe('0')

    setLoadedAppearance(image, placeholder, false)
    expect(image.style.opacity).toBe('0')
    expect(placeholder.style.opacity).toBe('1')
  })

  it('detects a cached complete image', () => {
    const image = document.createElement('img')
    expect(isCachedImageComplete(image)).toBe(false)

    Object.defineProperty(image, 'complete', { value: true })
    Object.defineProperty(image, 'naturalWidth', { value: 120 })
    expect(isCachedImageComplete(image)).toBe(true)
  })
})
