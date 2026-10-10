'use client'

import { useCallback, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES, TOMAN } from '@/constants'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import Layout from '@/components/Layout'

import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import {
  getShowCustomerOrderQueryKey,
  useCustomerApproveOrder,
  useCustomerCancelOrder,
  useShowCustomerOrder,
} from '@/api/functions/order'
import { useProfile } from '@/api/functions/profile'

import Button from '@/lib/Button'
import { hideSheet, showSheet } from '@/lib/Sheet'

import { useAddOrderProductsToBasket } from '../utils/add-order-products-to-basket'
import OrderPriceSummary, {
  type OrderPriceSummaryRow,
} from './order-price-summary'
import RejectOrderSheet from './reject-order-sheet'

type OrderDetailFooterProps = {
  orderId: number
}

const OrderDetailFooter = (props: OrderDetailFooterProps) => {
  const { orderId } = props

  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: orderData } = useShowCustomerOrder(orderId)
  const { data: profileData } = useProfile()

  const addOrderProductsToBasket = useAddOrderProductsToBasket()

  // The footer reserves scroll space via Layout.Footer's `height` spacer, which
  // does not auto-size — measure the rendered footer so the summary (flat for
  // cancelled, taller for the emphasized normal total) is always fully reserved.
  const [footerHeight, setFooterHeight] = useState(220)

  const observerRef = useRef<ResizeObserver | null>(null)
  const measureRef = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    if (!el) return
    setFooterHeight(el.offsetHeight)
    const observer = new ResizeObserver(() => setFooterHeight(el.offsetHeight))
    observer.observe(el)
    observerRef.current = observer
  }, [])

  const invalidateOrder = () =>
    queryClient.invalidateQueries({
      queryKey: getShowCustomerOrderQueryKey(orderId),
    })

  const { mutate: approveOrder, isPending: isApproving } =
    useCustomerApproveOrder({
      mutation: {
        onSuccess: () => {
          void invalidateOrder()
          toast.success('سفارش با موفقیت تایید شد.')
        },
        onError: () => {
          toast.error('خطا در تایید سفارش.')
        },
      },
    })

  const { mutate: cancelOrder, isPending: isCanceling } =
    useCustomerCancelOrder()

  const order = orderData?.order

  if (!order) return null

  const statusValue = order.status.value
  const paymentStatusValue = order.paymentStatus.value
  const isImpersonating = profileData?.profile.isImpersonating ?? false
  const isCanceled = statusValue === 'canceled'
  const isPendingPayment = paymentStatusValue === 'pending'
  const isPendingCustomerApproval = statusValue === 'pending_customer_approval'

  const showApproveReject = !isImpersonating && isPendingCustomerApproval
  const showOnlinePayment =
    !isCanceled && paymentStatusValue === 'provisional_paid'
  const showTransactionDetails = !isCanceled
  const showPaymentButtons = showTransactionDetails || showOnlinePayment
  const showReorder = !showApproveReject && !showPaymentButtons

  const totalQuantity = order.products.reduce((sum, p) => sum + p.quantity, 0)
  const toToman = (value: number) => formatPrice(toTomanPrice(value))

  const deliveryRow: OrderPriceSummaryRow =
    order.netDeliveryFee === 0
      ? { label: 'هزینه ارسال:', value: 'رایگان' }
      : {
          label: 'هزینه ارسال:',
          value: toToman(order.netDeliveryFee),
          unit: TOMAN,
        }

  const summaryItems: OrderPriceSummaryRow[] = isCanceled
    ? [
        {
          label: 'تعداد اقلام:',
          value: persianDigits(totalQuantity),
          unit: 'باکس',
        },
        {
          label: 'مجموع قیمت محصولات لغو شده:',
          value: toToman(order.totalProductsPrice),
          unit: TOMAN,
        },
        {
          label: 'مجموع تخفیف محصولات لغو شده:',
          value: toToman(order.totalDiscountAmount),
          unit: TOMAN,
        },
        deliveryRow,
        { label: 'مبلغ کل:', value: toToman(order.netTotal), unit: TOMAN },
      ]
    : [
        {
          label: 'تعداد اقلام:',
          value: persianDigits(totalQuantity),
          unit: 'باکس',
        },
        {
          label: 'مجموع قیمت محصولات:',
          value: toToman(order.totalProductsPrice),
          unit: TOMAN,
        },
        deliveryRow,
        {
          label: 'سود شما از خرید:',
          value: toToman(order.totalDiscountAmount),
          unit: TOMAN,
        },
        {
          label: 'مبلغ کل:',
          value: toToman(order.netTotal),
          unit: TOMAN,
          emphasized: true,
        },
      ]

  const handleShowTransactionDetails = () => {
    router.push(ROUTES.ORDERS.payment(orderId))
  }

  const handleApprove = () => {
    approveOrder({ orderId })
  }

  const handleCancelOnly = () => {
    cancelOrder(
      { orderId },
      {
        onSuccess: () => {
          void invalidateOrder()
          toast.success('سفارش لغو شد.')
          hideSheet(RejectOrderSheet)
        },
        onError: () => {
          toast.error('خطا در لغو سفارش.')
        },
      },
    )
  }

  const handleCancelAndMoveToBasket = () => {
    cancelOrder(
      { orderId },
      {
        onSuccess: async () => {
          void invalidateOrder()
          hideSheet(RejectOrderSheet)
          const addedCount = await addOrderProductsToBasket(order.products)
          if (addedCount === 0) {
            toast.error('لطفا محصولات را به صورت دستی به سبد خرید اضافه کنید.')
            return
          }
          toast.success('سفارش لغو و محصولات به سبد خرید اضافه شد.')
          router.push(ROUTES.BASKET)
        },
        onError: () => {
          toast.error('خطا در لغو سفارش.')
        },
      },
    )
  }

  const handleShowRejectSheet = () => {
    showSheet(RejectOrderSheet, {
      loading: isCanceling,
      onCancelOrder: handleCancelOnly,
      onMoveToBasket: handleCancelAndMoveToBasket,
    })
  }

  const handleReorder = async () => {
    const addedCount = await addOrderProductsToBasket(order.products)
    if (addedCount === 0) {
      toast.error('لطفا محصولات را به صورت دستی به سبد خرید اضافه کنید.')
      return
    }
    toast.success('محصولات به سبد خرید اضافه شد.')
    router.push(ROUTES.BASKET)
  }

  const renderButtons = () => {
    if (isPendingPayment) {
      return (
        <Button variant="primary" size="medium" className="flex-1" disabled>
          در انتظار پرداخت
        </Button>
      )
    }

    if (showApproveReject) {
      return (
        <>
          <Button
            variant="destructive-soft"
            size="medium"
            className="flex-1"
            disabled={isCanceling || isApproving}
            onClick={handleShowRejectSheet}
          >
            عدم تایید
          </Button>
          <Button
            variant="primary"
            size="medium"
            className="flex-1"
            loading={isApproving}
            disabled={isCanceling}
            onClick={handleApprove}
          >
            تایید
          </Button>
        </>
      )
    }

    if (showPaymentButtons) {
      return (
        <>
          <Button
            variant="primary"
            size="medium"
            className="w-full"
            onClick={handleShowTransactionDetails}
          >
            جزئیات تراکنش و پرداخت
          </Button>
        </>
      )
    }

    if (showReorder) {
      return (
        <Button
          variant="primary"
          size="medium"
          className="flex-1"
          onClick={handleReorder}
        >
          سفارش مجدد
        </Button>
      )
    }

    return null
  }

  return (
    <Layout.Footer
      height={footerHeight}
      className="bg-background-main shadow-sm"
    >
      <div ref={measureRef} className="border-border-lighter border-t-[6px]">
        <div className="px-4 pt-3">
          <OrderPriceSummary items={summaryItems} />
        </div>

        <div className="flex gap-3 px-4 pt-3 pb-4">{renderButtons()}</div>
      </div>
    </Layout.Footer>
  )
}

export default OrderDetailFooter
