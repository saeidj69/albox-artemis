import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
} from '@remixicon/react'
import { InfoCircle } from 'iconsax-reactjs'

import Button from '@/lib/Button'

import type { AlertProps } from './types'
import { alertVariants } from './variants'

const VARIANT_ICON = {
  basic: RiInformationLine,
  info: RiInformationLine,
  warning: RiErrorWarningLine,
  success: RiCheckboxCircleLine,
  error: RiErrorWarningLine,
} as const

const AlertComponent = (props: AlertProps) => {
  const {
    ref,
    variant = 'basic',
    title,
    children,
    actions,
    icon,
    className,
    classNames,
    ...otherProps
  } = props

  const slots = alertVariants({ variant })

  const Icon = VARIANT_ICON[variant ?? 'basic']
  const defaultIcon =
    variant === 'info' ? (
      <InfoCircle size={20} className="size-5" />
    ) : (
      <Icon className="size-5" />
    )

  return (
    <div
      ref={ref}
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={slots.root({ className: classNames?.root ?? className })}
      {...otherProps}
    >
      <span
        data-slot="alert-icon"
        className={slots.icon({ className: classNames?.icon })}
      >
        {icon ?? defaultIcon}
      </span>

      <div
        data-slot="alert-content"
        className={slots.content({ className: classNames?.content })}
      >
        {title && (
          <p
            data-slot="alert-title"
            className={slots.title({ className: classNames?.title })}
          >
            {title}
          </p>
        )}

        {children && (
          <p
            data-slot="alert-description"
            className={slots.description({
              className: classNames?.description,
            })}
          >
            {children}
          </p>
        )}

        {actions && actions.length > 0 && (
          <div
            data-slot="alert-actions"
            className={slots.actions({ className: classNames?.actions })}
          >
            {actions.map(({ id, ...buttonProps }) => (
              <Button
                key={id}
                size="small"
                variant="ghost"
                data-slot="alert-action"
                className={slots.action({ className: classNames?.action })}
                {...buttonProps}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertComponent
