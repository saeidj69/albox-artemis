'use client'

import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '../utils'
import type { SwitchProps } from './types'
import { switchVariants } from './variants'

/**
 * # Switch
 * @param props - SwitchProps
 * @description Represents a physical toggle to turn a setting "on" or "off".
 * @example
 * <Switch defaultChecked />
 * <Switch size="small" />
 * <Switch disabled defaultChecked />
 */
const SwitchComponent = (props: SwitchProps) => {
  const { ref, className, classNames, size = 'medium', ...otherProps } = props

  const slots = switchVariants({ size })

  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={slots.thumb({ className: classNames?.thumb })}
      />
    </SwitchPrimitive.Root>
  )
}

export default SwitchComponent
