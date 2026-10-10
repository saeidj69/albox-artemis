'use client'

import { type FC, useId, useMemo } from 'react'

import {
  RiArrowDownSLine,
  RiCheckLine,
  RiInformationLine,
} from '@remixicon/react'
import { Select as SelectPrimitive } from 'radix-ui'

import { cn } from '../utils'
import type { DropdownProps } from './types'
import { dropdownVariants } from './variants'

/**
 * # Dropdown
 * @param props - DropdownProps
 * @description Dropdown/select component built on Radix Select.
 * @example
 * <Dropdown label="شهر" options={[{ value: 'tehran', label: 'تهران' }]} />
 */
const DropdownComponent: FC<DropdownProps> = (props) => {
  const {
    id,
    size,
    start,
    label,
    error,
    options,
    optional,
    disabled,
    className,
    classNames,
    helperText,
    placeholder,
    ...otherProps
  } = props

  const customId = useId()
  const triggerId = useMemo(() => id ?? customId, [id, customId])

  const slots = dropdownVariants({ size, disabled, error })

  return (
    <div
      data-slot="dropdown"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      {label && (
        <label
          data-slot="dropdown-label"
          htmlFor={triggerId}
          className={slots.label({ className: classNames?.label })}
        >
          <span
            data-slot="dropdown-label-text"
            className={slots.labelText({ className: classNames?.labelText })}
          >
            {label}
          </span>

          {optional && (
            <span
              data-slot="dropdown-label-optional-text"
              className={slots.labelOptionalText({
                className: classNames?.labelOptionalText,
              })}
            >
              (اختیاری)
            </span>
          )}
        </label>
      )}

      <SelectPrimitive.Root dir="rtl" disabled={disabled} {...otherProps}>
        <SelectPrimitive.Trigger
          id={triggerId}
          data-slot="dropdown-trigger"
          className={slots.trigger({ className: classNames?.trigger })}
        >
          {!!start && (
            <div
              data-slot="dropdown-start"
              className={slots.start({ className: classNames?.start })}
            >
              {start}
            </div>
          )}
          <div
            className={slots.valueWrapper({
              className: classNames?.valueWrapper,
            })}
          >
            <SelectPrimitive.Value
              data-slot="dropdown-value"
              placeholder={placeholder}
              className={slots.value({ className: classNames?.value })}
            />
          </div>

          <SelectPrimitive.Icon
            data-slot="dropdown-icon"
            className={slots.icon({ className: classNames?.icon })}
            asChild
          >
            <RiArrowDownSLine />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            data-slot="dropdown-content"
            position="popper"
            side="bottom"
            sideOffset={4}
            className={slots.content({ className: classNames?.content })}
          >
            <SelectPrimitive.Viewport
              data-slot="dropdown-viewport"
              className={slots.viewport({ className: classNames?.viewport })}
            >
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  data-slot="dropdown-item"
                  className={slots.item({ className: classNames?.item })}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator
                    data-slot="dropdown-item-indicator"
                    className={slots.itemIndicator({
                      className: classNames?.itemIndicator,
                    })}
                  >
                    <RiCheckLine />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {helperText && (
        <div
          data-slot="dropdown-helper-area"
          className={slots.helperArea({ className: classNames?.helperArea })}
        >
          <div
            data-slot="dropdown-helper-text-wrapper"
            className={slots.helperTextWrapper({
              className: classNames?.helperTextWrapper,
            })}
          >
            <RiInformationLine
              data-slot="dropdown-helper-text-icon"
              className={slots.helperTextIcon({
                className: classNames?.helperTextIcon,
              })}
            />
            <div
              data-slot="dropdown-helper-text"
              className={slots.helperText({
                className: classNames?.helperText,
              })}
            >
              {helperText}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DropdownComponent
