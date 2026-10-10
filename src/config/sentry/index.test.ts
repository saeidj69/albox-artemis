import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getSentryEnvironment,
  getTracePropagationTargets,
  getTracesSampleRate,
  isSentryEnabled,
} from '.'

const matchesAny = (targets: RegExp[], url: string) =>
  targets.some((target) => target.test(url))

beforeEach(() => {
  vi.stubEnv('APP_ENV', 'production')
  vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '')
  vi.stubEnv('API_URL', 'https://api-allbox.surenamarkets.com')
  vi.stubEnv('TYCHE_API_URL', 'https://api-allbox.surenamarkets.com/tyche')
  vi.stubEnv('MAPSI_BASE_URL', 'https://allbox.surenamarkets.com/mapsi/api/v1')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getSentryEnvironment', () => {
  it('maps APP_ENV to staging and production', () => {
    expect(getSentryEnvironment()).toBe('production')

    vi.stubEnv('APP_ENV', 'staging')
    expect(getSentryEnvironment()).toBe('staging')
  })

  it('falls back to development for missing or unknown APP_ENV', () => {
    vi.stubEnv('APP_ENV', '')
    expect(getSentryEnvironment()).toBe('development')

    vi.stubEnv('APP_ENV', 'qa')
    expect(getSentryEnvironment()).toBe('development')
  })
})

describe('isSentryEnabled', () => {
  it('is disabled only for development', () => {
    expect(isSentryEnabled()).toBe(true)

    vi.stubEnv('APP_ENV', 'development')
    expect(isSentryEnabled()).toBe(false)
  })
})

describe('getTracesSampleRate', () => {
  it('uses per-environment defaults when unset', () => {
    expect(getTracesSampleRate()).toBe(0.02)

    vi.stubEnv('APP_ENV', 'staging')
    expect(getTracesSampleRate()).toBe(1)
  })

  it('uses SENTRY_TRACES_SAMPLE_RATE when valid', () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '0.1')
    expect(getTracesSampleRate()).toBe(0.1)
  })

  it('ignores invalid SENTRY_TRACES_SAMPLE_RATE values', () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', 'abc')
    expect(getTracesSampleRate()).toBe(0.02)

    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '5')
    expect(getTracesSampleRate()).toBe(0.02)
  })
})

describe('getTracePropagationTargets', () => {
  it('matches our API origins', () => {
    const targets = getTracePropagationTargets()

    expect(
      matchesAny(targets, 'https://api-allbox.surenamarkets.com/profile'),
    ).toBe(true)
    expect(
      matchesAny(targets, 'https://allbox.surenamarkets.com/mapsi/api/v1/x'),
    ).toBe(true)
  })

  it('does not match third-party or look-alike hosts', () => {
    const targets = getTracePropagationTargets()

    expect(matchesAny(targets, 'https://www.clarity.ms/collect')).toBe(false)
    expect(
      matchesAny(targets, 'https://api-allbox.surenamarkets.com.evil.io/x'),
    ).toBe(false)
  })

  it('includes switchable stage APIs outside production only', () => {
    expect(
      matchesAny(getTracePropagationTargets(), 'https://jupiter-2.allbox.work'),
    ).toBe(false)

    vi.stubEnv('APP_ENV', 'staging')
    expect(
      matchesAny(getTracePropagationTargets(), 'https://jupiter-2.allbox.work'),
    ).toBe(true)
  })
})
