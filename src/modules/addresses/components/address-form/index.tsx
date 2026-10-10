'use client'

import { FC } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import type { AddressFormValues } from '@/modules/addresses/validation/address-form-schema'

import Input from '@/lib/Input'

type AddressFormRegion = {
  /** Display label like «تهران، تهران» — derived from the map location. */
  value: string
  error?: boolean
  helperText?: string
}

type AddressFormProps = {
  register: UseFormRegister<AddressFormValues>
  errors: FieldErrors<AddressFormValues>
  region: AddressFormRegion
}

const AddressForm: FC<AddressFormProps> = (props) => {
  const { register, errors, region } = props
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="عنوان آدرس"
          placeholder="فروشگاه، انبار، ..."
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <Input
          label="استان، شهر"
          disabled
          value={region.value}
          error={region.error}
          helperText={region.helperText}
        />
      </div>

      <Input
        label="آدرس دقیق"
        placeholder="تهران، خیابان آزادی، نرسیده به میدان آزادی"
        {...register('address')}
        error={!!errors.address}
        helperText={errors.address?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="پلاک"
          inputMode="numeric"
          {...register('buildingNumber')}
          error={!!errors.buildingNumber}
          helperText={errors.buildingNumber?.message}
        />

        <Input
          label="واحد"
          optional
          inputMode="numeric"
          {...register('unit')}
          error={!!errors.unit}
          helperText={errors.unit?.message}
        />
      </div>

      <Input
        label="کد پستی"
        placeholder="۱۰ رقمی و بدون خط تیره"
        inputMode="numeric"
        {...register('postalCode')}
        error={!!errors.postalCode}
        helperText={errors.postalCode?.message}
      />
    </>
  )
}

export default AddressForm
