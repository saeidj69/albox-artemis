import type { AnalyticsFlag } from '../../flag'

export function sendPlausibleEvent(
  event: string,
  payload: AnalyticsFlag | Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return

  if (payload === true) {
    window.plausible?.(event)
    return
  }

  window.plausible?.(event, { props: payload })
}
