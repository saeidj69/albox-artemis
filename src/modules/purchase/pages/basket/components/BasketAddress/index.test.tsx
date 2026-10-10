import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import BasketAddress from '.'

const mockPrimaryAddress = vi.fn()
const mockIsLoading = vi.fn()
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/modules/addresses/hooks', () => ({
  useUserAddresses: () => ({
    primaryAddress: mockPrimaryAddress(),
    isLoading: mockIsLoading(),
  }),
}))

const sampleAddress = {
  id: 1,
  name: 'دفتر مرکزی',
  address: 'تهران، خیابان ولیعصر، پلاک ۱۰۰',
  postalCode: '1234567890',
  isPrimary: true,
  location: { latitude: 35.6892, longitude: 51.389 },
}

describe('BasketAddress', () => {
  beforeEach(() => {
    mockIsLoading.mockReturnValue(false)
    mockPrimaryAddress.mockReturnValue(sampleAddress)
    mockPush.mockReset()
  })

  test('renders skeleton while loading addresses', () => {
    mockIsLoading.mockReturnValue(true)
    const { container } = render(<BasketAddress />)

    expect(
      container.querySelector('[data-slot="address-item-skeleton"]'),
    ).toBeInTheDocument()
  })

  test('renders alert to add address when primaryAddress is null', async () => {
    const user = userEvent.setup()
    mockPrimaryAddress.mockReturnValue(null)

    render(<BasketAddress />)

    expect(screen.getByText('آدرسی ثبت نشده است')).toBeInTheDocument()

    const addBtn = screen.getByRole('button', { name: 'افزودن آدرس' })
    await user.click(addBtn)

    expect(mockPush).toHaveBeenCalledWith(
      '/select-location?next=/addresses/new&canSkip=false',
    )
  })

  test('renders AddressItem with primary address when address exists', () => {
    render(<BasketAddress />)

    expect(
      screen.getByText('تهران، خیابان ولیعصر، پلاک ۱۰۰'),
    ).toBeInTheDocument()
  })
})
