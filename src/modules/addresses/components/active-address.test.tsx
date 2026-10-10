import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import ActiveAddress from './active-address'

const mockPush = vi.fn()
const mockUseUserAddresses = vi.fn()
const mockShowSheet = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/modules/addresses/hooks', () => ({
  useUserAddresses: () => mockUseUserAddresses(),
}))

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => mockShowSheet(...args),
  }
})

describe('ActiveAddress component', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockUseUserAddresses.mockReset()
    mockShowSheet.mockReset()
  })

  test('renders skeleton when address list is loading', () => {
    mockUseUserAddresses.mockReturnValue({
      addresses: [],
      primaryAddress: null,
      isLoading: true,
    })

    const { container } = render(<ActiveAddress />)

    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
  })

  test('renders primary address name and full address string when address exists', () => {
    mockUseUserAddresses.mockReturnValue({
      addresses: [{ id: 1, name: 'دفتر کار' }],
      primaryAddress: {
        id: 1,
        name: 'دفتر کار',
        address: 'تهران، خیابان آزادی',
      },
      isLoading: false,
    })

    render(<ActiveAddress />)

    expect(screen.getByText('دفتر کار')).toBeInTheDocument()
    expect(screen.getByText('تهران، خیابان آزادی')).toBeInTheDocument()
  })

  test('navigates to location selection page when user has no saved addresses', async () => {
    mockUseUserAddresses.mockReturnValue({
      addresses: [],
      primaryAddress: null,
      isLoading: false,
    })

    const user = userEvent.setup()
    render(<ActiveAddress />)

    const noAddressChip = screen.getByText('انتخاب موقعیت مکانی فروشگاه شما')
    await user.click(noAddressChip)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/select-location'),
    )
  })
})
