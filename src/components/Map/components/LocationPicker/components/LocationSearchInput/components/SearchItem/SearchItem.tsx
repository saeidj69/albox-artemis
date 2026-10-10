import { FC } from 'react'

import { cn } from '@/lib/utils'

import { SearchItemProps } from './types'
import { searchItemVariants } from './variants'

const SearchItemComponent: FC<SearchItemProps> = (props) => {
  const { icon, title, subtitle, ref, className, classNames, ...otherProps } =
    props

  const slots = searchItemVariants()

  return (
    <button
      ref={ref}
      type="button"
      data-slot="search-item"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...otherProps}
    >
      {icon && (
        <span
          data-slot="search-item-icon"
          className={slots.icon({ className: classNames?.icon })}
        >
          {icon}
        </span>
      )}
      <div
        data-slot="search-item-content"
        className={slots.content({ className: classNames?.content })}
      >
        <span
          data-slot="search-item-title"
          className={slots.title({ className: classNames?.title })}
        >
          {title}
        </span>

        {subtitle ? (
          <span
            data-slot="search-item-subtitle"
            className={slots.subtitle({ className: classNames?.subtitle })}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </button>
  )
}

export default SearchItemComponent
