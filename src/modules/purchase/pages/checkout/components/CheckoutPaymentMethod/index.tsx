'use client'

import { useEffect } from 'react'

import { EVENTS, track } from '@/helpers/analytics'

import Animate from '@/components/Animate'

import {
  useBasketCheckCall,
  useCheckoutData,
  useCheckoutWallet,
} from '@/modules/purchase/hooks'

import {
  calculateCashbackAmount,
  getEnvCashbackPercent,
} from '@/utils/cashback'

import { useGetBarookWallet } from '@/api/functions/barook'
import { useGetPaymentMethods } from '@/api/functions/payment-management'
import { OrderOrderPaymentMethod, PaymentPaymentMethod } from '@/api/models'

import RadioGroup from '@/lib/Radio'

import CodBarookFeeAlert from './components/CodBarookFeeAlert'
import IpgCashbackAlert from './components/IpgCashbackAlert'
import PaymentMethodOption from './components/PaymentMethodOption'

const PAYMENT_METHOD_TRACK_MAP: Partial<
  Record<OrderOrderPaymentMethod, 'payment_online' | 'payment_cash_on_delivery'>
> = {
  [PaymentPaymentMethod.ipg]: 'payment_online',
  [PaymentPaymentMethod.cod]: 'payment_cash_on_delivery',
}

const CheckoutPaymentMethod = () => {
  const { data: paymentData, isLoading } = useGetPaymentMethods()
  const { data: basketData } = useBasketCheckCall()
  const { checkout, setSelectedPaymentMethod } = useCheckoutData()
  const {
    isEnabled: walletEnabled,
    isSufficient: walletSufficient,
    deductionAmount,
  } = useCheckoutWallet()

  const methods =
    paymentData?.methods?.filter(
      (method) => method.type.value !== PaymentPaymentMethod.credit,
    ) ?? []

  const codMethod = methods.find(
    (m) => m.type.value === PaymentPaymentMethod.cod,
  )
  const defaultMethod =
    methods.length === 0
      ? null
      : ((codMethod?.type.value ??
          methods[0].type.value) as OrderOrderPaymentMethod)

  useEffect(() => {
    if (checkout.selectedPaymentMethod) return
    if (!defaultMethod) return
    setSelectedPaymentMethod(defaultMethod)
  }, [checkout.selectedPaymentMethod, defaultMethod, setSelectedPaymentMethod])

  const basketTotal = basketData?.basket?.totalPrice ?? 0
  const totalPayable = Math.max(0, basketTotal - deductionAmount)
  const radioDisabled = walletEnabled && walletSufficient
  const selected = checkout.selectedPaymentMethod
  const isCodSelected = selected === PaymentPaymentMethod.cod
  const isIpgSelected = selected === PaymentPaymentMethod.ipg
  const cashbackPercent = getEnvCashbackPercent()
  const cashbackAmount = calculateCashbackAmount(totalPayable, cashbackPercent)

  const { data: barookWallet, isSuccess: isBarookWalletSuccess } =
    useGetBarookWallet(undefined, {
      query: {
        enabled: isCodSelected,
        retry: false,
      },
      request: { skipErrorToast: true },
    })

  const handleMethodSelect = (value: string) => {
    const method = value as OrderOrderPaymentMethod
    setSelectedPaymentMethod(method)
    const mapped = PAYMENT_METHOD_TRACK_MAP[method]
    if (mapped) {
      track(EVENTS.PAYMENT_METHOD_SELECTED, {
        plausible: { method: mapped },
      })
    }
  }

  return (
    <section data-slot="checkout-payment-method">
      <h3 className="typo-title-small text-text-primary mb-3">روش پرداخت:</h3>

      {isLoading ? (
        <div className="space-y-2">
          <PaymentMethodOption.Skeleton />
          <PaymentMethodOption.Skeleton />
        </div>
      ) : methods.length === 0 ? (
        <p className="typo-body-small text-text-secondary">
          روش پرداختی در دسترس نیست.
        </p>
      ) : (
        <RadioGroup
          value={selected ?? ''}
          onValueChange={handleMethodSelect}
          disabled={radioDisabled}
          className="grid gap-2"
        >
          {methods.map((method, index) => {
            const isCod = method.type.value === PaymentPaymentMethod.cod
            const isIpg = method.type.value === PaymentPaymentMethod.ipg
            const showCodFeeAlert = isCod && isCodSelected

            return (
              <Animate delay={index * 100} key={method.type.value}>
                <div className="space-y-2">
                  <PaymentMethodOption
                    method={method}
                    selected={selected}
                    totalPayable={totalPayable}
                    disabled={radioDisabled}
                    cashbackPercent={isIpg ? cashbackPercent : undefined}
                  />
                  {showCodFeeAlert && (
                    <CodBarookFeeAlert
                      commissionPercentage={
                        isBarookWalletSuccess
                          ? barookWallet.commissionPercentage
                          : undefined
                      }
                    />
                  )}
                  {isIpg &&
                    isIpgSelected &&
                    cashbackAmount != null &&
                    cashbackAmount > 0 && (
                      <IpgCashbackAlert amount={cashbackAmount} />
                    )}
                </div>
              </Animate>
            )
          })}
        </RadioGroup>
      )}
    </section>
  )
}

export default CheckoutPaymentMethod
