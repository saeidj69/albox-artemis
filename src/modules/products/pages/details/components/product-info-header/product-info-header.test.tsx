import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import ProductInfoHeader from './product-info-header'

describe('ProductInfoHeader', () => {
  test('renders product name, brand link, and carton unit count chip', () => {
    const titleRef = vi.fn()

    render(
      <ProductInfoHeader
        name="نوشابه کوکاکولا"
        brandId={5}
        brandName="کوکاکولا"
        unitInBox={12}
        titleRef={titleRef}
      />,
    )

    expect(screen.getByText('نوشابه کوکاکولا')).toBeInTheDocument()

    const brandLink = screen.getByRole('link', { name: 'کوکاکولا' })
    expect(brandLink).toHaveAttribute('href', '/brands/5')

    expect(screen.getByText('کارتن ۱۲ عددی')).toBeInTheDocument()
  })
})
