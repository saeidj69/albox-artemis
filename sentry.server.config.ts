// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import {
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

  // No cookies, headers, bodies, query params or auto-collected user data.
  dataCollection: SENTRY_DATA_COLLECTION,
})
