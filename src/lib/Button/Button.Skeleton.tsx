import { type ElementType } from 'react'

import Spinner from '../Spinner'
import type { ButtonProps } from './types'
import { buttonSkeletonVariants } from './variants'

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
const ButtonSkeletonComponent = <C extends ElementType>(
  props: ButtonProps<C>,
) => {
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
    ...otherProps
  } = props

  const Component = as

  const slots = buttonSkeletonVariants({
    size,
  })

  return (
    <Component
      ref={ref}
      data-slot="button"
      data-loading={loading}
      className={slots.root({ className })}
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

export default ButtonSkeletonComponent
