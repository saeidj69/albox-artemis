'use client'

import { Wallet } from 'iconsax-reactjs'

import { useCheckoutData } from '@/modules/purchase/hooks'

import { formatPrice, persianDigits } from '@/utils/numbers'

import { useGetPaymentMethods } from '@/api/functions/payment-management'
import { PaymentPaymentMethod, PaymentWalletType } from '@/api/models'

import Skeleton from '@/lib/Skeleton'
import Switch from '@/lib/Switch'
import { cn } from '@/lib/utils'

import { buildWalletBreakdownText } from './utils/build-wallet-breakdown-text'

const CheckoutWallet = () => {
  const { checkout, setWalletUsage } = useCheckoutData()
  const { data: paymentMethods, isLoading } = useGetPaymentMethods()

  const onToggleWalletUsage = () => {
    setWalletUsage(!checkout.walletUsage)
  }

  const walletMethod = paymentMethods?.methods?.find(
    (method) => method.type.value === PaymentPaymentMethod.credit,
  )

  const walletBreakdown = walletMethod?.breakDown ?? []

  const totalWalletAmount =
    walletMethod?.maxAvailableAmount ??
    walletBreakdown.reduce((sum, item) => sum + item.amount, 0)

  const giftAmount =
    walletBreakdown.find((i) => i?.type?.value === PaymentWalletType.gift)
      ?.amount ?? 0

  const chargeAmount =
    walletBreakdown.find((i) => i?.type?.value === PaymentWalletType.credit)
      ?.amount ?? 0

  const barookAmount =
    walletBreakdown.find((i) => i?.type?.value === PaymentWalletType.barook)
      ?.amount ?? 0

  if (isLoading) {
    return (
      <section>
        <h3 className="typo-title-small text-text-primary mb-3">کیف پول:</h3>
        <Skeleton className="h-18 w-full rounded-xl" />
      </section>
    )
  }

  if (!walletMethod?.maxAvailableAmount) return null

  const breakdownText = buildWalletBreakdownText({
    giftAmount,
    chargeAmount,
    barookAmount,
  })

  return (
    <section data-slot="checkout-wallet">
      <h3 className="typo-title-small text-text-primary mb-3">کیف پول:</h3>

      <div
        className={cn(
          'rounded-brand border-border-main border p-3',
          'active:bg-background-secondary cursor-pointer duration-100',
        )}
        role="button"
        onClick={onToggleWalletUsage}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="bg-success-lighter flex size-10 shrink-0 items-center justify-center rounded-full">
            <Wallet className="text-success-main size-5" />
          </div>

          <div className="min-w-0 flex-1 text-right">
            <span className="typo-body-medium">کیف پول‌های آل‌باکس: </span>

            <span className="text-text-primary">
              <span className="typo-body-medium">
                {persianDigits(
                  formatPrice(Number((totalWalletAmount / 10).toFixed(0))),
                )}
              </span>
              <span> </span>
              <span className="typo-body-small text-text-secondary">تومان</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              size="small"
              checked={checkout.walletUsage}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={onToggleWalletUsage}
            />
          </div>
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            checkout.walletUsage ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-2 pt-3">
              {breakdownText.map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between"
                >
                  <p className="typo-body-small text-text-secondary">
                    {index + 1}. {item.title}:
                  </p>

                  <p className="typo-body-small text-text-primary text-left">
                    <span>
                      {persianDigits(
                        formatPrice(Number((item.amount / 10).toFixed(0))),
                      )}
                    </span>
                    <span> تومان</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CheckoutWallet
