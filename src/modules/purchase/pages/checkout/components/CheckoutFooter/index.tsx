'use client'

import { ReactNode, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import {
  EVENTS,
  track,
  GtmTransformer,
  WETransformer,
} from '@/helpers/analytics'
import { toast } from 'sonner'

import Animate from '@/components/Animate'
import Layout from '@/components/Layout'

import { useLocation, useUserAddresses } from '@/modules/addresses/hooks'
import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'
import { useNationalCodeVerification } from '@/modules/profile/hooks/useNationalCodeVerification'
import FlipPrice from '@/modules/purchase/components/FlipPrice'
import { purchaseFooterErrorHeader } from '@/modules/purchase/components/PurchaseFooterError'
import {
  useBasket,
  useBasketCheckCall,
  useBasketRemoteSync,
  useCheckoutData,
  useCheckoutWallet,
} from '@/modules/purchase/hooks'
import { showBasketUpdatedSheet } from '@/modules/purchase/utils'

import { useCheckBasket } from '@/api/functions/basket'
import { usePlaceOrder } from '@/api/functions/order'
import { useGetPaymentMethods } from '@/api/functions/payment-management'
import { OrderOrderPaymentMethod, PaymentPaymentMethod } from '@/api/models'
import { VerificationStatus } from '@/api/models/verificationStatus'

import Button, { ButtonProps } from '@/lib/Button'
import Skeleton from '@/lib/Skeleton'

import CheckoutPriceOverviewToggle from './components/CheckoutPriceOverviewToggle'

const DEFAULT_GATEWAY = 'mellat'

const BASE_BUTTON_PROPS: ButtonProps = {
  variant: 'primary',
  size: 'large',
  children: null,
}

const CheckoutFooter = () => {
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { productLines } = useBasket()
  const { checkout } = useCheckoutData()
  const { sync } = useBasketRemoteSync()
  const { primaryAddress } = useUserAddresses()
  const { verificationStatus } = useNationalCodeVerification()
  const { data: basketData, isChecking } = useBasketCheckCall()
  const { location, isLoading: isLocationLoading } = useLocation()

  const {
    deductionAmount,
    isEnabled: isWalletEnabled,
    totalAmount: totalWalletAmount,
    isSufficient: isWalletSufficient,
  } = useCheckoutWallet()

  const { data: paymentData } = useGetPaymentMethods()
  const { mutateAsync: checkBasket } = useCheckBasket()
  const { mutate: placeOrder, isPending: isPlacing } = usePlaceOrder()

  const paymentMethod = checkout.selectedPaymentMethod
  const timeslotId = checkout.selectedTimeSlotId
  const basketTotal = basketData?.basket?.totalPrice ?? 0
  const totalPayable = Math.max(0, basketTotal - deductionAmount)

  const payable = (() => {
    let selectedMethodMaxAmount = 0
    if (paymentMethod) {
      selectedMethodMaxAmount =
        paymentData?.methods?.find((m) => m.type.value === paymentMethod)
          ?.maxAvailableAmount ?? 0
    }

    let label = 'قابل پرداخت'
    if (deductionAmount > 0) {
      label = 'مبلغ باقی مانده'
    }

    return {
      label,
      selectedMethodMaxAmount,
    }
  })()

  const onSubmit = async () => {
    if (!timeslotId || isLocationLoading || !location) return

    if (isPlacing || isChecking || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { changed } = await sync()
      if (changed) {
        showBasketUpdatedSheet(router)
        setIsSubmitting(false)
        return
      }

      const fresh = await checkBasket({
        data: {
          products: productLines.map((line) => ({
            id: line.productId,
            quantity: line.quantity,
          })),
          latitude: location.latitude,
          longitude: location.longitude,
          timeslotId,
        },
      }).catch(() => null)

      if (!fresh?.basket?.isOk) {
        showBasketUpdatedSheet(router)
        setIsSubmitting(false)
        return
      }

      const orderProducts = fresh.basket.products
        .filter((p) => p.status === 'ok')
        .map((p) => ({ id: p.productId, quantity: p.quantity }))

      const freshTotal = fresh.basket.totalPrice ?? 0

      const walletCoversFreshTotal =
        isWalletEnabled && totalWalletAmount >= freshTotal

      const paymentMethods: OrderOrderPaymentMethod[] = []

      if (walletCoversFreshTotal) {
        paymentMethods.push(OrderOrderPaymentMethod.credit)
      } else if (isWalletEnabled && paymentMethod) {
        paymentMethods.push(OrderOrderPaymentMethod.credit, paymentMethod)
      } else if (paymentMethod) {
        paymentMethods.push(paymentMethod)
      }

      if (paymentMethods.length === 0) {
        toast.error(
          'مبلغ سبد خرید تغییر کرده است. لطفاً روش پرداخت را دوباره انتخاب کنید.',
        )
        setIsSubmitting(false)
        return
      }

      const lines = fresh.basket.products
        .filter((product) => product.status === 'ok')
        .map((product) =>
          GtmTransformer.toBasketLine(
            product,
            productLines.find((line) => line.productId === product.productId),
          ),
        )

      track(EVENTS.ORDER_SUBMIT, {
        webengage: WETransformer.toOrderSubmit({
          paymentMethod: walletCoversFreshTotal
            ? OrderOrderPaymentMethod.credit
            : paymentMethod,
          lines,
          value: freshTotal,
        }),
      })

      let orderComment: string | null = null
      const trimmedComment = checkout.comment.trim()
      if (trimmedComment) {
        orderComment = trimmedComment
      }

      placeOrder(
        {
          data: {
            timeslotId,
            paymentMethods,
            products: orderProducts,
            addressId: primaryAddress!.id,
            paymentGateway: DEFAULT_GATEWAY,
            callbackUrl: `${window.location.origin}${ROUTES.PAYMENT.RESULT}`,
            comment: orderComment,
          },
        },
        {
          onSuccess: (res) => {
            track(EVENTS.FINALIZED_ORDER, { plausible: true })
            if (res.redirectUrl) {
              track(EVENTS.PAYMENT_METHOD_SELECTED, {
                plausible: {
                  method: 'payment_online_after_finalization',
                },
              })
              window.location.href = res.redirectUrl
            } else {
              router.push(ROUTES.ORDERS.ROOT)
            }
          },
          onSettled: () => {
            setIsSubmitting(false)
          },
        },
      )
    } catch {
      setIsSubmitting(false)
    }
  }

  let submitLabel = 'تایید و پرداخت'

  if (isWalletEnabled && isWalletSufficient) {
    submitLabel = 'تایید و پرداخت کیف پول'
  } else if (paymentMethod === PaymentPaymentMethod.cod) {
    submitLabel = 'نهایی کردن سفارش'
  } else if (isWalletEnabled && !isWalletSufficient && paymentMethod) {
    submitLabel = 'تایید و پرداخت مبلغ باقی مانده'
  }

  const action: { button: ButtonProps; header: ReactNode } = (() => {
    if (!primaryAddress) {
      return {
        button: {
          ...BASE_BUTTON_PROPS,
          children: 'انتخاب آدرس',
          onClick: () => {
            router.push(buildAddressCreateSelectLocationUrl())
          },
        },
        header: null,
      }
    }

    if (verificationStatus !== VerificationStatus.verified) {
      return {
        button: {
          ...BASE_BUTTON_PROPS,
          children: submitLabel,
          disabled: true,
        },
        header: purchaseFooterErrorHeader('کد ملی شما تایید نشده است'),
      }
    }

    if (!timeslotId) {
      return {
        button: {
          ...BASE_BUTTON_PROPS,
          children: submitLabel,
          disabled: true,
        },
        header: purchaseFooterErrorHeader('زمان تحویلی موجود نیست'),
      }
    }

    if (!paymentMethod && !(isWalletEnabled && isWalletSufficient)) {
      return {
        button: {
          ...BASE_BUTTON_PROPS,
          children: submitLabel,
          disabled: true,
        },
        header: purchaseFooterErrorHeader('روش پرداخت را انتخاب کنید'),
      }
    }

    if (
      paymentMethod &&
      !(isWalletEnabled && isWalletSufficient) &&
      payable.selectedMethodMaxAmount < totalPayable
    ) {
      return {
        button: {
          ...BASE_BUTTON_PROPS,
          children: submitLabel,
          disabled: true,
        },
        header: purchaseFooterErrorHeader(
          'مبلغ قابل پرداخت بیشتر از حد مجاز روش انتخاب شده است',
        ),
      }
    }

    return {
      button: {
        ...BASE_BUTTON_PROPS,
        children: submitLabel,
        onClick: onSubmit,
      },
      header: null,
    }
  })()

  const isLoading = isPlacing || isChecking || isSubmitting

  return (
    <Layout.Footer height={264}>
      <Animate
        animation="slideUp"
        className="bg-background-main border-t-border-lighter relative border-t p-4 pt-6 shadow-md"
      >
        <CheckoutPriceOverviewToggle />

        {action.header}

        <div className="mb-4 flex justify-between">
          <div className="typo-label-medium text-text-secondary">
            {payable.label}
          </div>

          {!basketData ? (
            <Skeleton className="h-7 w-28 rounded-full" />
          ) : (
            <FlipPrice amount={totalPayable} className="text-text-primary" />
          )}
        </div>

        <Button {...action.button} className="w-full" loading={isLoading} />
      </Animate>
    </Layout.Footer>
  )
}

export default CheckoutFooter
