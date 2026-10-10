import { afterEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import AutoLink from './AutoLink'

const APP_URL = 'https://artemis.stage.all-box.ir'

describe('AutoLink', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('opens an off-app href in a new tab even if target is set', () => {
    vi.stubEnv('APP_URL', APP_URL)

    render(
      <AutoLink href="https://other.example/promo" target="_self">
        Promo
      </AutoLink>,
    )

    const link = screen.getByRole('link', { name: 'Promo' })
    expect(link).toHaveAttribute('href', 'https://other.example/promo')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('keeps a relative path and a same-origin absolute URL in this tab', () => {
    vi.stubEnv('APP_URL', APP_URL)

    render(
      <>
        <AutoLink href="/products/1">Relative</AutoLink>
        <AutoLink href={`${APP_URL}/products/1`}>Same origin</AutoLink>
      </>,
    )

    const relative = screen.getByRole('link', { name: 'Relative' })
    const sameOrigin = screen.getByRole('link', { name: 'Same origin' })

    expect(relative).toHaveAttribute('href', '/products/1')
    expect(relative).not.toHaveAttribute('target')

    expect(sameOrigin).toHaveAttribute('href', `${APP_URL}/products/1`)
    expect(sameOrigin).not.toHaveAttribute('target')
  })
})
