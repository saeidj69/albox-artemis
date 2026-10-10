import type { ImageProps } from 'next/image'

import type { Media } from '@/api/models'

import { MEDIA_SIZES, PLACEHOLDER_SRC } from './constants'
import type { MediaSize } from './types'

export const sourceKey = (
  source: ImageProps['src'] | null | undefined,
): string => {
  if (!source) {
    return ''
  }

  if (typeof source === 'string') {
    return source
  }

  return 'default' in source ? source.default.src : source.src
}

export const uniqueSources = (
  candidates: Array<ImageProps['src'] | null | undefined>,
): ImageProps['src'][] => {
  const seen = new Set<string>()
  const sources: ImageProps['src'][] = []

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const key = sourceKey(candidate)
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    sources.push(candidate)
  }

  return sources
}

export const preferredMediaSource = (
  media: Media | null | undefined,
  preferredSize: MediaSize | undefined,
): string | undefined => {
  if (!media) {
    return undefined
  }

  if (!preferredSize) {
    return media.original
  }

  const preferredIndex = MEDIA_SIZES.indexOf(preferredSize)
  const sizesByProximity = [
    ...MEDIA_SIZES.slice(preferredIndex),
    ...MEDIA_SIZES.slice(0, preferredIndex).reverse(),
  ]

  for (const size of sizesByProximity) {
    const source = media[size]
    if (source) {
      return source
    }
  }

  return media.original
}

export const collectSourceCandidates = (
  primarySrc: ImageProps['src'] | null | undefined,
  fallbackSrc: ImageProps['src'] | null | undefined,
  originalSrc: ImageProps['src'] | null | undefined,
): ImageProps['src'][] =>
  uniqueSources([
    primarySrc,
    fallbackSrc,
    originalSrc,
    process.env.FALLBACK_IMAGE_URL,
    PLACEHOLDER_SRC,
  ])

export const isCachedImageComplete = (image: HTMLImageElement | null) =>
  Boolean(image?.complete && image.naturalWidth > 0)

export const setLoadedAppearance = (
  image: HTMLImageElement | null,
  placeholder: HTMLElement | null,
  loaded: boolean,
) => {
  if (image) {
    image.style.opacity = loaded ? '1' : '0'
  }

  if (placeholder) {
    placeholder.style.opacity = loaded ? '0' : '1'
  }
}
