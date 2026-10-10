import type { ComponentPropsWithRef, Ref } from 'react'

import type { CashbackBadgeSlots } from './variants'

export type CashbackBadgeShape = 'tab' | 'pill'

export type CashbackBadgeHandle = {
  expand: () => void
  collapse: () => void
}

export type CashbackBadgeProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'ref'
> & {
  percent: number
  label?: string
  shape?: CashbackBadgeShape
  alwaysExpanded?: boolean
  classNames?: Partial<Record<CashbackBadgeSlots, string>>
  ref?: Ref<CashbackBadgeHandle>
}
