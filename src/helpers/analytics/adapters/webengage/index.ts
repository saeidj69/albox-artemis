import { WE_EVENTS } from '../../events/webengage'
import type { AnalyticsFlag } from '../../flag'

const WEBENGAGE_EVENTS = new Set<string>(Object.values(WE_EVENTS))

function compactAttributes(
  attributes: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(attributes).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
}

export function loginWebEngageUser(userId: string): void {
  if (typeof window === 'undefined' || !userId) return

  window.webengage?.user?.login?.(userId)
}

export function logoutWebEngageUser(): void {
  if (typeof window === 'undefined') return

  window.webengage?.user?.logout?.()
}

export function setWebEngageUserAttributes(
  attributes: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return

  const next = compactAttributes(attributes)
  if (Object.keys(next).length === 0) return

  window.webengage?.user?.setAttribute?.(next)
}

export function sendWebEngageEvent(
  event: string,
  payload: AnalyticsFlag | Record<string, unknown>,
): void {
  if (typeof window === 'undefined' || !WEBENGAGE_EVENTS.has(event)) return

  if (payload === true) {
    window.webengage?.track?.(event)
    return
  }

  window.webengage?.track?.(event, payload)
}
