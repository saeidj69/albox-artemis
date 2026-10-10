'use client'

import { ReactNode, useCallback, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { EVENTS, GtmTransformer, track } from '@/helpers/analytics'

import Animate from '@/components/Animate'
import Layout from '@/components/Layout'

import { useUserAddresses } from '@/modules/addresses/hooks'
import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'
import { useNationalCodeVerification } from '@/modules/profile/hooks/useNationalCodeVerification'
import FlipPrice from '@/modules/purchase/components/FlipPrice'
import {
  purchaseFooterErrorHeader,
  purchaseFooterHeader,
} from '@/modules/purchase/components/PurchaseFooterError'
import {
  useBasket,
  useBasketCheckCall,
  useBasketRemoteSync,
  useCheckoutData,
} from '@/modules/purchase/hooks'
import { showBasketUpdatedSheet } from '@/modules/purchase/utils'

import { VerificationStatus } from '@/api/models/verificationStatus'

import Button, { ButtonProps } from '@/lib/Button'
import { showSheet } from '@/lib/Sheet'
import Skeleton from '@/lib/Skeleton'

import DeliveryTimeslotSheet from '../DeliveryTimeslotSheet'
import BasketBrandRuleMessage from './components/BasketBrandRuleMessage'
import BasketMinPriceProgress from './components/BasketMinPriceProgress'
import BasketPriceOverviewToggle from './components/BasketPriceOverviewToggle'

const SUBMIT_LABEL = 'تایید و تکمیل خرید'

const BASE_BUTTON_PROPS: ButtonProps = {
  variant: 'primary',
  size: 'large',
  children: null,
}

const BasketFooter = () => {
  const router = useRouter()

  const [isGuarding, setIsGuarding] = useState(false)
  const [footerHeight, setFooterHeight] = useState(245)

  const observerRef = useRef<ResizeObserver | null>(null)
  const measureRef = useCallback((element: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    if (!element) return

    const measure = () => setFooterHeight(element.offsetHeight)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observerRef.current = observer
  }, [])

  const { verificationStatus } = useNationalCodeVerification()

  const { primaryAddress } = useUserAddresses()
  const { sync, isSyncing } = useBasketRemoteSync()
  const { checkout, setSelectedTimeSlotId } = useCheckoutData()
  const { data, isChecking, call: checkBasket } = useBasketCheckCall()

  const { productLines } = useBasket()

  const trackBeginCheckout = () => {
    const basket = data?.basket
    if (!basket) return

    track(EVENTS.BEGIN_CHECKOUT, {
      gtm: {
        ecommerce: GtmTransformer.toBeginCheckout({
          lines: basket.products
            .filter((product) => product.status === 'ok')
            .map((product) =>
              GtmTransformer.toBasketLine(
                product,
                productLines.find(
                  (line) => line.productId === product.productId,
                ),
              ),
            ),
          value: basket.totalPrice ?? 0,
        }),
      },
    })
  }

  const onSubmit = async () => {
    if (isGuarding || isChecking || isSyncing) return

    setIsGuarding(true)
    try {
      const { changed } = await sync()
      if (changed) {
        showBasketUpdatedSheet(router)
        return
      }

      checkBasket()

      track(EVENTS.CHECKOUT_STARTED, { plausible: true })

      showSheet(DeliveryTimeslotSheet, {
        initialSelected: checkout.selectedTimeSlotId,
        onConfirm: (timeslotId) => {
          setSelectedTimeSlotId(timeslotId)
          trackBeginCheckout()
          router.push(ROUTES.CHECKOUT)
        },
      })
    } finally {
      setIsGuarding(false)
    }
  }

  const action: { button: ButtonProps; header: ReactNode } = (() => {
    if (!primaryAddress) {
      return {
        button: {
          ...BASE_BUTTON_PROPS,
          children: 'افزودن آدرس',
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
          children: 'ویرایش اطلاعات',
          onClick: () => {
            router.push(ROUTES.PROFILE.EDIT)
          },
        },
        header: purchaseFooterErrorHeader('کد ملی شما تایید نشده است'),
      }
    }

    const rule = data?.basket?.appliedRules?.find((rule) => !rule.passed)

    switch (rule?.type) {
      case 'min_basket_price':
        return {
          button: {
            ...BASE_BUTTON_PROPS,
            children: SUBMIT_LABEL,
            disabled: true,
          },
          header: purchaseFooterHeader(
            <BasketMinPriceProgress
              min={rule?.properties?.minBasketPrice || 0}
              total={data?.basket?.totalPrice || 0}
            />,
          ),
        }

      case 'min_unique_product_brands':
        return {
          button: {
            ...BASE_BUTTON_PROPS,
            children: SUBMIT_LABEL,
            disabled: true,
          },
          header: purchaseFooterHeader(
            <BasketBrandRuleMessage
              minUniqueBrandsCount={rule.properties.minUniqueBrandsCount}
            />,
          ),
        }

      default:
        break
    }

    if (!data?.basket?.isOk) {
      return {
        button: {
          ...BASE_BUTTON_PROPS,
          children: SUBMIT_LABEL,
          disabled: true,
        },
        header: purchaseFooterErrorHeader('سبد خرید نیاز به بازبینی دارد'),
      }
    }

    return {
      button: {
        ...BASE_BUTTON_PROPS,
        children: SUBMIT_LABEL,
        onClick: onSubmit,
      },
      header: null,
    }
  })()

  if (!productLines.length) {
    return null
  }

  return (
    <Layout.Footer height={footerHeight}>
      <div ref={measureRef}>
        <Animate
          animation="slideUp"
          className="bg-background-main border-t-border-lighter relative border-t p-4 pt-6 shadow-md"
        >
          <BasketPriceOverviewToggle />

          {action.header}

          <div className="mb-4 flex justify-between">
            <div className="typo-label-medium text-text-secondary">
              قابل پرداخت
            </div>

            {!data ? (
              <Skeleton className="h-7 w-28 rounded-full" />
            ) : (
              <FlipPrice
                amount={data?.basket?.totalPrice || 0}
                className="text-text-primary"
              />
            )}
          </div>

          <Button
            {...action.button}
            className="w-full"
            loading={isChecking || isSyncing || isGuarding}
          />
        </Animate>
      </div>
    </Layout.Footer>
  )
}

export default BasketFooter
