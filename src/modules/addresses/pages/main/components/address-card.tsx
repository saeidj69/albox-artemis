'use client'

import { FC } from 'react'

import { RiMore2Line } from '@remixicon/react'

import type { UserAddress } from '@/api/models'

import IconButton from '@/lib/IconButton'
import RadioGroup from '@/lib/Radio'
import { cn } from '@/lib/utils'

type AddressCardProps = {
  address: UserAddress
  isSelected: boolean
  onSettingsClick: () => void
}

const AddressCard: FC<AddressCardProps> = (props) => {
  const { address, isSelected, onSettingsClick } = props

  return (
    <div
      className={cn(
        'rounded-brand relative border p-4 transition-colors',
        isSelected ? 'border-primary-500' : 'border-border-main',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <RadioGroup>
            <RadioGroup.Item
              value=""
              checked={isSelected}
              classNames={{
                item: 'data-[state=checked]:border-primary-500 ltr',
                icon: 'bg-primary-500',
              }}
            />
          </RadioGroup>

          <span className="typo-title-small text-text-primary truncate">
            {address.name}
          </span>
        </div>

        <IconButton
          variant="ghost"
          size="medium"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            onSettingsClick()
          }}
        >
          <RiMore2Line />
        </IconButton>
      </div>

      <p className="typo-body-small text-text-secondary mt-2 text-right">
        {address.address}
      </p>

      {address.postalCode && (
        <p className="typo-body-small text-text-secondary mt-1 text-right">
          کد پستی: {address.postalCode}
        </p>
      )}
    </div>
  )
}

export default AddressCard
