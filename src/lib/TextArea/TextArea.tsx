import { type MutableRefObject, useId, useMemo, useRef } from 'react'

import { RiInformationLine } from '@remixicon/react'

import { cn } from '../utils'
import type { TextAreaProps } from './types'
import { textAreaVariants } from './variants'

/**
 * # TextArea
 * @param props - TextAreaProps
 * @description TextArea component for textarea input.
 * @example
 * <TextArea label="Message" />
 * <TextArea label="Message" disabled />
 */
const TextAreaComponent = (props: TextAreaProps) => {
  const {
    ref,
    id,
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
  const innerRef = useRef<HTMLTextAreaElement>(null)
  const inputId = useMemo(() => id ?? customId, [id, customId])

  const slots = textAreaVariants({ disabled, error })
  const hasHelperArea = helperText || showLength

  return (
    <div
      data-slot="text-area"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      {label && (
        <label
          data-slot="text-area-label"
          htmlFor={inputId}
          className={slots.label({ className: classNames?.label })}
        >
          <span
            data-slot="text-area-label-text"
            className={slots.labelText({ className: classNames?.labelText })}
          >
            {label}
          </span>

          {optional && (
            <span
              data-slot="text-area-label-optional-text"
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
        data-slot="text-area-content"
        onClick={() => innerRef.current?.focus()}
        className={slots.content({ className: classNames?.content })}
      >
        <textarea
          data-slot="text-area-input"
          ref={(node) => {
            innerRef.current = node
            if (ref) {
              if (typeof ref === 'function') ref(node)
              else
                (ref as MutableRefObject<HTMLTextAreaElement | null>).current =
                  node
            }
          }}
          id={inputId}
          disabled={disabled}
          className={slots.input({ className: classNames?.input })}
          {...otherProps}
        />
      </div>

      {hasHelperArea && (
        <div
          data-slot="text-area-helper-area"
          className="flex items-center gap-1"
        >
          {helperText && (
            <div className="flex items-center gap-1">
              <RiInformationLine
                className={slots.helperTextIcon({
                  className: classNames?.helperTextIcon,
                })}
                data-slot="text-area-helper-text-icon"
              />

              <div
                data-slot="text-area-helper-text"
                className={slots.helperText({
                  className: classNames?.helperText,
                })}
              >
                {helperText}
              </div>
            </div>
          )}

          {showLength && (
            <div
              data-slot="text-area-length"
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

export default TextAreaComponent
