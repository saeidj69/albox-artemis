import { type ElementType } from 'react'

import Spinner from '@/lib/Spinner'

import { cn } from '../utils'
import type { ButtonProps } from './types'
import { buttonVariants } from './variants'

/**
 * # Button
 * @param props - ButtonProps
 * @description Versatile button component for actions or navigation, supporting various styles and usage as a link or inline button.
 * @example
 * <Button>Click me</Button>
 * <Button loading={true}>Click me</Button>
 * <Button as={Link} to="/" variant="primary" shape="outline" size="medium">Click me</Button>
 * <Button startIcon={<Icon name="home" />} endIcon={<Icon name="arrow-left" />}>Click me</Button>
 */
const Button = <C extends ElementType>(props: ButtonProps<C>) => {
  const {
    as = 'button',
    ref,
    loading,
    endIcon,
    children,
    startIcon,
    className,
    classNames,
    size = 'medium',
    variant = 'primary',
    ...otherProps
  } = props

  const Component = as

  const slots = buttonVariants({
    variant,
    size,
    loading,
    disabled: otherProps.disabled,
  })

  return (
    <Component
      ref={ref}
      data-slot="button"
      data-loading={loading}
      className={cn(slots.root({ className }), classNames?.root)}
      disabled={otherProps.disabled}
      {...{ type: 'button' }}
      {...otherProps}
    >
      {startIcon && (
        <span
          data-slot="button-start-icon"
          className={slots.startIcon({ className: classNames?.startIcon })}
        >
          {startIcon}
        </span>
      )}

      <span
        data-slot="button-content"
        className={slots.content({ className: classNames?.content })}
      >
        {children}
      </span>

      {endIcon && (
        <span
          data-slot="button-end-icon"
          className={slots.endIcon({ className: classNames?.endIcon })}
        >
          {endIcon}
        </span>
      )}

      {loading && (
        <span
          data-slot="button-spinner"
          className={slots.spinner({ className: classNames?.spinner })}
        >
          <Spinner size={size} />
        </span>
      )}
    </Component>
  )
}

export default Button
export type { ButtonProps }
