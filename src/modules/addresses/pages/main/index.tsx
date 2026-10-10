'use client'

import { useState } from 'react'

import { redirect, useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { RiMore2Line } from '@remixicon/react'
import { toast } from 'sonner'

import ActionSheet from '@/components/ActionSheet'
import AddressItem from '@/components/AddressItem'
import Header, { HeaderLogo } from '@/components/Header'
import HeaderBackButton from '@/components/Header/components/HeaderBackButton'
import Layout from '@/components/Layout'

import { useUserAddresses } from '@/modules/addresses/hooks'
import { buildAddressCreateSelectLocationUrl } from '@/modules/addresses/utils/select-location'

import {
  useDeleteAddresses,
  useUpdateAddresses,
} from '@/api/functions/addresses'
import type { UserAddress } from '@/api/models'

import Button from '@/lib/Button'
import Divider from '@/lib/Divider'
import FlatList from '@/lib/FlatList'
import IconButton from '@/lib/IconButton'
import RadioGroup from '@/lib/Radio'
import { hideSheet, showSheet } from '@/lib/Sheet'

import AddressSettingsSheet from './components/address-settings-sheet'

const AddressesPage = () => {
  const router = useRouter()

  const { addresses, primaryAddress, isLoading, invalidateUserAddresses } =
    useUserAddresses()

  const [prevPrimaryAddress, setPrevPrimaryAddress] =
    useState<UserAddress | null>(primaryAddress || null)
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    primaryAddress || null,
  )

  if (primaryAddress?.id !== prevPrimaryAddress?.id) {
    setPrevPrimaryAddress(primaryAddress || null)
    setSelectedAddress(primaryAddress || null)
  }

  const { mutateAsync: deleteAddress, isPending: isDeleting } =
    useDeleteAddresses()

  const { mutateAsync: updatePrimaryAddress, isPending: isUpdating } =
    useUpdateAddresses()

  const onSelectPrimaryAddress = () => {
    if (!selectedAddress) {
      return
    }

    updatePrimaryAddress(
      { addressId: selectedAddress?.id, data: { isPrimary: true } },
      {
        onSuccess: () => {
          invalidateUserAddresses()
        },
      },
    )
  }

  const handleSettingsClick = (address: UserAddress) => {
    showSheet(AddressSettingsSheet, {
      onEdit: () => router.push(ROUTES.ADDRESSES.edit(address.id)),
      onDelete: () => handleDeleteRequest(address),
    })
  }

  const handleDeleteRequest = (address: UserAddress) => {
    showSheet(ActionSheet, {
      title: 'حذف آدرس',
      description: `آیا از حذف آدرس «${address.name}» مطمئن هستید؟`,
      actions: [
        {
          id: 'cancel',
          variant: 'ghost',
          size: 'large',
          disabled: isDeleting,
          children: 'انصراف',
          onClick: () => {
            hideSheet(ActionSheet)
          },
        },
        {
          id: 'confirm',
          variant: 'destructive-soft',
          size: 'large',
          loading: isDeleting,
          disabled: isDeleting,
          children: 'بله، حذف آدرس',
          onClick: async () => {
            await deleteAddress({ addressId: address.id })

            await invalidateUserAddresses()

            hideSheet(ActionSheet)

            toast.success('آدرس با موفقیت حذف شد.')
          },
        },
      ],
    })
  }

  const renderItem = (address: UserAddress) => {
    return (
      <AddressItem
        key={address.id}
        variant="outlined"
        address={address}
        isSelected={selectedAddress?.id === address?.id}
        onClick={() => setSelectedAddress(address)}
        options={{
          showPostalCode: true,
          startIcon: (
            <RadioGroup value={String(selectedAddress?.id)}>
              <RadioGroup.Item
                value={String(address.id)}
                checked={selectedAddress?.id === address.id}
              />
            </RadioGroup>
          ),
          endIcon: (
            <IconButton
              variant="ghost"
              onClick={(e: Event) => {
                e.stopPropagation()
                handleSettingsClick(address)
              }}
            >
              <RiMore2Line />
            </IconButton>
          ),
        }}
      />
    )
  }

  const renderSkeletonItem = () => {
    return (
      <AddressItem.Skeleton
        variant="outlined"
        options={{ showStartIcon: true, showEndIcon: true }}
      />
    )
  }

  if (!isLoading && addresses.length === 0) {
    redirect(buildAddressCreateSelectLocationUrl())
  }

  return (
    <>
      <Layout.Header height={64}>
        <Header
          right={<HeaderBackButton />}
          center="آدرس‌ها"
          left={<HeaderLogo />}
        />
      </Layout.Header>

      <main className="py-4">
        <FlatList<UserAddress>
          fragment
          data={addresses}
          itemKey="id"
          loading={isLoading}
          renderItem={renderItem}
          renderDivider={() => <Divider className="my-2" />}
          renderSkeleton={renderSkeletonItem}
        />
      </main>

      {addresses?.length > 1 && (
        <Layout.Footer height={84} className="bg-background-main p-4 shadow-sm">
          <Button
            disabled={selectedAddress?.id === primaryAddress?.id}
            size="large"
            className="w-full"
            loading={isUpdating || isLoading}
            onClick={onSelectPrimaryAddress}
          >
            انتخاب آدرس
          </Button>
        </Layout.Footer>
      )}
    </>
  )
}

export default AddressesPage
