import type { ReactNode } from 'react'

import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import FingerprintProvider from './index'

const mockThumbmarkProvider = vi.fn(({ children }: { children: ReactNode }) => (
  <div data-testid="thumbmark-provider">{children}</div>
))

vi.mock('@thumbmarkjs/react', () => ({
  ThumbmarkProvider: (props: { children: ReactNode }) =>
    mockThumbmarkProvider(props),
}))

describe('FingerprintProvider', () => {
  test('wraps children with ThumbmarkProvider', () => {
    render(
      <FingerprintProvider>
        <span>child-content</span>
      </FingerprintProvider>,
    )

    expect(screen.getByTestId('thumbmark-provider')).toBeInTheDocument()
    expect(screen.getByText('child-content')).toBeInTheDocument()
    expect(mockThumbmarkProvider).toHaveBeenCalled()
  })
})
