'use client'

import { useId, useState } from 'react'

import { ArrowUp2 } from 'iconsax-reactjs'

import { cn } from '@/lib/utils'

import CheckoutPriceOverview from '../CheckoutPriceOverview'

const CheckoutPriceOverviewToggle = () => {
  const [open, setOpen] = useState(false)

  const panelId = useId()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'بستن جزئیات' : 'نمایش جزئیات'}
        className={cn(
          'bg-background-main border-border-lighter absolute -top-4 left-1/2 flex min-h-8 min-w-8 -translate-x-1/2 items-center justify-center rounded-full border',
          'transition-transform duration-200',
          'cursor-pointer shadow-sm active:scale-95',
        )}
      >
        <ArrowUp2
          className={cn(
            'text-text-secondary size-5 transition-transform duration-200',
            !open ? 'rotate-0' : 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4">
            <CheckoutPriceOverview id={panelId} />
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutPriceOverviewToggle
