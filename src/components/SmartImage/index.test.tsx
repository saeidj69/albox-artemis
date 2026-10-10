import { createElement } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Media } from '@/api/models'

import SmartImage from './index'

vi.mock('next/image', () => ({
  default: ({ fill, preload, ...props }: Record<string, unknown>) => {
    void fill
    void preload

    return createElement('img', props)
  },
}))

describe('SmartImage', () => {
  beforeEach(() => {
    vi.stubEnv('FALLBACK_IMAGE_URL', 'https://images.test/global-fallback.png')
  })

  it('loads the requested image before configured fallbacks', () => {
    const { container } = render(
      <SmartImage
        fill
        alt="کالا"
        src="https://images.test/product.webp"
        fallbackSrc="https://images.test/product.jpg"
      />,
    )

    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(screen.getByAltText('کالا')).toHaveAttribute(
      'src',
      'https://images.test/product.webp',
    )
  })

  it('falls back from a resized image to the original and then the global fallback', () => {
    const media = {
      md: 'https://images.test/product.webp',
      original: 'https://images.test/product.jpg',
    } as Media

    render(<SmartImage fill alt="کالا" media={media} preferredSize="md" />)
    const image = screen.getByAltText('کالا')

    fireEvent.error(image)
    expect(image).toHaveAttribute('src', 'https://images.test/product.jpg')

    fireEvent.error(image)
    expect(image).toHaveAttribute(
      'src',
      'https://images.test/global-fallback.png',
    )
  })

  it('uses responsive sources and removes them when a selected source fails', () => {
    const { container } = render(
      <SmartImage
        fill
        alt="بنر"
        src="https://images.test/banner.jpg"
        sources={[
          {
            type: 'image/webp',
            sizes: 'min(100vw, 448px)',
            srcSet:
              'https://images.test/banner-480.webp 480w, https://images.test/banner-960.webp 960w',
          },
        ]}
      />,
    )

    expect(container.querySelector('source')).toHaveAttribute(
      'srcset',
      'https://images.test/banner-480.webp 480w, https://images.test/banner-960.webp 960w',
    )

    fireEvent.error(screen.getByAltText('بنر'))

    expect(container.querySelector('source')).not.toBeInTheDocument()
    expect(screen.getByAltText('بنر')).toHaveAttribute(
      'src',
      'https://images.test/banner.jpg',
    )
  })
})
