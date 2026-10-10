'use client'

import { RiCheckFill, RiSubtractLine } from '@remixicon/react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { cn } from '../utils'
import type { CheckboxProps } from './types'
import { checkboxVariants } from './variants'

/**
 * # Checkbox
 * @param props - CheckboxProps
 * @description Represents a checkbox input that allows users to select one or more options.
 * @example
 * <Checkbox defaultChecked />
 * <Checkbox checked="indeterminate" />
 * <Checkbox disabled />
 */
const CheckboxComponent = (props: CheckboxProps) => {
  const { ref, className, classNames, ...otherProps } = props

  const slots = checkboxVariants()

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={slots.indicator({ className: classNames?.indicator })}
      >
        <RiCheckFill
          className={slots.icon({
            className: slots.iconCheck({ className: classNames?.iconCheck }),
          })}
        />
        <RiSubtractLine
          className={slots.icon({
            className: slots.iconMinus({ className: classNames?.iconMinus }),
          })}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export default CheckboxComponent
