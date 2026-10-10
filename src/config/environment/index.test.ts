import { STORAGE_KEYS } from '@/constants'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { environmentManager, STAGE_API_BASE_URLS } from '.'

beforeEach(() => {
  vi.stubEnv('API_URL', 'https://jupiter.allbox.work')
  vi.stubEnv('APP_ENV', 'staging')
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('environmentManager', () => {
  it('treats non-production APP_ENV as staging', () => {
    vi.stubEnv('APP_ENV', '')
    expect(environmentManager.getAppEnv()).toBe('staging')

    vi.stubEnv('APP_ENV', 'staging')
    expect(environmentManager.getAppEnv()).toBe('staging')

    vi.stubEnv('APP_ENV', 'production')
    expect(environmentManager.getAppEnv()).toBe('production')
  })

  it('returns the deployment API_URL until a stage override is stored', () => {
    expect(environmentManager.getApiUrl()).toBe('https://jupiter.allbox.work')
  })

  it('persists an approved selection for subsequent staging requests', () => {
    environmentManager.setApiUrl('https://jupiter-3.allbox.work')

    expect(environmentManager.getApiUrl()).toBe('https://jupiter-3.allbox.work')
    expect(window.localStorage.getItem(STORAGE_KEYS.STAGE_API_BASE_URL)).toBe(
      'https://jupiter-3.allbox.work',
    )
  })

  it('rejects URLs outside the stage allowlist', () => {
    expect(() => environmentManager.setApiUrl('https://example.com')).toThrow(
      'not an approved stage URL',
    )
  })

  it('ignores an invalid URL already stored in localStorage', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.STAGE_API_BASE_URL,
      'https://example.com',
    )

    expect(environmentManager.getApiUrl()).toBe('https://jupiter.allbox.work')
  })

  it('ignores stored overrides in production', () => {
    environmentManager.setApiUrl('https://jupiter-1.allbox.work')

    vi.stubEnv('APP_ENV', 'production')
    vi.stubEnv('API_URL', 'https://api-allbox.surenamarkets.com')

    expect(environmentManager.getApiUrl()).toBe(
      'https://api-allbox.surenamarkets.com',
    )
  })

  it('does not write overrides in production', () => {
    vi.stubEnv('APP_ENV', 'production')

    environmentManager.setApiUrl('https://jupiter-1.allbox.work')

    expect(
      window.localStorage.getItem(STORAGE_KEYS.STAGE_API_BASE_URL),
    ).toBeNull()
  })

  it('uses the deployment API_URL during SSR', () => {
    vi.stubEnv('API_URL', 'https://fallback-api.allbox.work')
    vi.stubGlobal('window', undefined)

    expect(environmentManager.getApiUrl()).toBe(
      'https://fallback-api.allbox.work',
    )
  })

  it('exposes the stage allowlist for the switcher UI', () => {
    expect(STAGE_API_BASE_URLS).toContain('https://jupiter.allbox.work')
  })
})
