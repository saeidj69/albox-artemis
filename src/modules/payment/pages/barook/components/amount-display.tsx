import { TOMAN } from '@/constants'

import { formatPrice } from '@/utils/numbers'

import { cn } from '@/lib/utils'

import { rialToTomanTrunc } from '../utils/calculator'

type AmountDisplayProps = {
  amountRial: number | null
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  valueClassName?: string
  className?: string
}

const VALUE_CLASS = {
  sm: 'typo-title-x-small',
  md: 'typo-body-medium',
  lg: 'typo-title-medium',
} as const

const AmountDisplay = (props: AmountDisplayProps) => {
  const {
    amountRial,
    size = 'md',
    placeholder = '-',
    valueClassName,
    className,
  } = props

  const value =
    amountRial == null ? placeholder : formatPrice(rialToTomanTrunc(amountRial))

  return (
    <span
      data-slot="barook-amount"
      className={cn('flex items-center gap-1', className)}
    >
      <span
        data-slot="barook-amount-value"
        className={cn('text-text-primary', VALUE_CLASS[size], valueClassName)}
      >
        {value}
      </span>
      <span
        data-slot="barook-amount-unit"
        className="typo-body-x-small text-text-secondary leading-5"
      >
        {TOMAN}
      </span>
    </span>
  )
}

export default AmountDisplay
