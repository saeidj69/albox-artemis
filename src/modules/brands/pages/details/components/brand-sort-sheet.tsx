'use client'

import { FC } from 'react'

import { RiCheckLine } from '@remixicon/react'

import { ListingProductSort } from '@/api/models'

import { createSheet, Sheet, SheetHeader, useSheet } from '@/lib/Sheet'
import { cn } from '@/lib/utils'

export const brandSortOptions: {
  value: ListingProductSort
  label: string
}[] = [
  { value: 'popularity:desc', label: 'محبوب‌ترین' },
  { value: 'price:asc', label: 'ارزان‌ترین' },
  { value: 'price:desc', label: 'گران‌ترین' },
  { value: 'discount:desc', label: 'بیشترین تخفیف' },
]

type BrandSortSheetProps = {
  selectedSort: ListingProductSort
  onApply: (sort: ListingProductSort) => void
}

const BrandSortSheetComponent: FC<BrandSortSheetProps> = (props) => {
  const { selectedSort, onApply } = props

  const sheet = useSheet()

  const handleSelect = (value: ListingProductSort) => {
    onApply(value)
    sheet.hide()
  }

  return (
    <Sheet title="مرتب‌سازی" description="مرتب‌سازی محصولات">
      <div className="flex flex-col">
        <SheetHeader title="مرتب‌سازی" showClose />

        <ul className="flex flex-col">
          {brandSortOptions.map((option, index) => {
            const active = option.value === selectedSort

            return (
              <li key={option.value} className="flex flex-col">
                {index > 0 && <div className="bg-border-lighter mx-4 h-px" />}

                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-4"
                >
                  <span
                    className={cn(
                      'typo-body-medium',
                      active
                        ? 'text-primary-700 font-semibold'
                        : 'text-text-primary',
                    )}
                  >
                    {option.label}
                  </span>

                  {active && (
                    <RiCheckLine className="text-primary-700 size-5" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </Sheet>
  )
}

const BrandSortSheet = createSheet(BrandSortSheetComponent)

export default BrandSortSheet
