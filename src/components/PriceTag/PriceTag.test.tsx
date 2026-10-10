import { describe, expect, test } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { ListingProduct } from '@/api/models'

import PriceTag from './PriceTag'

describe('PriceTag Component', () => {
  const mockProductWithDiscount = {
    purchasableQuantity: 10,
    totalDiscount: 12.5,
    boxDiscountedPrice: 90000,
    boxRetailPrice: 100000,
  } as unknown as ListingProduct

  const mockProductWithoutDiscount = {
    purchasableQuantity: 5,
    totalDiscount: 0,
    boxDiscountedPrice: 80000,
    boxRetailPrice: 80000,
  } as unknown as ListingProduct

  const mockProductUnavailable = {
    purchasableQuantity: 0,
    totalDiscount: 10,
    boxDiscountedPrice: 90000,
    boxRetailPrice: 100000,
  } as unknown as ListingProduct

  test('renders correctly with discount, showing discount percentage and strikethrough retail price in Tomans', () => {
    render(<PriceTag product={mockProductWithDiscount} />)

    // Discount badge: ٪13 (ceil of 12.5, rendered as English number in the markup)
    expect(screen.getByText(/٪\s*13/)).toBeInTheDocument()

    // Retail price in Tomans (100,000 / 10 = 10,000) formatted to Persian with Persian thousands separator (٬)
    expect(screen.getByText('۱۰٬۰۰۰')).toBeInTheDocument()

    // Discounted price in Tomans (90,000 / 10 = 9,000) formatted to Persian with Persian thousands separator (٬)
    expect(screen.getByText('۹٬۰۰۰')).toBeInTheDocument()

    // Currency text (TOMAN constant value)
    expect(screen.getByText('تومان')).toBeInTheDocument()
  })

  test('renders correctly without discount, omitting discount row and strikethrough price', () => {
    render(<PriceTag product={mockProductWithoutDiscount} />)

    // No discount badge
    expect(screen.queryByText(/٪/)).not.toBeInTheDocument()

    // Price in Tomans (80,000 / 10 = 8,000) formatted to Persian with Persian thousands separator (٬)
    expect(screen.getByText('۸٬۰۰۰')).toBeInTheDocument()
    expect(screen.getByText('تومان')).toBeInTheDocument()
  })

  test('renders dashes for prices when product is unavailable', () => {
    render(<PriceTag product={mockProductUnavailable} />)

    // Discount badge still renders if hasDiscount is true
    expect(screen.getByText(/٪\s*10/)).toBeInTheDocument()

    // Price is replaced by dash '−' (character \u2212)
    const dashes = screen.getAllByText('−')
    expect(dashes.length).toBeGreaterThanOrEqual(2) // One for retail price, one for final price
  })

  test('applies custom classNames to slots', () => {
    const { container } = render(
      <PriceTag
        product={mockProductWithDiscount}
        classNames={{
          root: 'custom-root-class',
          badge: 'custom-badge-class',
        }}
      />,
    )

    // Verify slots have correct classes applied
    const rootEl = container.querySelector('[data-slot="price-tag"]')
    expect(rootEl).toHaveClass('custom-root-class')

    const badgeEl = container.querySelector('[data-slot="price-tag-badge"]')
    expect(badgeEl).toHaveClass('custom-badge-class')
  })
})
