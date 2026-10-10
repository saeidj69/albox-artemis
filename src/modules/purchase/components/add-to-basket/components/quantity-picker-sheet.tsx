'use client'

import { FC, SubmitEventHandler, useRef } from 'react'

import dynamic from 'next/dynamic'

import { persianDigits } from '@/utils/numbers'

import type { ListingProductSummary } from '@/api/models'

import Button from '@/lib/Button'
import {
  createSheet,
  Sheet,
  SheetFooter,
  SheetHeader,
  useSheet,
} from '@/lib/Sheet'

const NumberWheel = dynamic(() => import('@/lib/NumberWheel'), {
  ssr: false,
})

type QuantityPickerSheetProps = {
  product: ListingProductSummary
  initialQuantity: number
  onConfirm: (quantity: number) => void
}

const QuantityPickerSheetComponent: FC<QuantityPickerSheetProps> = ({
  product,
  initialQuantity,
  onConfirm,
}) => {
  const sheet = useSheet()

  const maxQty = product.purchasableQuantity
  const clampedInitial = Math.max(1, Math.min(initialQuantity || 1, maxQty))
  const valueRef = useRef(clampedInitial)

  const handleWheelChange = (value: number) => {
    valueRef.current = value
  }

  const handleSubmit: SubmitEventHandler = (event) => {
    event.preventDefault()

    onConfirm(valueRef.current)

    sheet.hide()
  }

  return (
    <Sheet title="تعداد محصول" description={product.name}>
      <SheetHeader title="تعداد محصول" showClose />

      <div className="flex flex-col">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <p className="typo-body-small text-text-secondary text-center">
            لطفا تعداد محصول مورد نظرتان را برای اضافه شدن به سبد خرید مشخص
            کنید.
          </p>

          <NumberWheel
            min={1}
            max={maxQty}
            defaultValue={clampedInitial}
            formatter={persianDigits}
            onChange={handleWheelChange}
          />

          <SheetFooter>
            <Button type="submit" variant="primary" size="large">
              تایید تعداد محصول
            </Button>
          </SheetFooter>
        </form>
      </div>
    </Sheet>
  )
}

const QuantityPickerSheet = createSheet(QuantityPickerSheetComponent)

export default QuantityPickerSheet
