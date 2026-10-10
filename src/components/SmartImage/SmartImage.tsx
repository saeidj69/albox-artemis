'use client'

import { memo, useLayoutEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { cn } from '@/lib/utils'

import { PLACEHOLDER_SRC } from './constants'
import {
  collectSourceCandidates,
  isCachedImageComplete,
  preferredMediaSource,
  setLoadedAppearance,
  sourceKey,
} from './functions'
import type { SmartImageProps } from './types'
import { slots } from './variants'

const SmartImageComponent = ({
  src,
  media,
  preferredSize,
  fallbackSrc,
  sources,
  alt,
  className,
  classNames,
  onLoad,
  onError,
  sizes,
  preload,
  ...imageProps
}: SmartImageProps) => {
  const primarySrc = src ?? preferredMediaSource(media, preferredSize)
  const originalSrc = media?.original

  const imageRef = useRef<HTMLImageElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  const sourceCandidates = collectSourceCandidates(
    primarySrc,
    fallbackSrc,
    originalSrc,
  )
  const resolvedKey = `${sourceKey(primarySrc)}:${sourceKey(fallbackSrc)}:${sourceKey(originalSrc)}`

  const [key, setKey] = useState(resolvedKey)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [sourcesEnabled, setSourcesEnabled] = useState(true)

  if (key !== resolvedKey) {
    setKey(resolvedKey)
    setCandidateIndex(0)
    setSourcesEnabled(true)
  }

  const resolvedSrc = sourceCandidates[candidateIndex] ?? PLACEHOLDER_SRC

  useLayoutEffect(() => {
    setLoadedAppearance(
      imageRef.current,
      placeholderRef.current,
      isCachedImageComplete(imageRef.current),
    )
  }, [resolvedSrc])

  const handleLoad = (event: Parameters<NonNullable<typeof onLoad>>[0]) => {
    setLoadedAppearance(imageRef.current, placeholderRef.current, true)
    onLoad?.(event)
  }

  const handleError = (event: Parameters<NonNullable<typeof onError>>[0]) => {
    setLoadedAppearance(imageRef.current, placeholderRef.current, false)

    if (sourcesEnabled && sources?.length) {
      setSourcesEnabled(false)
    } else if (candidateIndex < sourceCandidates.length - 1) {
      setCandidateIndex((currentIndex) => currentIndex + 1)
    }

    onError?.(event)
  }

  return (
    <div
      data-slot="product-image-with-fallback-root"
      className={slots.root({
        className: cn(className, classNames?.root),
      })}
    >
      <div
        ref={placeholderRef}
        aria-hidden
        data-slot="product-image-with-fallback-placeholder"
        style={{ backgroundImage: `url(${PLACEHOLDER_SRC})` }}
        className={slots.placeholder({
          className: classNames?.placeholder,
        })}
      />

      <picture
        data-slot="product-image-with-fallback-picture"
        className={slots.picture({ className: classNames?.picture })}
      >
        {sourcesEnabled &&
          sources?.map((source) => (
            <source
              key={`${source.media ?? ''}:${source.type ?? ''}:${source.srcSet}`}
              data-slot="product-image-with-fallback-source"
              {...source}
            />
          ))}

        <Image
          {...imageProps}
          sizes={sizes}
          preload={preload}
          decoding={preload ? 'sync' : 'async'}
          alt={alt}
          src={resolvedSrc}
          ref={imageRef}
          unoptimized={resolvedSrc === PLACEHOLDER_SRC}
          onLoad={handleLoad}
          onError={handleError}
          data-slot="product-image-with-fallback-image"
          className={slots.image({
            className: classNames?.image,
          })}
        />
      </picture>
    </div>
  )
}

const SmartImage = memo(SmartImageComponent)
SmartImage.displayName = 'SmartImage'

export default SmartImage
