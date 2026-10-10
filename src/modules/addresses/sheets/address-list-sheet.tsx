'use client'

import { Fragment, useState } from 'react'

import AddressItem from '@/components/AddressItem'

import { useUserAddresses } from '@/modules/addresses/hooks'

import { useUpdateAddresses } from '@/api/functions/addresses'
import type { UserAddress } from '@/api/models'

import Button from '@/lib/Button'
import Divider from '@/lib/Divider'
import RadioGroup from '@/lib/Radio'
import {
  createSheet,
  Sheet,
  SheetFooter,
  SheetHeader,
  useSheet,
} from '@/lib/Sheet'

const AddressListSheetComponent = () => {
  const {
    addresses,
    primaryAddress,
    invalidateUserAddresses,
    isLoading: isLoadingUserAddresses,
  } = useUserAddresses()

  const sheet = useSheet()

  const [prevPrimaryAddress, setPrevPrimaryAddress] =
    useState<UserAddress | null>(primaryAddress || null)
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    primaryAddress || null,
  )

  if (primaryAddress?.id !== prevPrimaryAddress?.id) {
    setPrevPrimaryAddress(primaryAddress || null)
    setSelectedAddress(primaryAddress || null)
  }

  const { mutate: updatePrimaryAddress, isPending: isUpdatingPrimaryAddress } =
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
          sheet.hide()
        },
      },
    )
  }

  return (
    <Sheet title="آدرس‌ها" description="انتخاب آدرس فروشگاه">
      <SheetHeader title="آدرس‌ها" showClose />

      <div className="max-h-[50vh] overflow-y-auto p-4">
        {isLoadingUserAddresses ? (
          <>
            <AddressItem.Skeleton options={{ showStartIcon: true }} />
            <Divider className="my-2" />
            <AddressItem.Skeleton options={{ showStartIcon: true }} />
          </>
        ) : addresses.length === 0 ? (
          <p className="typo-body-small text-text-secondary py-6 text-center">
            آدرسی ثبت نشده است
          </p>
        ) : (
          addresses.map((item, index) => (
            <Fragment key={item.id}>
              <AddressItem
                variant="normal"
                address={item}
                onClick={() => setSelectedAddress(item)}
                options={{
                  startIcon: (
                    <RadioGroup value={String(selectedAddress?.id)}>
                      <RadioGroup.Item
                        value={String(item.id)}
                        checked={selectedAddress?.id === item.id}
                      />
                    </RadioGroup>
                  ),
                }}
              />

              {index !== addresses.length - 1 && <Divider className="my-2" />}
            </Fragment>
          ))
        )}
      </div>

      {addresses.length > 1 && (
        <SheetFooter>
          <Button
            variant="primary"
            size="large"
            onClick={() => onSelectPrimaryAddress()}
            disabled={selectedAddress?.id === primaryAddress?.id}
            loading={isUpdatingPrimaryAddress || isLoadingUserAddresses}
          >
            انتخاب آدرس
          </Button>
        </SheetFooter>
      )}
    </Sheet>
  )
}

const AddressListSheet = createSheet(AddressListSheetComponent)

export default AddressListSheet
