import Alert from '@/lib/Alert'

import { buildCodBarookFeeMessage } from './build-cod-barook-fee-message'

type CodBarookFeeAlertProps = {
  commissionPercentage?: number
}

const CodBarookFeeAlert = ({
  commissionPercentage,
}: CodBarookFeeAlertProps) => {
  return (
    <Alert
      variant="info"
      classNames={{
        root: 'items-start gap-2 px-4 py-2 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.04),0_10px_15px_-3px_rgba(0,0,0,0.04)]',
        description: 'typo-body-small leading-6 text-text-secondary',
      }}
    >
      {buildCodBarookFeeMessage(commissionPercentage)}
    </Alert>
  )
}

export default CodBarookFeeAlert
export type { CodBarookFeeAlertProps }
