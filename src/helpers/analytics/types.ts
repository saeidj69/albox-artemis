import type { AnalyticsEventMap } from './events'
import type { AnalyticsFlag } from './flag'

export type { AnalyticsFlag, AnalyticsEventMap }

export type AnalyticsTarget = 'plausible' | 'gtm' | 'clarity' | 'webengage'

export type PayloadsFor<E extends keyof AnalyticsEventMap> = {
  [T in keyof AnalyticsEventMap[E]]?: AnalyticsEventMap[E][T]
}
