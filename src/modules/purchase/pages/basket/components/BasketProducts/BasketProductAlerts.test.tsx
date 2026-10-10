import { describe, expect, test } from 'vitest'

import type { ProductAlert } from '@/modules/purchase/hooks'

import { render, screen } from '@/utils/test-utils'

import BasketProductAlerts from './components/BasketProductAlerts'

describe('BasketProductAlerts', () => {
  test('renders nothing when alerts is empty', () => {
    const { container } = render(
      <BasketProductAlerts productId={1} alerts={[]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  test('renders one list item per alert with severity class', () => {
    const alerts: ProductAlert[] = [
      { text: 'خطا', severity: 'error' },
      { text: 'هشدار', severity: 'warning' },
      { text: 'موفق', severity: 'success' },
    ]

    render(<BasketProductAlerts productId={7} alerts={alerts} />)

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('data-slot', 'basket-product-alerts')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('خطا')
    expect(items[0]).toHaveClass('text-error-main')
    expect(items[1]).toHaveTextContent('هشدار')
    expect(items[1]).toHaveClass('text-warning-dark')
    expect(items[2]).toHaveTextContent('موفق')
    expect(items[2]).toHaveClass('text-success-main')
  })
})
