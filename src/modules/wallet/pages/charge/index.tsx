'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'

import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import {
  useChargeClientCreditWallet,
  useGetPaymentProfile,
} from '@/api/functions/wallet-management'

import Button from '@/lib/Button'

import AmountInput from './components/amount-input'
import CurrentBalanceCard from './components/current-balance-card'
import SuggestionChips from './components/suggestion-chips'

/** Backend minimum is 10,000 Rials; the UI accepts Toman. */
const MIN_CHARGE_TOMAN = 1_000

const ChargeWalletPage = () => {
  const router = useRouter()
  const [amount, setAmount] = useState('')

  const { data } = useGetPaymentProfile()
  const { mutate: chargeWallet, isPending } = useChargeClientCreditWallet()

  const creditAmount =
    data?.amounts.find((a) => a.type.value === 'credit')?.amount ?? 0
  const giftAmount =
    data?.amounts.find((a) => a.type.value === 'gift')?.amount ?? 0
  const totalBalance = creditAmount + giftAmount

  const numericAmount = Number(amount) || 0

  const handleChipSelect = (value: number) => {
    setAmount(String(value))
  }

  const handleSubmit = () => {
    if (numericAmount < MIN_CHARGE_TOMAN) return

    chargeWallet(
      {
        data: {
          amount: numericAmount * 10,
          gateway: 'mellat',
          callbackUrl: `${window.location.origin}${ROUTES.WALLET.ROOT}`,
        },
      },
      {
        onSuccess: (response) => {
          window.location.href = response.checkoutPageUrl
        },
      },
    )
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="افزایش موجودی کیف پول"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="space-y-6 p-4">
        <CurrentBalanceCard
          totalBalance={totalBalance}
          creditAmount={creditAmount}
          giftAmount={giftAmount}
        />

        <p className="text-text-primary typo-body-medium">
          لطفا مبلغ مورد نظر برای افزایش موجودی کیف پول خود را مشخص کنید:
        </p>

        <AmountInput value={amount} onChange={setAmount} />

        <SuggestionChips inputValue={amount} onSelect={handleChipSelect} />
      </main>

      <Layout.Footer height={80}>
        <div className="flex gap-3 p-4">
          <Button
            size="large"
            variant="ghost"
            className="flex-1"
            onClick={() => router.back()}
          >
            انصراف
          </Button>
          <Button
            size="large"
            className="flex-2"
            loading={isPending}
            disabled={numericAmount < MIN_CHARGE_TOMAN}
            onClick={handleSubmit}
          >
            افزایش موجودی
          </Button>
        </div>
      </Layout.Footer>
    </>
  )
}

export default ChargeWalletPage
