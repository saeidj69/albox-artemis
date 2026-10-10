'use client'

import { useQueryClient } from '@tanstack/react-query'

import {
  getListAddressesQueryKey,
  useListAddresses,
} from '@/api/functions/addresses'
import type { UserAddress } from '@/api/models'

export const USER_ADDRESSES_STALE_TIME = Infinity

export type UserAddressesData = {
  addresses: UserAddress[]
  primaryAddress: UserAddress | null
}

type UseUserAddressesOptions = NonNullable<
  Parameters<typeof useListAddresses<UserAddressesData>>[1]
>

type UseUserAddressesQueryOptions = Omit<
  NonNullable<UseUserAddressesOptions['query']>,
  'select' | 'staleTime'
>

export const useUserAddresses = (options?: {
  query?: UseUserAddressesQueryOptions
  request?: UseUserAddressesOptions['request']
}) => {
  const queryClient = useQueryClient()

  const query = useListAddresses<UserAddressesData>('me', {
    ...options,
    query: {
      ...options?.query,
      staleTime: USER_ADDRESSES_STALE_TIME,
      select(data) {
        const addresses = data.addresses ?? []
        const primaryAddress =
          addresses.find((address) => address?.isPrimary) ?? null

        return { addresses, primaryAddress }
      },
    },
  })

  const invalidateUserAddresses = () =>
    queryClient.invalidateQueries({ queryKey: getListAddressesQueryKey('me') })

  return {
    ...query,
    invalidateUserAddresses,
    addresses: query.data?.addresses ?? [],
    primaryAddress: query.data?.primaryAddress ?? null,
  }
}
