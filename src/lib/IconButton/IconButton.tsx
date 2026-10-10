import { type ElementType } from 'react'

import type { IconButtonProps } from './types'
import { iconButtonVariants } from './variants'

/**
 * IconButton – icon-only button with primary, secondary, or ghost variant.
 * Renders a single node (e.g. an SVG icon).
 * @example
 * <IconButton icon={<HeartIcon />} variant="primary" />
 * <IconButton variant="ghost"><SearchIcon /></IconButton>
 */
const IconButtonComponent = <C extends ElementType>(
  props: IconButtonProps<C>,
) => {
  const {
    ref,
    as = 'button',
    icon,
    children,
    className,
    classNames,
    size = 'medium',
    variant = 'primary',
    ...otherProps
  } = props

  const Component = as
  const node = icon ?? children

  const slots = iconButtonVariants({
    variant,
    size,
    disabled: otherProps.disabled,
  })

  return (
    <Component
      data-slot="icon-button"
      ref={ref}
      className={slots.root({ className })}
      disabled={otherProps.disabled}
      type="button"
      {...otherProps}
    >
      <span
        data-slot="icon-button-icon"
        className={slots.icon({ className: classNames?.icon })}
      >
        {node}
      </span>
    </Component>
  )
}

export default IconButtonComponent
