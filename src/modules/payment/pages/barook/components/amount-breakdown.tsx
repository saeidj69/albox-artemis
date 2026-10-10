import { type BarookAmountMode } from '@/constants'

import { cn } from '@/lib/utils'

import type { BarookCalculatorResult } from '../utils/calculator'
import AmountField from './amount-field'
import BreakdownCard from './breakdown-card'

type AmountBreakdownProps = {
  id?: string
  label: string
  value: string
  error?: boolean
  helperText?: string
  disabled?: boolean
  onChange: (value: string) => void
  mode: BarookAmountMode
  result: BarookCalculatorResult
  typedAmountRial: number | null
}

const AmountBreakdown = (props: AmountBreakdownProps) => {
  const {
    id,
    label,
    value,
    error,
    helperText,
    disabled,
    onChange,
    mode,
    result,
    typedAmountRial,
  } = props

  return (
    <div data-slot="barook-amount-breakdown" className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={cn(
          'typo-label-medium leading-5',
          error ? 'text-error-dark' : 'text-text-primary',
        )}
      >
        {label}
      </label>

      <section
        data-slot="barook-breakdown"
        className="border-border-darker bg-background-secondary rounded-[10px] border pb-3"
      >
        <AmountField
          id={id}
          value={value}
          error={error}
          helperText={helperText}
          disabled={disabled}
          onChange={onChange}
          classNames={{
            content:
              'bg-background-main relative z-10 h-11 w-[calc(100%+2px)] -mx-px -mt-px rounded-[10px] px-3 py-0',
            end: 'mr-0',
          }}
        />

        <div className="mt-2 px-3">
          <BreakdownCard
            mode={mode}
            result={result}
            typedAmountRial={typedAmountRial}
          />
        </div>
      </section>
    </div>
  )
}

export default AmountBreakdown
