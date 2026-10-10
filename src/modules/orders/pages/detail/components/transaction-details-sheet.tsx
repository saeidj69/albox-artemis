'use client'

import { FC, useState } from 'react'

import { PAYMENT_REFERENCE_ENTITY, TOMAN } from '@/constants'
import { toast } from 'sonner'

import {
  generateDeliveryReceipt,
  type ReceiptData,
} from '@/modules/orders/utils/delivery-receipt'

import { formatJalaliLongDate, formatJalaliLongDateTime } from '@/utils/date'
import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import { useShowCustomerOrder } from '@/api/functions/order'
import { useLatestPaymentByReference } from '@/api/functions/payment-management'
import { useProfile } from '@/api/functions/profile'
import { PaymentSimplifiedPaymentMethod } from '@/api/models/paymentSimplifiedPaymentMethod'

import Button from '@/lib/Button'
import InfoList, { InfoListItem } from '@/lib/InfoList'
import { createSheet, Sheet, SheetFooter, SheetHeader } from '@/lib/Sheet'

type TransactionDetailsSheetProps = {
  orderId: number
}

const formatToman = (value: number) =>
  `${formatPrice(toTomanPrice(value))} ${TOMAN}`

const allocationLabels: Record<PaymentSimplifiedPaymentMethod, string> = {
  credit: 'برداشت از شارژ کیف پول:',
  gift: 'برداشت از کیف پول هدیه:',
  ipg: 'مبلغ پرداخت شده از درگاه:',
  cod: 'مبلغ پرداخت شده از پوز:',
  barook: 'مبلغ پرداخت شده از باروک:',
}

const TransactionDetailsSheetComponent: FC<TransactionDetailsSheetProps> = (
  props,
) => {
  const { orderId } = props

  const { data: orderData } = useShowCustomerOrder(orderId)
  const { data: paymentData, isLoading: paymentLoading } =
    useLatestPaymentByReference(PAYMENT_REFERENCE_ENTITY.ORDER, orderId)
  const { data: profileData } = useProfile()

  const [isGenerating, setIsGenerating] = useState(false)

  const order = orderData?.order
  const payment = paymentData?.payment

  const handleDownloadReceipt = async () => {
    if (!order) return

    const profile = profileData?.profile

    const giftWalletDeduction =
      payment?.simplifiedAllocations
        .filter((allocation) => allocation.method.value === 'gift')
        .reduce((sum, allocation) => sum + allocation.amount, 0) ?? 0

    const data: ReceiptData = {
      orderId: order.id,
      createdAt: order.createdAt,
      customerName: profile
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : '',
      mobileNumber: profile?.mobileNumber ?? '',
      nationalCode: null,
      address: order.address?.address ?? '',
      postalCode: null,
      proofOfDeliveryCode: order.deliveryDetails.proofOfDeliveryCode ?? null,
      products: order.products.map((product) => ({
        name: product.name,
        unitInBox: product.unitInBox,
        retailPrice: product.retailPrice,
        quantity: product.quantity,
        discountAmount: product.discountAmount,
        netPrice: product.netPrice,
        totalNetPrice: product.totalNetPrice,
        vat: 0,
      })),
      totalProductsPrice: order.totalProductsPrice,
      totalDiscountAmount: order.totalDiscountAmount,
      netDeliveryFee: order.netDeliveryFee,
      netTotal: order.netTotal,
      giftWalletDeduction,
    }

    try {
      setIsGenerating(true)
      await generateDeliveryReceipt(data)
    } catch {
      toast.error('خطا در دریافت رسید.')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderBody = () => {
    if (!order) {
      return <InfoList.Skeleton variant="plain" rowCount={10} />
    }

    const pendingAmount = payment?.pendingAmount ?? 0
    const hasPending = pendingAmount > 0

    const allocationItems: InfoListItem[] =
      payment?.simplifiedAllocations
        .filter(
          (allocation) =>
            !(
              hasPending &&
              (allocation.method.value === 'cod' ||
                allocation.method.value === 'ipg')
            ),
        )
        .map((allocation) => ({
          label: allocationLabels[allocation.method.value],
          value: formatToman(allocation.amount),
        })) ?? []

    const paymentMethodLabel = payment
      ? Array.from(
          new Set(
            payment.simplifiedAllocations.map((item) => item.method.label),
          ),
        ).join(' و ')
      : ''

    const shippingValue = (() => {
      const isFree = order.netDeliveryFee === 0
      const isDiscounted = order.deliveryFee !== order.netDeliveryFee

      if (isDiscounted) {
        return (
          <span className="flex items-center gap-1">
            <span className="text-text-disabled line-through">
              {formatToman(order.deliveryFee)}
            </span>
            <span>{isFree ? 'رایگان' : formatToman(order.netDeliveryFee)}</span>
          </span>
        )
      }

      return isFree ? 'رایگان' : formatToman(order.netDeliveryFee)
    })()

    const items: InfoListItem[] = [
      {
        label: 'تاریخ تحویل:',
        value: formatJalaliLongDate(order.deliveryDate),
      },
      ...(payment
        ? [
            {
              label: 'تاریخ ثبت پرداخت:',
              value: formatJalaliLongDate(payment.createdAt),
            },
            {
              label: 'شماره تراکنش:',
              value: persianDigits(payment.id),
            },
          ]
        : []),
      {
        label: 'مجموع قیمت محصولات:',
        value: formatToman(order.totalProductsPrice),
      },
      ...allocationItems,
      ...(order.totalDiscountAmount > 0
        ? [
            {
              label: 'سود شما از خرید:',
              value: (
                <span className="text-success-dark">
                  {formatToman(order.totalDiscountAmount)}
                </span>
              ),
            },
          ]
        : []),
      {
        label: 'هزینه ارسال:',
        value: shippingValue,
      },
      ...(paymentMethodLabel
        ? [
            {
              label: 'نحوه‌ی پرداخت:',
              value: paymentMethodLabel,
            },
          ]
        : []),
      {
        label: 'کل مبلغ پرداخت شما:',
        value: formatToman(order.netTotal),
        emphasized: true,
      },
    ]

    return (
      <div className="grid gap-3">
        <div className="flex items-center justify-between py-2">
          <span className="typo-body-small text-text-secondary">
            <span>شماره سفارش: </span>
            <span className="text-text-primary">{persianDigits(order.id)}</span>
          </span>
          <span className="typo-body-small text-text-secondary">
            {formatJalaliLongDateTime(order.createdAt)}
          </span>
        </div>
        <div className="bg-border-lighter h-px w-full" />
        <InfoList variant="plain" items={items} />
        {paymentLoading && !payment ? (
          <p className="typo-body-x-small text-text-secondary text-center">
            در حال دریافت اطلاعات پرداخت...
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <Sheet title="جزئیات تراکنش" description="جزئیات تراکنش">
      <SheetHeader title="جزئیات تراکنش" showClose />
      <div className="max-h-[70vh] overflow-y-auto p-4">{renderBody()}</div>
      <SheetFooter className="bg-background-main border-border-lighter border-t p-4">
        <Button
          variant="primary"
          size="large"
          className="w-full"
          loading={isGenerating}
          disabled={!order || order.products.length === 0}
          onClick={handleDownloadReceipt}
        >
          دریافت رسید
        </Button>
      </SheetFooter>
    </Sheet>
  )
}

const TransactionDetailsSheet = createSheet(TransactionDetailsSheetComponent)

export default TransactionDetailsSheet
