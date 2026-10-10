import { type FC, type MutableRefObject, useId, useMemo, useRef } from 'react'

import { RiInformationLine } from '@remixicon/react'

import { cn } from '../utils'
import type { InputProps } from './types'
import { inputVariants } from './variants'

/**
 * # Input
 * @param props - InputProps
 * @description Input component for text input.
 * @example
 * <Input label="Email" />
 * <Input label="Email" disabled />
 * <Input label="Email" start={<Icon name="email" />} />
 */
const InputComponent: FC<InputProps> = (props) => {
  const {
    id,
    ref,
    end,
    start,
    type,
    label,
    error,
    optional,
    disabled,
    className,
    classNames,
    helperText,
    showLength,
    ...otherProps
  } = props

  const customId = useId()
  const innerRef = useRef<HTMLInputElement>(null)
  const inputId = useMemo(() => id ?? customId, [id, customId])

  const slots = inputVariants({ disabled, error })
  const hasHelperArea = helperText || showLength

  return (
    <div
      data-slot="input"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      {label && (
        <label
          data-slot="input-label"
          htmlFor={inputId}
          className={slots.label({ className: classNames?.label })}
        >
          <span
            data-slot="input-label-text"
            className={slots.labelText({ className: classNames?.labelText })}
          >
            {label}
          </span>

          {optional && (
            <span
              data-slot="input-label-optional-text"
              className={slots.labelOptionalText({
                className: classNames?.labelOptionalText,
              })}
            >
              (اختیاری)
            </span>
          )}
        </label>
      )}

      <div
        data-slot="input-content"
        onClick={() => innerRef.current?.focus()}
        className={slots.content({ className: classNames?.content })}
      >
        {!!start && (
          <div
            data-slot="input-start"
            className={slots.start({ className: classNames?.start })}
          >
            {start}
          </div>
        )}

        <input
          data-slot="input-field"
          ref={(node) => {
            innerRef.current = node

            if (ref) {
              if (typeof ref === 'function') ref(node)
              else
                (ref as MutableRefObject<HTMLInputElement | null>).current =
                  node
            }
          }}
          type={type}
          id={inputId}
          disabled={disabled}
          className={slots.input({ className: classNames?.input })}
          {...otherProps}
        />

        {!!end && (
          <div
            data-slot="input-end"
            className={slots.end({ className: classNames?.end })}
          >
            {end}
          </div>
        )}
      </div>

      {hasHelperArea && (
        <div
          data-slot="input-helper-area"
          className={slots.helperArea({ className: classNames?.helperArea })}
        >
          <div>
            {helperText && (
              <div
                data-slot="input-helper-text-wrapper"
                className={slots.helperTextWrapper({
                  className: classNames?.helperTextWrapper,
                })}
              >
                <RiInformationLine
                  data-slot="input-helper-text-icon"
                  className={slots.helperTextIcon({
                    className: classNames?.helperTextIcon,
                  })}
                />
                <div
                  data-slot="input-helper-text"
                  className={slots.helperText({
                    className: classNames?.helperText,
                  })}
                >
                  {helperText}
                </div>
              </div>
            )}
          </div>

          {showLength && (
            <div
              data-slot="input-length"
              className={slots.length({ className: classNames?.length })}
            >
              {otherProps.maxLength ?? 0} /{' '}
              {(otherProps.value as string)?.length ?? 0}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InputComponent
