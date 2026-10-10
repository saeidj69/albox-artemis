'use client'

import { useEffect, useRef } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { ROUTES } from '@/constants'
import { EVENTS, track, GtmTransformer } from '@/helpers/analytics'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import {
  useBasket,
  useBasketCheckCall,
  useCheckoutData,
} from '@/modules/purchase/hooks'

import { useShowCustomerOrder } from '@/api/functions/order'
import type { OrderCustomerOrderDetails } from '@/api/models'

import ResultActions from './components/result-actions'
import ResultHero from './components/result-hero'
import { PAYMENT_RESULT_COPY, PAYMENT_RESULT_TYPE } from './constants'

const toPurchaseLine = (
  product: OrderCustomerOrderDetails['products'][number],
) => ({
  product: {
    id: product.productId,
    name: product.name,
    unitInBox: product.unitInBox,
    boxDiscountedPrice: product.netPrice,
    discount: product.discountAmount,
  },
  quantity: product.quantity,
})

const PaymentResultPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isSuccess = searchParams.get('status') === 'success'
  const isBarook = searchParams.get('type') === PAYMENT_RESULT_TYPE.BAROOK
  const referenceId = searchParams.get('referenceId')
  const orderId = Number(referenceId)
  const canLoadOrder =
    isSuccess && !isBarook && Number.isFinite(orderId) && orderId > 0
  const hasTrackedPurchase = useRef(false)

  const { clear: clearBasket } = useBasket()
  const { clear: clearCheckout } = useCheckoutData()
  const { clear: clearBasketCheckSnapshot } = useBasketCheckCall()
  const { data: orderData } = useShowCustomerOrder(canLoadOrder ? orderId : 0, {
    query: { enabled: canLoadOrder },
  })

  useEffect(() => {
    if (!isSuccess || isBarook) return

    clearBasket()
    clearCheckout()
    clearBasketCheckSnapshot()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isBarook])

  useEffect(() => {
    const order = orderData?.order
    if (!canLoadOrder || !order || hasTrackedPurchase.current) return

    hasTrackedPurchase.current = true

    const lines = order.products.map(toPurchaseLine)

    track(EVENTS.PURCHASE, {
      gtm: {
        ecommerce: GtmTransformer.toPurchase({
          orderId: String(order.id),
          value: order.netTotal,
          tax: 0,
          shipping: order.netDeliveryFee,
          coupon: '',
          lines,
        }),
      },
    })
  }, [canLoadOrder, orderData])

  const handleReturnHome = () => {
    router.replace(ROUTES.HOME)
  }

  const handleViewOrder = () => {
    if (!referenceId) {
      router.replace(ROUTES.ORDERS.ROOT)
      return
    }

    router.replace(ROUTES.ORDERS.detail(referenceId))
  }

  const handleTryAgain = () => {
    router.replace(ROUTES.CHECKOUT)
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton fallback={ROUTES.HOME} />}
          center={PAYMENT_RESULT_COPY.header}
        />
      </Layout.Header>

      <main className="w-app flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center px-5 py-10">
        <div className="flex w-full flex-col items-center gap-[72px]">
          <ResultHero
            isSuccess={isSuccess}
            isBarook={isBarook}
            referenceId={referenceId}
          />
          <ResultActions
            isSuccess={isSuccess}
            onPrimary={isSuccess ? handleViewOrder : handleTryAgain}
            onSecondary={handleReturnHome}
          />
        </div>
      </main>
    </>
  )
}

export default PaymentResultPage
