import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import { useUserAddresses } from './useUserAddresses'

const mockListAddresses = vi.fn()
const mockInvalidateQueries = vi.fn()

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  }
})

vi.mock('@/api/functions/addresses', () => ({
  useListAddresses: (...args: unknown[]) => mockListAddresses(...args),
  getListAddressesQueryKey: () => ['addresses', 'me'],
}))

const sampleAddresses = [
  { id: 1, name: 'خانه', isPrimary: false, address: 'تهران ۱' },
  { id: 2, name: 'دفتر', isPrimary: true, address: 'تهران ۲' },
]

describe('useUserAddresses', () => {
  beforeEach(() => {
    mockListAddresses.mockReset()
    mockInvalidateQueries.mockReset()
  })

  test('extracts primaryAddress and addresses list correctly', () => {
    mockListAddresses.mockImplementation(
      (
        _user: string,
        options: { query?: { select?: (data: unknown) => unknown } },
      ) => {
        const select = options?.query?.select
        const data = select
          ? select({ addresses: sampleAddresses })
          : { addresses: sampleAddresses }
        return { data }
      },
    )

    const { result } = renderHook(() => useUserAddresses())

    expect(result.current.addresses).toHaveLength(2)
    expect(result.current.primaryAddress?.id).toBe(2)
  })

  test('returns empty array and null primaryAddress when data is empty', () => {
    mockListAddresses.mockImplementation(
      (
        _user: string,
        options: { query?: { select?: (data: unknown) => unknown } },
      ) => {
        const select = options?.query?.select
        const data = select ? select({ addresses: [] }) : { addresses: [] }
        return { data }
      },
    )

    const { result } = renderHook(() => useUserAddresses())

    expect(result.current.addresses).toEqual([])
    expect(result.current.primaryAddress).toBeNull()
  })

  test('invalidates address list query when invalidateUserAddresses is called', () => {
    mockListAddresses.mockReturnValue({ data: undefined })

    const { result } = renderHook(() => useUserAddresses())
    result.current.invalidateUserAddresses()

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['addresses', 'me'],
    })
  })
})
