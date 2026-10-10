import { type ElementType, type Ref } from 'react'

import { cn } from '@/lib/utils/cn'

import type { ChipProps } from './types'
import { chipVariants } from './variants'

const ChipComponent = <C extends ElementType = 'button'>(
  props: ChipProps<C>,
) => {
  const {
    ref,
    as,
    start,
    end,
    content,
    className,
    classNames,
    variant,
    size = 'medium',
    onClick,
    disabled,
    styles,
    ...otherProps
  } = props

  const interactive = Boolean(onClick)
  const Component = (as ?? (onClick ? 'button' : 'div')) as ElementType

  const slots = chipVariants({
    variant,
    size,
    interactive,
    disabled: Boolean(disabled),
  })

  return (
    <Component
      {...otherProps}
      disabled={disabled}
      onClick={onClick}
      data-slot="chip"
      data-variant={variant}
      data-size={size}
      data-interactive={interactive ? true : undefined}
      ref={ref as Ref<HTMLButtonElement>}
      className={slots.root({ className: cn(className, classNames?.root) })}
      style={styles?.root}
    >
      {start != null && (
        <span
          data-slot="chip-start"
          className={slots.start({ className: classNames?.start })}
          style={styles?.start}
        >
          {start}
        </span>
      )}

      <span
        data-slot="chip-content"
        className={slots.content({ className: classNames?.content })}
        style={styles?.content}
      >
        {content}
      </span>

      {end != null && (
        <span
          data-slot="chip-end"
          className={slots.end({ className: classNames?.end })}
          style={styles?.end}
        >
          {end}
        </span>
      )}
    </Component>
  )
}

export default ChipComponent

export type { ChipProps }
