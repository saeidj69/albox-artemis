'use client'

import { Fragment } from 'react'

import FlipDigits from '@/lib/FlipDigits'

import { cn } from '../utils'
import type { CountdownProps } from './types'
import { useCountdown } from './useCountdown'
import { countdownVariants } from './variants'

/** Rendered until the first client tick resolves the real remaining time. */
const PLACEHOLDER_VALUES: [number, number, number] = [0, 0, 0]

const padSegment = (value: number) => String(value).padStart(2, '0')

/**
 * # Countdown
 * @param props - CountdownProps
 * @description Ticks down to `endsAt` in three boxed segments — hours/minutes/
 * seconds under a day, days/hours/minutes above it. Renders nothing once the
 * deadline passes.
 * @example
 * <Countdown endsAt={Date.parse('2026-10-01T18:00:00+03:30')} />
 * <Countdown endsAt={endsAt} size="small" classNames={{ separator: 'text-white' }} />
 */
const CountdownComponent = (props: CountdownProps) => {
  const {
    ref,
    endsAt,
    size = 'medium',
    separator = ':',
    className,
    classNames,
    ...rest
  } = props

  const { segments, isExpired } = useCountdown(endsAt)

  if (isExpired) {
    return null
  }

  const slots = countdownVariants({ size })
  const values = segments?.values ?? PLACEHOLDER_VALUES
  const labelSeparator = typeof separator === 'string' ? separator : ':'

  return (
    <div
      ref={ref}
      // Clock order stays left-to-right inside the RTL layout.
      dir="ltr"
      role="timer"
      aria-label={values.map(padSegment).join(labelSeparator)}
      data-slot="countdown"
      data-size={size}
      className={cn(slots.root({ className: classNames?.root }), className)}
      {...rest}
    >
      {values.map((value, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <span
              aria-hidden
              data-slot="countdown-separator"
              className={slots.separator({ className: classNames?.separator })}
            >
              {separator}
            </span>
          ) : null}
          <div
            data-slot="countdown-segment"
            className={slots.segment({ className: classNames?.segment })}
          >
            <FlipDigits
              // FlipDigits lays digits out for RTL (`flex-row-reverse`).
              dir="rtl"
              value={value}
              minDigits={2}
              size={size}
            />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default CountdownComponent
