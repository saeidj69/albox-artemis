import { memo, type FC } from 'react'

import type { FlipDigitsProps } from './types'
import { flipDigitsVariants } from './variants'

/**
 * # FlipDigits
 * @param props - FlipDigitsProps
 * @description A component that displays numbers with a flip animation effect, showing digits transitioning between values.
 * @example
 * <FlipDigits value={42} minDigits={3} />
 * <FlipDigits value={123} size="large" />
 * <FlipDigits value={7} size="small" minDigits={2} />
 */
const FlipDigitsComponentInner: FC<FlipDigitsProps> = (props) => {
  const {
    value = 0,
    className,
    classNames,
    minDigits = 1,
    size = 'medium',
    ...rest
  } = props

  const digits = value.toString().padStart(minDigits, '0').split('')

  const slots = flipDigitsVariants({ size })

  return (
    <div
      {...rest}
      data-size={size}
      data-value={value}
      data-slot="flip-digits"
      className={slots.root({ className: classNames?.root || className })}
    >
      {digits.map((digit, index) => (
        <span
          key={index}
          data-value={digit}
          data-slot="flip-digits-digit"
          style={{ transform: `translateY(-${100 * parseInt(digit)}%)` }}
          className={slots.digit({ className: classNames?.digit })}
        >
          {Array.from({ length: 10 }, (_, j) => (
            <span
              key={j}
              aria-hidden="true"
              data-aria-hidden="true"
              data-slot="flip-digits-digit-item"
              className={slots.digitItem({ className: classNames?.digitItem })}
            >
              {j}
            </span>
          ))}
        </span>
      ))}
    </div>
  )
}

const FlipDigitsComponent = memo(FlipDigitsComponentInner)

export default FlipDigitsComponent
