import { GTM_EVENTS } from '../../events/gtm'

type GtmPayload = Record<string, unknown>

export function sendGtmEvent(event: string, payload: GtmPayload): void {
  if (typeof window === 'undefined' || !window.dataLayer) return

  // Preserve legacy sign_up dual-push for GTM/GA4 tags that expect both shapes.
  if (event === GTM_EVENTS.REGISTER) {
    window.dataLayer.push({
      event,
      user_data: payload,
    })
    window.dataLayer.push({
      event,
      ...payload,
    })
    return
  }

  // GTM recursively merges pushes into its data model (arrays merge by index),
  // so a previous event's `ecommerce.items` leak into the next one unless reset.
  if ('ecommerce' in payload) {
    window.dataLayer.push({ ecommerce: null })
  }

  window.dataLayer.push({
    event,
    ...payload,
  })
}

export function setGtmUserId(userId: string): void {
  if (typeof window === 'undefined' || !window.dataLayer || !userId) return

  window.dataLayer.push({ user_id: userId })
}

export function clearGtmUserId(): void {
  if (typeof window === 'undefined' || !window.dataLayer) return

  window.dataLayer.push({ user_id: null })
}
