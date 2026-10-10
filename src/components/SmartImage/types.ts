import type { ImageProps } from 'next/image'

import type { Media } from '@/api/models'

import type { ProductImageWithFallbackSlots } from './variants'

export type MediaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type SmartImageSource = {
  srcSet: string
  media?: string
  sizes?: string
  type?: string
}

type SmartImageOwnProps = {
  fallbackSrc?: ImageProps['src'] | null
  sources?: SmartImageSource[]
  classNames?: Partial<Record<ProductImageWithFallbackSlots, string>>
}

type SmartImageImageProps = Omit<ImageProps, 'src'>

type SmartImageSrcProps = SmartImageImageProps &
  SmartImageOwnProps & {
    src?: ImageProps['src'] | null
    media?: never
    preferredSize?: never
  }

type SmartImageMediaProps = SmartImageImageProps &
  SmartImageOwnProps & {
    src?: never
    media?: Media | null
    preferredSize?: MediaSize
  }

export type SmartImageProps = SmartImageSrcProps | SmartImageMediaProps
