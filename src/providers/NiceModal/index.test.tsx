import { create, show, useModal } from '@ebay/nice-modal-react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import NiceModalProvider from './index'

const mockPathname = vi.fn()
const mockSearch = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(mockSearch()),
}))

const TestModal = create(() => {
  const modal = useModal()
  return modal.visible ? <div data-testid="test-modal" /> : null
})

const renderProvider = () =>
  render(<NiceModalProvider>content</NiceModalProvider>)

afterEach(() => {
  mockPathname.mockReset()
  mockSearch.mockReset()
})

describe('NiceModalProvider', () => {
  test('closes open modals when the route changes', async () => {
    mockPathname.mockReturnValue('/basket')
    mockSearch.mockReturnValue('')

    const view = renderProvider()

    void show(TestModal)
    await screen.findByTestId('test-modal')

    mockPathname.mockReturnValue('/design-system')
    view.rerender(<NiceModalProvider>content</NiceModalProvider>)

    await waitFor(() => {
      expect(screen.queryByTestId('test-modal')).not.toBeInTheDocument()
    })
  })
})
