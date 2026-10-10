'use client'

import { type FormEvent } from 'react'

import { BAROOK_AMOUNT_MODE } from '@/constants'

import Header from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import Alert from '@/lib/Alert'

import AmountBreakdown from './components/amount-breakdown'
import CalculatorFooter from './components/calculator-footer'
import CalculatorSkeleton from './components/calculator-skeleton'
import FeeHint from './components/fee-hint'
import OrderInfo from './components/order-info'
import WalletCard from './components/wallet-card'
import {
  BAROOK_CALCULATOR_FOOTER_HEIGHT,
  BAROOK_CALCULATOR_FORM_ID,
  BAROOK_PAGE_COPY,
} from './constants'
import { useBarookCalculator } from './hooks/use-barook-calculator'
import { useBarookInitiate } from './hooks/use-barook-initiate'
import {
  initiatePrincipalRial,
  type BarookCalculatorResult,
} from './utils/calculator'

type BarookCalculatorPageProps = {
  orderId: number
}

const getFooterAmounts = (
  result: BarookCalculatorResult,
  hasWalletBalance: boolean,
  isLoading: boolean,
) => {
  if (isLoading || result.validationError) {
    return { orderDeductionRial: null, creditDeductionRial: null }
  }

  if (result.isEmpty && !hasWalletBalance) {
    return { orderDeductionRial: 0, creditDeductionRial: 0 }
  }

  return {
    orderDeductionRial: result.principalRial,
    creditDeductionRial: result.providerGrossRial,
  }
}

const BarookCalculatorPage = (props: BarookCalculatorPageProps) => {
  const { orderId } = props

  const {
    mode,
    amount,
    setAmount,
    pendingAmountRial,
    wallet,
    walletPrincipalRial,
    hasWalletBalance,
    isInputDisabled,
    typedAmountRial,
    result,
    isLoading,
    pageError,
  } = useBarookCalculator(orderId)

  const { initiate, isPending } = useBarookInitiate(
    orderId,
    initiatePrincipalRial(result.principalRial, pendingAmountRial),
  )

  const footerAmounts = getFooterAmounts(result, hasWalletBalance, isLoading)

  const confirmDisabled =
    isLoading || isPending || Boolean(pageError) || !result.canSubmit

  const amountLabel =
    mode === BAROOK_AMOUNT_MODE.GATEWAY
      ? BAROOK_PAGE_COPY.gatewayAmountInput
      : BAROOK_PAGE_COPY.netPaymentInput

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (confirmDisabled) return
    initiate()
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header right={<HeaderBackButton />} center={BAROOK_PAGE_COPY.title} />
      </Layout.Header>

      <form
        id={BAROOK_CALCULATOR_FORM_ID}
        onSubmit={handleSubmit}
        className="-mx-4"
      >
        <main className="w-app">
          {isLoading ? (
            <CalculatorSkeleton />
          ) : (
            <>
              <OrderInfo
                creditLimitRial={wallet?.remote?.expendableCreditAmount ?? null}
                orderPayableRial={pendingAmountRial}
              />

              <div className="flex flex-col gap-4 px-5 py-4">
                {pageError ? <Alert variant="error">{pageError}</Alert> : null}

                {hasWalletBalance ? (
                  <WalletCard
                    balanceRial={wallet?.balance ?? 0}
                    usablePrincipalRial={walletPrincipalRial}
                  />
                ) : null}

                {wallet ? (
                  <FeeHint
                    mode={mode}
                    commissionPercentage={wallet.commissionPercentage}
                  />
                ) : null}

                <AmountBreakdown
                  id="barook-amount"
                  label={amountLabel}
                  value={amount}
                  error={Boolean(result.validationError)}
                  helperText={result.validationError ?? undefined}
                  disabled={isInputDisabled}
                  onChange={setAmount}
                  mode={mode}
                  result={result}
                  typedAmountRial={typedAmountRial}
                />
              </div>
            </>
          )}
        </main>
      </form>

      <Layout.Footer
        height={BAROOK_CALCULATOR_FOOTER_HEIGHT}
        className="bg-background-main shadow-sm"
      >
        <CalculatorFooter
          orderDeductionRial={footerAmounts.orderDeductionRial}
          creditDeductionRial={footerAmounts.creditDeductionRial}
          disabled={confirmDisabled}
          loading={isPending}
        />
      </Layout.Footer>
    </>
  )
}

export default BarookCalculatorPage
