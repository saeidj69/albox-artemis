'use client'

import { useEffect, useRef } from 'react'

import { EVENTS, track, WETransformer } from '@/helpers/analytics'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import {
  useAutoBasketCheck,
  useBasketCheckCall,
  useBasketRemoteSync,
  useCheckoutData,
  useCheckoutWallet,
} from '@/modules/purchase/hooks'

import { composeIsoDateTime, formatJalaliTimeslot } from '@/utils/date'

import CheckoutComment from './components/CheckoutComment'
import CheckoutDeliveryInfo from './components/CheckoutDeliveryInfo'
import CheckoutFooter from './components/CheckoutFooter'
import CheckoutPaymentMethod from './components/CheckoutPaymentMethod'
import CheckoutWallet from './components/CheckoutWallet'

const CheckoutPage = () => {
  useBasketRemoteSync()
  useAutoBasketCheck()

  const hasTracked = useRef(false)
  const { checkout } = useCheckoutData()
  const { data, isChecking } = useBasketCheckCall()
  const { hasBalance, isLoading: isWalletLoading } = useCheckoutWallet()

  const selectedTimeslotId = checkout.selectedTimeSlotId
  const selectedTimeslot = data?.basket?.timeslotOptions?.find(
    (option) => +option.id === +(selectedTimeslotId ?? 0),
  )

  useEffect(() => {
    if (hasTracked.current) return
    if (isChecking || isWalletLoading) return
    if (!selectedTimeslot) return

    hasTracked.current = true

    track(EVENTS.VIEW_CHECKOUT, {
      webengage: WETransformer.toViewCheckout({
        walletHasBalance: hasBalance ? 1 : 0,
        timeslot: formatJalaliTimeslot(
          composeIsoDateTime(
            selectedTimeslot.deliveryDate,
            selectedTimeslot.deliveryStartTime,
          ),
          composeIsoDateTime(
            selectedTimeslot.deliveryDate,
            selectedTimeslot.deliveryEndTime,
          ),
        ),
      }),
    })
  }, [hasBalance, isChecking, isWalletLoading, selectedTimeslot])

  return (
    <>
      <Layout.Header height={64}>
        <Header
          left={<HeaderLogo asLink={false} />}
          center="تایید نهایی و پرداخت"
          right={<HeaderBackButton />}
        />
      </Layout.Header>

      <main className="space-y-4 py-4">
        <CheckoutDeliveryInfo />

        <CheckoutWallet />

        <CheckoutPaymentMethod />

        <CheckoutComment />
      </main>

      <CheckoutFooter />
    </>
  )
}

export default CheckoutPage
