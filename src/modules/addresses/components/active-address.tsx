'use client'

import { useRouter } from 'next/navigation'

import { ArrowDown2 } from 'iconsax-reactjs'

import { useUserAddresses } from '@/modules/addresses/hooks'
import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'

import Chip from '@/lib/Chip'
import { showSheet } from '@/lib/Sheet'
import Skeleton from '@/lib/Skeleton'

import AddressListSheet from '../sheets/address-list-sheet'

const ActiveAddress = () => {
  const router = useRouter()

  const { addresses, primaryAddress, isLoading } = useUserAddresses()

  const hasAddresses = addresses.length > 0

  const handleClick = () => {
    if (hasAddresses) {
      showSheet(AddressListSheet)
    } else {
      router.push(buildAddressCreateSelectLocationUrl())
    }
  }

  const content = (() => {
    if (hasAddresses) {
      return (
        <Chip
          onClick={handleClick}
          content={primaryAddress?.name}
          end={<ArrowDown2 size={16} />}
          variant="primary"
        />
      )
    }

    return (
      <Chip
        onClick={handleClick}
        content={'انتخاب موقعیت مکانی فروشگاه شما'}
        end={<ArrowDown2 size={16} />}
        variant="ghost"
        classNames={{
          root: 'bg-warning-lighter',
          content: 'text-warning-dark',
          end: 'text-warning-dark',
        }}
      />
    )
  })()

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      {isLoading ? <Chip.Skeleton className="w-24" /> : content}

      {isLoading ? (
        <Skeleton className="mt-2 h-3 w-24 rounded-full" />
      ) : primaryAddress?.address ? (
        <div className="typo-body-small text-text-inverse w-full max-w-full truncate text-center">
          {primaryAddress.address}
        </div>
      ) : null}
    </div>
  )
}

export default ActiveAddress
