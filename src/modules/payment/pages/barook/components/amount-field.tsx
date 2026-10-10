import type { MouseEvent, PointerEvent } from 'react'

import { TOMAN } from '@/constants'
import { CloseCircle } from 'iconsax-reactjs'

import { formatPrice } from '@/utils/numbers'

import IconButton from '@/lib/IconButton'
import Input, { type InputProps } from '@/lib/Input'
import { cn } from '@/lib/utils'

import { BAROOK_PAGE_COPY } from '../constants'
import { sanitizeTomanAmount } from '../utils/calculator'

type AmountFieldClassNames = InputProps['classNames'] & {
  clear?: string
  currency?: string
}

type AmountFieldProps = {
  id?: string
  label?: string
  value: string
  error?: boolean
  helperText?: string
  disabled?: boolean
  onChange: (value: string) => void
  classNames?: AmountFieldClassNames
}

const AmountField = (props: AmountFieldProps) => {
  const {
    id,
    label,
    value,
    error,
    helperText,
    disabled,
    onChange,
    classNames,
  } = props

  const {
    clear: clearClassName,
    currency: currencyClassName,
    ...inputClassNames
  } = classNames ?? {}

  const displayValue = value ? formatPrice(Number(value)) : ''
  const showClear = Boolean(value) && !disabled

  return (
    <Input
      id={id}
      inputMode="numeric"
      autoComplete="off"
      label={label}
      error={error}
      helperText={helperText}
      disabled={disabled}
      value={displayValue}
      onChange={(event) => {
        const next = sanitizeTomanAmount(event.target.value)
        if (next == null) return
        onChange(next)
      }}
      end={
        <>
          {showClear ? (
            <IconButton
              variant="ghost"
              size="small"
              aria-label={BAROOK_PAGE_COPY.clearAmount}
              className={clearClassName}
              onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
                event.stopPropagation()
              }
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation()
                onChange('')
              }}
              icon={<CloseCircle />}
            />
          ) : null}
          <span
            className={cn(
              'typo-body-x-small text-text-disabled leading-5 whitespace-nowrap',
              currencyClassName,
            )}
          >
            {TOMAN}
          </span>
        </>
      }
      classNames={{
        root: cn('gap-2', inputClassNames.root),
        labelText: error
          ? 'typo-label-medium text-error-dark'
          : 'typo-label-medium text-text-primary',
        content: cn('h-11 px-3 py-0', inputClassNames.content),
        input: cn('text-[16px] leading-5', inputClassNames.input),
        end: cn('mr-0 flex h-full items-center gap-1', inputClassNames.end),
        helperTextIcon: 'hidden',
        helperTextWrapper: cn('px-3', inputClassNames.helperTextWrapper),
        helperText: cn('text-error-dark', inputClassNames.helperText),
      }}
    />
  )
}

export default AmountField
