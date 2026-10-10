import { Fragment } from 'react'

import FlipDigits from '@/lib/FlipDigits'
import { cn } from '@/lib/utils'

type FlipPriceProps = {
  amount: number
  strikethrough?: boolean
  className?: string
  amountClassName?: string
  currencyClassName?: string
  size?: 'small' | 'medium' | 'large'
}

/**
 * Split a Rial amount into Toman thousands groups, ordered
 * least-significant-first. The outer container is RTL, so this DOM order
 * renders visually most-significant-first.
 */
const toGroupsLsbFirst = (value: number): number[] => {
  const toman = Number.isFinite(value) ? value / 10 : 0
  const safe = Math.max(0, Math.round(toman))
  if (safe === 0) return [0]

  const groups: number[] = []
  let rest = safe
  while (rest > 0) {
    groups.push(rest % 1000)
    rest = Math.floor(rest / 1000)
  }
  return groups
}

const FlipPrice = ({
  amount,
  strikethrough,
  className,
  amountClassName,
  currencyClassName,
  size = 'medium',
}: FlipPriceProps) => {
  const groups = toGroupsLsbFirst(amount)

  return (
    <span
      dir="rtl"
      className={cn(
        'inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums',
        strikethrough && 'text-text-tertiary line-through',
        className,
      )}
    >
      <span
        className={cn(
          'typo-title-medium inline-flex items-baseline font-bold',
          amountClassName,
        )}
      >
        {groups.map((group, index) => {
          const isMostSignificant = index === groups.length - 1
          return (
            <Fragment key={index}>
              {index > 0 && (
                <span aria-hidden className="opacity-60">
                  ٬
                </span>
              )}
              <FlipDigits
                value={group}
                minDigits={isMostSignificant ? 1 : 3}
                size={size}
              />
            </Fragment>
          )
        })}
      </span>
      <span
        className={cn(
          'typo-body-x-small text-text-secondary',
          currencyClassName,
        )}
      >
        تومان
      </span>
    </span>
  )
}

export default FlipPrice
export type { FlipPriceProps }
