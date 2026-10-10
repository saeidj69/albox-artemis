'use client'

import { RiEqualizerLine } from '@remixicon/react'

import Button from '@/lib/Button'
import Chip from '@/lib/Chip'

export type GlobalFilterSheetTriggerProps = {
  onOpen: () => void
  hasActiveFilters: boolean
  activeFilterCount?: number
  /** Visible label; default `فیلتر`. */
  label?: string
  className?: string
}

const DEFAULT_LABEL = 'فیلتر'

const GlobalFilterSheetTrigger = (props: GlobalFilterSheetTriggerProps) => {
  const {
    onOpen,
    hasActiveFilters,
    activeFilterCount,
    label = DEFAULT_LABEL,
    className,
  } = props

  const showNumericBadge =
    typeof activeFilterCount === 'number' && activeFilterCount > 0

  const ariaLabel = hasActiveFilters ? 'فیلتر، فیلترهایی اعمال شده' : 'فیلتر'

  return (
    <span className="relative inline-flex">
      <Button
        type="button"
        startIcon={<RiEqualizerLine />}
        variant="text"
        size="small"
        onClick={onOpen}
        className={className}
        aria-label={ariaLabel}
      >
        {label}
      </Button>
      {showNumericBadge ? (
        <span className="pointer-events-none absolute inset-e-0 -top-1 z-10">
          <Chip
            as="span"
            variant="soft"
            size="small"
            classNames={{ root: 'align-middle' }}
            content={activeFilterCount.toLocaleString('fa-IR')}
            aria-hidden
          />
        </span>
      ) : null}
      {hasActiveFilters && !showNumericBadge ? (
        <span
          className="bg-primary-600 ring-background-main pointer-events-none absolute inset-e-0 -top-0.5 size-2 rounded-full ring-2"
          aria-hidden
        />
      ) : null}
    </span>
  )
}

export default GlobalFilterSheetTrigger
