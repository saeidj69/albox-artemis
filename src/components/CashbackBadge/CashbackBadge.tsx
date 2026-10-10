'use client'

import { useImperativeHandle } from 'react'

import { EmptyWallet } from 'iconsax-reactjs'

import { cn } from '@/lib/utils'

import { CASHBACK_BADGE_LABEL } from './constants'
import { useCashbackBadgeExpand } from './hooks/use-cashback-badge-expand'
import type { CashbackBadgeProps } from './types'
import { formatCashbackBadgePercent } from './utils/format-cashback-badge-percent'
import { cashbackBadgeVariants } from './variants'

const CashbackBadgeComponent = (props: CashbackBadgeProps) => {
  const {
    percent,
    label = CASHBACK_BADGE_LABEL,
    shape = 'tab',
    alwaysExpanded = false,
    className,
    classNames,
    ref,
    ...otherProps
  } = props

  const { collapsed, handle } = useCashbackBadgeExpand(alwaysExpanded)

  useImperativeHandle(ref, () => handle, [handle])

  const slots = cashbackBadgeVariants({ shape, collapsed })

  const formattedPercent = formatCashbackBadgePercent(percent)

  return (
    <div
      dir="ltr"
      data-slot="cashback-badge"
      data-collapsed={collapsed ? true : undefined}
      // The label is visually clipped while collapsed, so the benefit is named
      // on the root instead of leaving screen readers with a bare percentage.
      aria-label={`${formattedPercent} ${label}`}
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      <span
        data-slot="cashback-badge-percent"
        aria-hidden
        className={slots.percent({ className: classNames?.percent })}
      >
        {formattedPercent}
      </span>

      <span
        data-slot="cashback-badge-label"
        aria-hidden
        className={slots.label({ className: classNames?.label })}
      >
        {label}
      </span>

      <EmptyWallet
        data-slot="cashback-badge-icon"
        aria-hidden
        variant="Linear"
        className={slots.icon({ className: classNames?.icon })}
      />
    </div>
  )
}

export default CashbackBadgeComponent
