'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from '../utils'
import type { RadioGroupItemProps, RadioGroupRootProps } from './types'
import { radioGroupVariants } from './variants'

/**
 * # RadioGroup
 * @param props - RadioGroupRootProps
 * @description A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.
 * @example
 * <RadioGroup>
 *   <RadioGroup.Item value="option1" />
 *   <RadioGroup.Item value="option2" />
 * </RadioGroup>
 */
const RadioGroupComponent = (props: RadioGroupRootProps) => {
  const { ref, className, classNames, ...otherProps } = props

  const slots = radioGroupVariants()

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      dir="rtl"
      data-slot="radio-group"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    />
  )
}

/**
 * # RadioGroupItem
 * @param props - RadioGroupItemProps
 * @description An individual radio button within a RadioGroup.
 * @example
 * <RadioGroup.Item value="option1" />
 * <RadioGroup.Item value="option2" disabled />
 */
const RadioGroupItemComponent = (props: RadioGroupItemProps) => {
  const { ref, className, classNames, ...otherProps } = props

  const slots = radioGroupVariants()

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="radio-group-item"
      className={slots.item({ className: cn(className, classNames?.item) })}
      {...otherProps}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={slots.indicator({ className: classNames?.indicator })}
      >
        <div
          data-slot="radio-group-icon"
          className={slots.icon({ className: classNames?.icon })}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroupComponent, RadioGroupItemComponent }
