'use client'

import { FC } from 'react'

import Button from '@/lib/Button'
import { createSheet, Sheet, SheetHeader, useSheet } from '@/lib/Sheet'

type RejectOrderSheetProps = {
  onCancelOrder: () => void
  onMoveToBasket: () => void
  loading?: boolean
}

const RejectOrderSheetComponent: FC<RejectOrderSheetProps> = (props) => {
  const { onCancelOrder, onMoveToBasket, loading } = props
  const sheet = useSheet()

  const handleCancelOrder = () => {
    onCancelOrder()
    sheet.hide()
  }

  const handleMoveToBasket = () => {
    onMoveToBasket()
    sheet.hide()
  }

  return (
    <Sheet title="عدم تایید سفارش" description="عدم تایید سفارش">
      <SheetHeader title="عدم تایید سفارش" showClose />
      <div className="p-4">
        <p className="typo-body-medium text-text-secondary text-center">
          در صورت عدم تأیید سفارش، می‌توانید آن را لغو یا برای بررسی و ثبت مجدد
          به سبد خرید منتقل کنید.
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            variant="destructive-soft"
            size="large"
            className="flex-1"
            disabled={loading}
            onClick={handleCancelOrder}
          >
            لغو سفارش
          </Button>

          <Button
            variant="ghost"
            size="large"
            className="border-primary-600 text-primary-600 flex-1"
            loading={loading}
            onClick={handleMoveToBasket}
          >
            انتقال به سبد خرید
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

const RejectOrderSheet = createSheet(RejectOrderSheetComponent)

export default RejectOrderSheet
