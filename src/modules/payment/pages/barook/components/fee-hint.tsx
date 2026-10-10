import { BAROOK_AMOUNT_MODE, type BarookAmountMode } from '@/constants'

import { persianDigits } from '@/utils/numbers'

import Alert from '@/lib/Alert'

import { BAROOK_PAGE_COPY } from '../constants'

type FeeHintProps = {
  mode: BarookAmountMode
  commissionPercentage: number
}

const formatPercent = (percentage: number) => persianDigits(String(percentage))

const FeeHint = (props: FeeHintProps) => {
  const { mode, commissionPercentage } = props

  const percent = formatPercent(commissionPercentage)
  const text =
    mode === BAROOK_AMOUNT_MODE.ORDER_DEDUCTION
      ? BAROOK_PAGE_COPY.feeAdded(percent)
      : BAROOK_PAGE_COPY.feeIncluded(percent)

  return (
    <Alert
      variant="info"
      classNames={{
        root: 'items-center gap-2 rounded-none border-0 bg-transparent p-0',
        icon: 'text-info-main mt-0 size-5',
        content: 'gap-0',
        description: 'typo-label-medium text-info-main',
      }}
    >
      {text}
    </Alert>
  )
}

export default FeeHint
