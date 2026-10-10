import type { ReactNode } from 'react'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import type { ListingProductSummary } from '@/api/models'

import HorizontalProductList from './HorizontalProductList'

const { inViewOptions, useInView } = vi.hoisted(() => ({
  inViewOptions: [] as { onChange: (inView: boolean) => void }[],
  useInView: vi.fn(),
}))

vi.mock('react-intersection-observer', () => ({
  useInView: (options: { onChange: (inView: boolean) => void }) => {
    inViewOptions.push(options)
    return useInView(options)
  },
}))

vi.mock('@/components/Animate', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ProductCard', () => {
  const ProductCard = ({ product }: { product: ListingProductSummary }) => (
    <article>{product.name}</article>
  )

  return {
    default: Object.assign(ProductCard, {
      Skeleton: () => <div>loading product</div>,
    }),
  }
})

vi.mock('@/lib/Carousel', () => ({
  Carousel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CarouselContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselItem: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

const product = (id: number) =>
  ({ id, name: `Product ${id}` }) as ListingProductSummary

describe('HorizontalProductList visibility observation', () => {
  beforeEach(() => {
    inViewOptions.length = 0
    useInView.mockReset()
    useInView.mockReturnValue({ ref: vi.fn() })
  })

  test('does not create visibility observers for an ordinary product list', () => {
    render(<HorizontalProductList title="Products" products={[product(1)]} />)

    expect(useInView).not.toHaveBeenCalled()
  })

  test('observes each product when full-visibility reporting is requested', () => {
    const onProductFullyVisible = vi.fn()
    const products = [product(1), product(2)]

    render(
      <HorizontalProductList
        title="Recommendations"
        products={products}
        onProductFullyVisible={onProductFullyVisible}
      />,
    )

    expect(useInView).toHaveBeenCalledTimes(2)

    inViewOptions[1]?.onChange(false)
    expect(onProductFullyVisible).not.toHaveBeenCalled()

    inViewOptions[1]?.onChange(true)
    expect(onProductFullyVisible).toHaveBeenCalledWith(products[1], 1)
  })
})

describe('HorizontalProductList header backdrop', () => {
  test('renders a backdrop behind the title row when provided', () => {
    render(
      <HorizontalProductList
        title="Snacks"
        titleHref="/snacks"
        products={[product(1)]}
        headerBackdrop={<div data-testid="header-backdrop-child" />}
      />,
    )

    const backdrop = document.querySelector<HTMLElement>(
      '[data-slot="horizontal-product-list-header-backdrop"]',
    )
    const header = document.querySelector<HTMLElement>(
      '[data-slot="horizontal-product-list-header"]',
    )

    const title = document.querySelector<HTMLElement>(
      '[data-slot="horizontal-product-list-title"]',
    )
    const moreLink = document.querySelector<HTMLElement>(
      '[data-slot="horizontal-product-list-more-link"]',
    )

    expect(screen.getByTestId('header-backdrop-child')).toBeInTheDocument()
    expect(header).toHaveClass('relative', 'isolate')
    expect(backdrop).toHaveClass('absolute', 'inset-0', '-z-10')
    expect(header).toContainElement(backdrop)
    expect(header).toContainElement(title)
    expect(header).toContainElement(moreLink)
  })
})
