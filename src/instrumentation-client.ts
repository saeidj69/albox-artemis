// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import {
  getReplaysSessionSampleRate,
  getSentryEnvironment,
  getTracePropagationTargets,
  getTracesSampleRate,
  isSentryEnabled,
  SENTRY_DATA_COLLECTION,
  SENTRY_DSN,
} from '@/config/sentry'
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: isSentryEnabled(),
  environment: getSentryEnvironment(),

  // Controlled via SENTRY_TRACES_SAMPLE_RATE; defaults to 2% in production.
  tracesSampleRate: getTracesSampleRate(),

  // Only our own API domains receive tracing headers.
  tracePropagationTargets: getTracePropagationTargets(),

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // 1% of sessions in production, 10% in staging.
  replaysSessionSampleRate: getReplaysSessionSampleRate(),

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // No cookies, headers, bodies, query params or auto-collected user data.
  dataCollection: SENTRY_DATA_COLLECTION,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
