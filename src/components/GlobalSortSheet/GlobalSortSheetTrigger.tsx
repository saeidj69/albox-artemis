'use client'

import { RiSortDesc } from '@remixicon/react'

import Button from '@/lib/Button'

export type GlobalSortSheetTriggerProps = {
  onOpen: () => void
  label?: string
  className?: string
}

const DEFAULT_LABEL = 'مرتب‌سازی'

const GlobalSortSheetTrigger = (props: GlobalSortSheetTriggerProps) => {
  const { onOpen, label = DEFAULT_LABEL, className } = props

  return (
    <Button
      type="button"
      variant="text"
      size="small"
      startIcon={<RiSortDesc />}
      onClick={onOpen}
      className={className}
      aria-label="مرتب‌سازی"
    >
      {label}
    </Button>
  )
}

export default GlobalSortSheetTrigger
