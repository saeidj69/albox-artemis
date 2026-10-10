import type { AnalyticsFlag } from '../flag'

export const CLARITY_EVENTS = {
  BAROOK_NET_PAYMENT: 'barook_net_payment',
  BAROOK_AVAILABLE_CREDIT: 'barook_available_credit',
} as const

export type ClarityEventMap = {
  [CLARITY_EVENTS.BAROOK_NET_PAYMENT]: AnalyticsFlag
  [CLARITY_EVENTS.BAROOK_AVAILABLE_CREDIT]: AnalyticsFlag
}
