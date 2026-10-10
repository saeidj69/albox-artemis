import { BAROOK_AMOUNT_MODE, type BarookAmountMode } from '@/constants'

import Divider from '@/lib/Divider'

import { BAROOK_PAGE_COPY } from '../constants'
import type { BarookCalculatorResult } from '../utils/calculator'
import AmountDisplay from './amount-display'

type BreakdownCardProps = {
  mode: BarookAmountMode
  result: BarookCalculatorResult
  typedAmountRial: number | null
}

const BreakdownCard = (props: BreakdownCardProps) => {
  const { mode, result, typedAmountRial } = props

  const isGateway = mode === BAROOK_AMOUNT_MODE.GATEWAY

  const showValues = !result.isEmpty

  const firstAmount = showValues
    ? isGateway
      ? typedAmountRial
      : result.creditPrincipalRial
    : null
  const feeAmount = showValues ? result.creditCommissionRial : null
  const totalAmount = showValues
    ? isGateway
      ? result.creditPrincipalRial
      : result.creditGrossRial
    : null

  return (
    <div data-slot="barook-breakdown-rows" className="flex flex-col gap-2">
      <div className="flex h-7 items-center justify-between gap-2">
        <p className="typo-body-small text-text-secondary leading-6">
          {isGateway
            ? BAROOK_PAGE_COPY.gatewayAmountLabel
            : BAROOK_PAGE_COPY.netPaymentLabel}
        </p>
        <AmountDisplay amountRial={firstAmount} />
      </div>

      <div className="flex h-7 items-center justify-between gap-2">
        <p className="typo-body-small text-text-secondary leading-6">
          {BAROOK_PAGE_COPY.bankFeeLabel}
        </p>
        <AmountDisplay amountRial={feeAmount} />
      </div>

      <Divider />

      <div className="flex h-[34px] items-center justify-between gap-2">
        <p className="typo-title-x-small text-text-primary leading-7">
          {isGateway
            ? BAROOK_PAGE_COPY.orderDeductionLabel
            : BAROOK_PAGE_COPY.payableFromCreditLabel}
        </p>
        <AmountDisplay amountRial={totalAmount} size="lg" />
      </div>
    </div>
  )
}

export default BreakdownCard
