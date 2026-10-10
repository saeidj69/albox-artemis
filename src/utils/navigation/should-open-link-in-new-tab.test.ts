import { afterEach, describe, expect, test, vi } from 'vitest'

import { shouldOpenLinkInNewTab } from './should-open-link-in-new-tab'

const APP_URL = 'https://artemis.stage.all-box.ir'

describe('shouldOpenLinkInNewTab', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('keeps relative paths in the current tab', () => {
    vi.stubEnv('APP_URL', APP_URL)

    expect(shouldOpenLinkInNewTab('/products/1')).toBe(false)
    expect(shouldOpenLinkInNewTab('products/1')).toBe(false)
    expect(shouldOpenLinkInNewTab('?q=1')).toBe(false)
    expect(shouldOpenLinkInNewTab('#details')).toBe(false)
  })

  test('keeps an absolute URL on the app origin in the current tab', () => {
    vi.stubEnv('APP_URL', APP_URL)

    expect(shouldOpenLinkInNewTab(`${APP_URL}/products/1?q=1#details`)).toBe(
      false,
    )
    expect(
      shouldOpenLinkInNewTab('//artemis.stage.all-box.ir/products/1'),
    ).toBe(false)
  })

  test('opens a different origin in a new tab, including protocol-relative URLs', () => {
    vi.stubEnv('APP_URL', APP_URL)

    expect(shouldOpenLinkInNewTab('https://other.example/a')).toBe(true)
    expect(shouldOpenLinkInNewTab('http://artemis.stage.all-box.ir/a')).toBe(
      true,
    )
    expect(shouldOpenLinkInNewTab('//cdn.example.com/a')).toBe(true)
    expect(shouldOpenLinkInNewTab('  https://other.example/a  ')).toBe(true)
  })

  test('leaves non-http schemes unchanged', () => {
    vi.stubEnv('APP_URL', APP_URL)

    expect(shouldOpenLinkInNewTab('mailto:a@b.c')).toBe(false)
    expect(shouldOpenLinkInNewTab('tel:+989121234567')).toBe(false)
  })

  test('opens an absolute URL in a new tab when the app base is missing', () => {
    vi.stubEnv('APP_URL', '')

    expect(shouldOpenLinkInNewTab('https://other.example/a')).toBe(true)
    expect(shouldOpenLinkInNewTab('/products/1')).toBe(false)
  })
})
