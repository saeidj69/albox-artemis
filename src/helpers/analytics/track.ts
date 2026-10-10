import { sendClarityEvent } from './adapters/clarity'
import { sendGtmEvent } from './adapters/gtm'
import { sendPlausibleEvent } from './adapters/plausible'
import { sendWebEngageEvent } from './adapters/webengage'
import type { AnalyticsEventMap, AnalyticsTarget, PayloadsFor } from './types'

const adapters: {
  [T in AnalyticsTarget]: (event: string, payload: unknown) => void
} = {
  plausible: (event, payload) =>
    sendPlausibleEvent(event, payload as true | Record<string, unknown>),
  gtm: (event, payload) =>
    sendGtmEvent(event, payload as Record<string, unknown>),
  clarity: (event) => sendClarityEvent(event),
  webengage: (event, payload) =>
    sendWebEngageEvent(event, payload as true | Record<string, unknown>),
}

export function track<E extends keyof AnalyticsEventMap>(
  event: E,
  payloads: PayloadsFor<E>,
): void {
  if (typeof window === 'undefined') return

  for (const [target, payload] of Object.entries(payloads) as [
    AnalyticsTarget,
    unknown,
  ][]) {
    if (payload === undefined) continue

    console.log('EVENT:', [target, event, payload])

    adapters[target]?.(event, payload)
  }
}
