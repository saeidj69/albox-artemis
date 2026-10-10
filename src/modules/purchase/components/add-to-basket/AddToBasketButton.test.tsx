import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { ListingProductSummary } from '@/api/models'

import AddToBasketButton from './AddToBasketButton'

const add = vi.fn()
const remove = vi.fn()
const setQuantity = vi.fn()
const showSheet = vi.fn()

const mockUseBasketEntity = vi.fn()

vi.mock('@/modules/purchase/hooks', () => ({
  useBasketEntity: (...args: unknown[]) => mockUseBasketEntity(...args),
}))

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => showSheet(...args),
    hideSheet: vi.fn(),
  }
})

vi.mock('@bprogress/next', () => ({
  useProgress: () => ({ stop: vi.fn() }),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: vi.fn(),
  }
})

const mockProduct: ListingProductSummary = {
  id: 101,
  name: 'تست محصول',
  isPromoted: false,
  purchasableQuantity: 10,
  boxDiscountedPrice: 100_000,
  boxRetailPrice: 120_000,
  unitInBox: 1,
  unitRetailPrice: 10_000,
  unitDiscountedPrice: 8_000,
  unitDiscountAmount: 2_000,
  totalDiscount: 15,
  totalDiscountAmount: 20_000,
  totalCashback: 0,
  totalCashbackAmount: 0,
  stepDiscounts: [],
  images: [],
  category: { id: 1, name: 'تست', parentId: null },
  brand: {
    id: 1,
    name: 'تست',
    manufacturer: { id: 1, name: 'تولیدکننده تست' },
  },
}

describe('AddToBasketButton', () => {
  beforeEach(() => {
    add.mockReset()
    remove.mockReset()
    setQuantity.mockReset()
    showSheet.mockReset()
    mockUseBasketEntity.mockReturnValue({
      quantity: 0,
      add,
      remove,
      setQuantity,
    })
  })

  test('renders "در حال تامین" state when disabled is true', () => {
    const { container } = render(
      <AddToBasketButton product={mockProduct} disabled />,
    )
    expect(screen.getByText('در حال تامین')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="add-to-basket-button"]'),
    ).toHaveAttribute('aria-disabled')
  })

  test('renders "افزودن به سبد خرید" when quantity is 0', () => {
    render(<AddToBasketButton product={mockProduct} />)
    expect(screen.getByText('افزودن به سبد خرید')).toBeInTheDocument()
  })

  test('clicking button when quantity is 0 calls add', async () => {
    const user = userEvent.setup()
    render(<AddToBasketButton product={mockProduct} />)

    const btn = screen.getByRole('button')
    await user.click(btn)

    expect(add).toHaveBeenCalledWith({
      quantity: 1,
      title: 'تست محصول',
      priceWhenAdded: 100_000,
    })
  })

  test('renders QuantityControls when quantity > 0', () => {
    mockUseBasketEntity.mockReturnValue({
      quantity: 3,
      add,
      remove,
      setQuantity,
    })
    const { container } = render(<AddToBasketButton product={mockProduct} />)

    expect(
      container.querySelector('[data-slot="flip-digits"]'),
    ).toHaveAttribute('data-value', '3')
  })

  test('clicking increment button calls add', async () => {
    const user = userEvent.setup()
    mockUseBasketEntity.mockReturnValue({
      quantity: 2,
      add,
      remove,
      setQuantity,
    })

    render(<AddToBasketButton product={mockProduct} />)

    const incBtn = screen.getByRole('button', { name: 'افزودن' })
    await user.click(incBtn)

    expect(add).toHaveBeenCalledWith({
      quantity: 1,
      title: 'تست محصول',
      priceWhenAdded: 100_000,
    })
  })

  test('clicking decrement button calls remove when quantity is 1', async () => {
    const user = userEvent.setup()
    mockUseBasketEntity.mockReturnValue({
      quantity: 1,
      add,
      remove,
      setQuantity,
    })

    render(<AddToBasketButton product={mockProduct} />)

    const decBtn = screen.getByRole('button', { name: 'کم کردن' })
    await user.click(decBtn)

    expect(remove).toHaveBeenCalledTimes(1)
  })

  test('shows confirm remove sheet when confirmRemove is true and quantity is 1', async () => {
    const user = userEvent.setup()
    mockUseBasketEntity.mockReturnValue({
      quantity: 1,
      add,
      remove,
      setQuantity,
    })

    render(<AddToBasketButton product={mockProduct} confirmRemove />)

    const decBtn = screen.getByRole('button', { name: 'کم کردن' })
    await user.click(decBtn)

    expect(showSheet).toHaveBeenCalledTimes(1)
  })
})
