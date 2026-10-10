import { FC } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import { SearchItemSkeletonProps } from './types'
import { searchItemSkeletonVariants } from './variants'

const SearchItemSkeletonComponent: FC<SearchItemSkeletonProps> = (props) => {
  const {
    withSubtitle = false,
    withIcon = false,
    className,
    classNames,
  } = props

  const slots = searchItemSkeletonVariants()

  return (
    <div
      data-slot="search-item-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
    >
      {withIcon && (
        <Skeleton
          data-slot="search-item-skeleton-icon"
          className={slots.icon({ className: classNames?.icon })}
        />
      )}
      <div
        data-slot="search-item-skeleton-content"
        className={slots.content({ className: classNames?.content })}
      >
        <Skeleton
          data-slot="search-item-skeleton-title"
          className={slots.title({ className: classNames?.title })}
        />

        {withSubtitle ? (
          <Skeleton
            data-slot="search-item-skeleton-subtitle"
            className={slots.subtitle({ className: classNames?.subtitle })}
          />
        ) : null}
      </div>
    </div>
  )
}

export default SearchItemSkeletonComponent
