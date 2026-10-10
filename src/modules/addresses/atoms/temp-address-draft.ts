import { atom } from 'jotai'

import type { AddressFormValues } from '@/modules/addresses/validation/address-form-schema'

export type TempAddressDraft =
  | {
      mode: 'create'
      values: AddressFormValues
    }
  | {
      mode: 'edit'
      addressId: number
      values: AddressFormValues
    }

export const tempAddressDraftAtom = atom<TempAddressDraft | null>(null)
