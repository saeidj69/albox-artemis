import { STAGE_API_BASE_URLS } from '@/config/environment'
import type * as Sentry from '@sentry/nextjs'

type SentryDataCollection = NonNullable<
  NonNullable<Parameters<typeof Sentry.init>[0]>['dataCollection']
>

export const SENTRY_DSN =
  'https://80a1a9e8b5cf638bb85208cc35a39df3@sentry.allbox.work/3'

/**
 * SDK defaults send cookies, headers, query params, full HTTP bodies and stack
 * locals. Turn all of it off — attach intentional context explicitly instead.
 */
export const SENTRY_DATA_COLLECTION: SentryDataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  stackFrameVariables: false,
}

export type SentryEnvironment = 'development' | 'staging' | 'production'

const DEFAULT_TRACES_SAMPLE_RATE: Record<SentryEnvironment, number> = {
  development: 1,
  staging: 1,
  production: 0.02,
}

const REPLAYS_SESSION_SAMPLE_RATE: Record<SentryEnvironment, number> = {
  development: 0,
  staging: 0,
  production: 0.01,
}

/** Maps APP_ENV to a Sentry environment; anything unrecognized (incl. local dev) is `development`. */
export const getSentryEnvironment = (): SentryEnvironment => {
  const appEnv = process.env.APP_ENV

  if (appEnv === 'production' || appEnv === 'staging') {
    return appEnv
  }

  return 'development'
}

/** Local/dev builds stay silent so they don't add noise to the shared project. */
export const isSentryEnabled = (): boolean =>
  getSentryEnvironment() !== 'development'

/** Reads SENTRY_TRACES_SAMPLE_RATE (0–1); falls back to the per-environment default. */
export const getTracesSampleRate = (): number => {
  const rate = Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '')

  if (Number.isFinite(rate) && rate >= 0 && rate <= 1) {
    return rate
  }

  return DEFAULT_TRACES_SAMPLE_RATE[getSentryEnvironment()]
}

export const getReplaysSessionSampleRate = (): number =>
  REPLAYS_SESSION_SAMPLE_RATE[getSentryEnvironment()]

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const toOrigin = (url: string): string | null => {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/** Only our own API origins receive `sentry-trace` / `baggage` headers. */
export const getTracePropagationTargets = (): RegExp[] => {
  const urls = [
    process.env.API_URL,
    process.env.TYCHE_API_URL,
    process.env.MAPSI_BASE_URL,
    ...(getSentryEnvironment() === 'production' ? [] : STAGE_API_BASE_URLS),
  ]

  const origins = new Set(
    urls.flatMap((url) => {
      const origin = url ? toOrigin(url) : null
      return origin ? [origin] : []
    }),
  )

  return [...origins].map(
    (origin) => new RegExp(`^${escapeRegExp(origin)}(?:/|$)`),
  )
}
