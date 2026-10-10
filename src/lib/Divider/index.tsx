import type { DividerProps } from './types'
import { dividerVariants } from './variants'

/**
 * # Divider
 * @param props - DividerProps
 * @description A divider is a thin line that separates content into clear groups.
 * @example
 * <Divider />
 * <Divider size="small" />
 * <Divider size="large" />
 */
const Divider = (props: DividerProps) => {
  const {
    ref,
    className,
    size = 'small',
    orientation = 'horizontal',
    ...otherProps
  } = props

  return (
    <div
      ref={ref}
      data-slot="divider"
      className={dividerVariants({ size, orientation, className })}
      {...otherProps}
    />
  )
}

export default Divider

export type { DividerProps }
