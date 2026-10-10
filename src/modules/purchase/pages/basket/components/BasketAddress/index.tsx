'use client'

import { useRouter } from 'next/navigation'

import { Add, Location } from 'iconsax-reactjs'

import AddressItem from '@/components/AddressItem'

import { useUserAddresses } from '@/modules/addresses/hooks'
import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'

import Alert from '@/lib/Alert'

const BasketAddress = () => {
  const router = useRouter()

  const { primaryAddress, isLoading } = useUserAddresses()

  if (isLoading) {
    return (
      <AddressItem.Skeleton
        variant="outlined"
        options={{
          showEndIcon: true,
          showStartIcon: true,
          showPostalCode: true,
        }}
      />
    )
  }

  if (!primaryAddress) {
    return (
      <Alert
        variant="basic"
        title="آدرسی ثبت نشده است"
        actions={[
          {
            id: 'create',
            variant: 'ghost',
            children: 'افزودن آدرس',
            startIcon: <Add />,
            onClick: () => router.push(buildAddressCreateSelectLocationUrl()),
          },
        ]}
      />
    )
  }

  return (
    <AddressItem
      isSelected
      address={primaryAddress}
      variant="outlined"
      options={{
        showPostalCode: true,
        startIcon: (
          <Location variant="Bold" size={18} className="text-primary-500" />
        ),
      }}
    />
  )
}

export default BasketAddress
