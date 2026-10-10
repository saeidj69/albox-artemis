'use client'

import { FC } from 'react'

import { Edit2, Trash } from 'iconsax-reactjs'

import Divider from '@/lib/Divider'
import { createSheet, Sheet, SheetHeader, useSheet } from '@/lib/Sheet'
import { cn } from '@/lib/utils'

type AddressSettingsSheetProps = {
  onEdit: () => void
  onDelete: () => void
}

const AddressSettingsSheetComponent: FC<AddressSettingsSheetProps> = (
  props,
) => {
  const { onEdit, onDelete } = props
  const sheet = useSheet()

  return (
    <Sheet title="تنظیمات آدرس" description="تنظیمات آدرس">
      <SheetHeader title="تنظیمات آدرس" showClose />
      <div className="p-4">
        <div className="flex flex-col">
          <button
            type="button"
            className={cn(
              'rounded-brand flex cursor-pointer items-center justify-start gap-3 p-4',
              'hover:bg-background-secondary active:bg-background-darker',
            )}
            onClick={() => {
              sheet.hide()
              onEdit()
            }}
          >
            <Edit2 className="text-text-primary size-5" />
            <span className="typo-body-large text-text-primary">ویرایش</span>
          </button>

          <Divider className="my-2" />

          <button
            type="button"
            className={cn(
              'rounded-brand flex cursor-pointer items-center justify-start gap-3 p-4',
              'hover:bg-background-secondary active:bg-background-darker',
            )}
            onClick={() => {
              sheet.hide()
              onDelete()
            }}
          >
            <Trash className="text-text-primary size-5" />
            <span className="typo-body-large text-text-primary">حذف آدرس</span>
          </button>
        </div>
      </div>
    </Sheet>
  )
}

const AddressSettingsSheet = createSheet(AddressSettingsSheetComponent)

export default AddressSettingsSheet
