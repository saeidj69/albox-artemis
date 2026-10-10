import Button from '@/lib/Button'

import { BAROOK_CALCULATOR_FORM_ID, BAROOK_PAGE_COPY } from '../constants'
import AmountDisplay from './amount-display'

type CalculatorFooterProps = {
  orderDeductionRial: number | null
  creditDeductionRial: number | null
  disabled: boolean
  loading: boolean
}

const CalculatorFooter = (props: CalculatorFooterProps) => {
  const { orderDeductionRial, creditDeductionRial, disabled, loading } = props

  return (
    <div
      data-slot="barook-calculator-footer"
      className="flex flex-col gap-2 px-5 pt-2 pb-5"
    >
      <div className="flex h-[34px] items-center justify-between gap-2">
        <p className="typo-title-x-small text-text-secondary">
          {BAROOK_PAGE_COPY.orderDeductionLabel}
        </p>
        <AmountDisplay
          amountRial={orderDeductionRial}
          size="lg"
          placeholder="—"
        />
      </div>
      <div className="flex h-[34px] items-center justify-between gap-2">
        <p className="typo-title-x-small text-text-secondary">
          {BAROOK_PAGE_COPY.creditDeductionLabel}
        </p>
        <AmountDisplay
          amountRial={creditDeductionRial}
          size="lg"
          placeholder="—"
        />
      </div>
      <Button
        form={BAROOK_CALCULATOR_FORM_ID}
        type="submit"
        size="large"
        className="w-full"
        disabled={disabled}
        loading={loading}
      >
        {BAROOK_PAGE_COPY.confirm}
      </Button>
    </div>
  )
}

export default CalculatorFooter
