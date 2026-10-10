'use client'

import {
  RiCheckboxCircleLine,
  RiCloseCircleFill,
  RiErrorWarningLine,
  RiInformationLine,
} from '@remixicon/react'
import { Toaster as Sonner } from 'sonner'

import { IranSans } from '@/utils/font'

import { cn } from '@/lib/utils/cn'

import Spinner from '../Spinner'
import type { ToastToasterProps } from './types'
import { toastVariants } from './variants'

/**
 * # Toast / Toaster
 * @description Global toaster powered by `sonner`, styled to match the design-system Toast.
 * @example
 * <Toaster position="bottom-center" mobileOffset={{ bottom: '80px' }} />
 */
const Toaster = (props: ToastToasterProps) => {
  const {
    icons,
    className,
    classNames,
    toastOptions,
    closeButton = false,
    ...otherProps
  } = props

  const slots = toastVariants()

  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          direction: 'rtl',
          fontFamily: IranSans.style.fontFamily,
          ...toastOptions?.style,
        },
      }}
      richColors
      icons={{
        loading: (
          <Spinner
            size="small"
            className={slots.icon({
              className: 'text-current',
            })}
          />
        ),
        info: (
          <RiInformationLine
            className={slots.icon({
              className: 'text-current',
            })}
          />
        ),
        warning: (
          <RiErrorWarningLine
            className={slots.icon({ className: 'text-current' })}
          />
        ),
        success: (
          <RiCheckboxCircleLine
            className={slots.icon({
              className: 'text-current',
            })}
          />
        ),
        error: (
          <RiCloseCircleFill
            className={slots.icon({
              className: 'text-current',
            })}
          />
        ),
        ...icons,
      }}
      closeButton={closeButton}
      className={cn(className, classNames?.toaster)}
      {...otherProps}
    />
  )
}

export default Toaster

export type { ToastToasterProps }
