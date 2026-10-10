import type { ComponentPropsWithRef } from 'react'

import type { UserAddress } from '@/api/models'

import type { AddressItemSkeletonSlots } from './variants'

export type AddressItemProps = {
  address: UserAddress
  isSelected?: boolean
  onClick?: VoidFunction
  variant?: 'normal' | 'outlined'
  options?: {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    showPostalCode?: boolean
  }
}

export type AddressItemSkeletonProps = ComponentPropsWithRef<'div'> & {
  variant?: 'normal' | 'outlined'
  classNames?: Partial<Record<AddressItemSkeletonSlots, string>>
  options?: {
    showStartIcon?: boolean
    showEndIcon?: boolean
    showPostalCode?: boolean
  }
}
