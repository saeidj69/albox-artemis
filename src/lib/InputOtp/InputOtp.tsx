'use client'

import { useEffect, useRef, useState } from 'react'

import { englishDigits, onlyDigits } from '@/utils/numbers'

import { cn } from '../utils'
import type { InputOtpProps } from './types'
import { inputOtpVariants } from './variants'

/**
 * OTP field: one real `<input>` (hidden with size/opacity) owns value, focus, IME,
 * and `autoComplete="one-time-code"`. The grid is presentation-only (`role="presentation"`)
 * — digits and caret mirror `value` / active index. On RTL pages, LTR/bidi isolation
 * is applied to the visual row and cells so flex and weak digits do not reverse order.
 */
const InputOtpComponent = (props: InputOtpProps) => {
  const {
    error,
    length = 5,
    value = '',
    onChange,
    className,
    classNames,
    autoFocus,
    inputMode = 'numeric',
    autoComplete = 'one-time-code',
    ...rest
  } = props

  const [isFocused, setIsFocused] = useState(false)

  const slots = inputOtpVariants({ error })

  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value

    const newValue = onlyDigits(englishDigits(raw))

    onChange?.(newValue)
  }

  const onInputFocus = () => {
    setIsFocused(true)
    hiddenInputRef.current?.focus()
  }

  const onInputBlur = () => {
    setIsFocused(false)
  }

  const currentActiveCell = Math.min(Math.max(0, value.length), length - 1)

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        onInputFocus()
      }, 1000)
    }
  }, [autoFocus])

  return (
    <div
      dir="ltr"
      data-slot="input-otp"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      <div
        data-slot="input-otp-container"
        role="group"
        aria-label="One-time code"
        className={slots.container({ className: classNames?.container })}
      >
        <div>
          {/* Single hidden input: real value and focus target */}
          <input
            type="text"
            dir="ltr"
            value={value}
            maxLength={length}
            ref={hiddenInputRef}
            inputMode={inputMode}
            autoFocus={autoFocus}
            onFocus={onInputFocus}
            onChange={onInputChange}
            onBlur={onInputBlur}
            autoComplete={autoComplete}
            aria-label={`One-time code, ${length} digits`}
            className="pointer-events-none absolute top-0 left-0 h-0 w-0 caret-white opacity-0"
            {...rest}
          />
        </div>

        {/* Visual overlay: fake cells and caret */}
        <div
          data-slot="input-otp-cells"
          className={slots.cells({ className: classNames?.cells })}
          onClick={onInputFocus}
        >
          {Array.from({ length }, (_, i) => {
            const isActive = isFocused && i === currentActiveCell

            return (
              <div
                key={i}
                data-slot="input-otp-cell"
                role="presentation"
                data-slot-active={isActive}
                className={slots.cell({
                  className: classNames?.cell,
                })}
              >
                <span
                  data-slot="input-otp-digit"
                  className={cn(slots.digit({ className: classNames?.digit }))}
                >
                  {value[i] ?? ''}
                </span>

                {isActive && i !== value.length - 1 && (
                  <span
                    data-slot="input-otp-caret"
                    data-slot-active={isActive}
                    className={slots.caret({ className: classNames?.caret })}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default InputOtpComponent
