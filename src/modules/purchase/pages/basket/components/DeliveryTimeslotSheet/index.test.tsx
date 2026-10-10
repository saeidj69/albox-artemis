import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import { DeliveryTimeslotSheetComponent } from '.'

const mockBasketData = vi.fn()
const mockIsChecking = vi.fn()
const mockHolidayDates = vi.fn()
const mockTrack = vi.fn()
const mockHideSheet = vi.fn()

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketCheckCall: () => ({
    data: mockBasketData(),
    isChecking: mockIsChecking(),
  }),
  useOfficialHolidaysForDates: () => ({
    holidayDates: mockHolidayDates(),
  }),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => mockTrack(...args),
  }
})

vi.mock('@ebay/nice-modal-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ebay/nice-modal-react')>()
  return {
    ...actual,
    useModal: () => ({
      hide: mockHideSheet,
      visible: true,
    }),
  }
})

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    Sheet: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useSheet: () => ({
      hide: mockHideSheet,
      visible: true,
    }),
  }
})

const sampleTimeslots = [
  {
    id: 10,
    deliveryDate: '2026-08-05',
    deliveryStartTime: '09:00:00',
    deliveryEndTime: '12:00:00',
    isFull: false,
    deliveryFee: 40000,
  },
  {
    id: 11,
    deliveryDate: '2026-08-06',
    deliveryStartTime: '14:00:00',
    deliveryEndTime: '18:00:00',
    isFull: false,
    deliveryFee: 50000,
  },
]

describe('DeliveryTimeslotSheet', () => {
  beforeEach(() => {
    mockIsChecking.mockReturnValue(false)
    mockBasketData.mockReturnValue({
      basket: { timeslotOptions: sampleTimeslots },
    })
    mockHolidayDates.mockReturnValue(new Set<string>())
    mockTrack.mockReset()
    mockHideSheet.mockReset()
  })

  test('renders empty message when no available timeslots', () => {
    mockBasketData.mockReturnValue({ basket: { timeslotOptions: [] } })
    render(
      <DeliveryTimeslotSheetComponent
        initialSelected={null}
        onConfirm={vi.fn()}
      />,
    )

    expect(
      screen.getByText('در حال حاضر زمان تحویلی موجود نیست.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تایید زمان ارسال' }),
    ).toBeDisabled()
  })

  test('renders options and enables confirm when selected', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <DeliveryTimeslotSheetComponent
        initialSelected={10}
        onConfirm={onConfirm}
      />,
    )

    const confirmBtn = screen.getByRole('button', {
      name: 'تایید زمان ارسال',
    })
    expect(confirmBtn).toBeEnabled()

    await user.click(confirmBtn)
    expect(onConfirm).toHaveBeenCalledWith(10)
    expect(mockHideSheet).toHaveBeenCalledTimes(1)
    expect(mockTrack).toHaveBeenCalledWith(EVENTS.DELIVERY_TIME_SELECTED, {
      plausible: { type: 'delivery_time_finalized' },
    })
  })

  test('shows holiday warning when selected date is an official holiday', () => {
    mockHolidayDates.mockReturnValue(new Set(['2026-08-05']))

    render(
      <DeliveryTimeslotSheetComponent
        initialSelected={10}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/تعطیل رسمی/)).toBeInTheDocument()
  })
})
