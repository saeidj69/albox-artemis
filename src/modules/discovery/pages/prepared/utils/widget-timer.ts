import { isPageBuilderPresentationsEnabled } from '@/constants/feature-flags'

/** Style-bag keys set by the admin page builder on product-cart widgets. */
export const WIDGET_TIMER_KEY = 'timer'
export const WIDGET_TIMER_ENDS_AT_KEY = 'timerEndsAt'

/** Preset id for the boxed countdown next to the product-cart title. */
export const WIDGET_TIMER_COUNTDOWN = 'countdown'

/**
 * Reads the countdown preset off a widget style bag. An already-passed deadline
 * still resolves — `Countdown` hides itself once it reaches zero, so a page left
 * open transitions live instead of needing a refetch.
 */
export function resolveWidgetCountdown(
  styles?: Record<string, string>,
): { endsAt: number } | undefined {
  if (!isPageBuilderPresentationsEnabled()) {
    return undefined
  }
  if (styles?.[WIDGET_TIMER_KEY] !== WIDGET_TIMER_COUNTDOWN) {
    return undefined
  }
  const endsAt = Date.parse(styles[WIDGET_TIMER_ENDS_AT_KEY] ?? '')
  if (!Number.isFinite(endsAt)) return undefined
  return { endsAt }
}
