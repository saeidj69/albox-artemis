import Button from '@/lib/Button'

import { PAYMENT_RESULT_COPY } from '../constants'

type ResultActionsProps = {
  isSuccess: boolean
  onPrimary: () => void
  onSecondary: () => void
}

const ResultActions = (props: ResultActionsProps) => {
  const { isSuccess, onPrimary, onSecondary } = props
  const copy = isSuccess
    ? PAYMENT_RESULT_COPY.success
    : PAYMENT_RESULT_COPY.failed

  return (
    <div className="flex w-full items-stretch gap-3">
      <Button
        size="medium"
        className="h-auto min-h-10 min-w-0 flex-1 px-3"
        classNames={{ content: 'text-center leading-5 whitespace-normal' }}
        onClick={onPrimary}
      >
        {copy.primary}
      </Button>
      <Button
        size="medium"
        variant="text"
        className="bg-primary-50 h-auto min-h-10 min-w-0 flex-1 px-3"
        classNames={{ content: 'text-center leading-5 whitespace-normal' }}
        onClick={onSecondary}
      >
        {copy.secondary}
      </Button>
    </div>
  )
}

export default ResultActions
