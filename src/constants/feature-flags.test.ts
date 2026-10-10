import { afterEach, describe, expect, test, vi } from 'vitest'

import { isPageBuilderPresentationsEnabled } from './feature-flags'

describe('isPageBuilderPresentationsEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('returns true only for the exact string true', () => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'true')
    expect(isPageBuilderPresentationsEnabled()).toBe(true)
  })

  test('returns false when unset, false, or any other value', () => {
    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', '')
    expect(isPageBuilderPresentationsEnabled()).toBe(false)

    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', 'false')
    expect(isPageBuilderPresentationsEnabled()).toBe(false)

    vi.stubEnv('ENABLE_PAGE_BUILDER_PRESENTATIONS', '1')
    expect(isPageBuilderPresentationsEnabled()).toBe(false)
  })
})
