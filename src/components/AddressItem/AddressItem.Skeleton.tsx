import { FC } from 'react'

import Skeleton from '@/lib/Skeleton'
import { cn } from '@/lib/utils'

import type { AddressItemSkeletonProps } from './types'
import { addressItemSkeletonVariants } from './variants'

const AddressItemSkeletonComponent: FC<AddressItemSkeletonProps> = (props) => {
  const {
    className,
    classNames,
    variant = 'normal',
    options,
    ref,
    ...rest
  } = props

  const showStartIcon = options?.showStartIcon ?? true
  const showEndIcon = options?.showEndIcon ?? false

  const slots = addressItemSkeletonVariants({ variant })

  return (
    <div
      ref={ref}
      data-slot="address-item-skeleton"
      className={slots.root({ className: cn(className, classNames?.root) })}
      {...rest}
    >
      <div
        data-slot="address-item-skeleton-row"
        className={slots.row({ className: classNames?.row })}
      >
        {showStartIcon ? (
          <Skeleton
            data-slot="address-item-skeleton-start-icon"
            className={slots.startIcon({ className: classNames?.startIcon })}
          />
        ) : null}

        <div
          data-slot="address-item-skeleton-content"
          className={slots.content({ className: classNames?.content })}
        >
          <Skeleton
            data-slot="address-item-skeleton-title"
            className={slots.title({ className: classNames?.title })}
          />
          <Skeleton
            data-slot="address-item-skeleton-address"
            className={slots.address({ className: classNames?.address })}
          />

          {options?.showPostalCode && (
            <Skeleton
              data-slot="address-item-skeleton-postal-code"
              className={slots.postalCode()}
            ></Skeleton>
          )}
        </div>

        {showEndIcon ? (
          <Skeleton
            data-slot="address-item-skeleton-end-icon"
            className={slots.endIcon({ className: classNames?.endIcon })}
          />
        ) : null}
      </div>
    </div>
  )
}

export default AddressItemSkeletonComponent
