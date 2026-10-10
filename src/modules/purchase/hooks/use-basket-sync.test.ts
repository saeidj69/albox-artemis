import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/utils/test-utils'

import { server } from '../../../../vitest.setup'
import type { ProductBasketLine } from '../types'
import { useBasketRemoteSync, useBasketSync } from './use-basket-sync'

const mockSetLines = vi.fn()

let mockLines: ProductBasketLine[] = [
  {
    type: 'product',
    productId: 101,
    quantity: 2,
    title: 'Test Product',
    priceWhenAdded: 100_000,
    addedAt: 1,
  },
]

vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>()
  return {
    ...actual,
    useAtom: () => [mockLines, mockSetLines],
    useSetAtom: () => mockSetLines,
    useStore: () => ({
      get: () => mockLines,
    }),
  }
})

const mockUseExperiment = vi.fn()

vi.mock('@/modules/experiments', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/modules/experiments')>()
  return {
    ...actual,
    useExperiment: () => mockUseExperiment(),
  }
})

describe('useBasketSync & useBasketRemoteSync', () => {
  beforeEach(() => {
    mockSetLines.mockReset()
    mockUseExperiment.mockReset()
    mockUseExperiment.mockReturnValue({
      key: 'enabled',
      label: 'فعال',
      weight: 0,
      payload: { enabled: true },
    })
    mockLines = [
      {
        type: 'product',
        productId: 101,
        quantity: 2,
        title: 'Test Product',
        priceWhenAdded: 100_000,
        addedAt: 1,
      },
    ]
  })

  it('fetches server cart state and adopts server lines on mount', async () => {
    server.use(
      http.get('*/user/users/me/client-state/cart-v3', () => {
        return HttpResponse.json({
          value: JSON.stringify(mockLines),
          version: 5,
        })
      }),
    )

    renderHook(() => useBasketSync({ enabled: true }))

    await waitFor(() => {
      expect(mockSetLines).toHaveBeenCalled()
    })
  })

  it('useBasketRemoteSync.sync() refetches server state and detects when lines changed', async () => {
    const serverLines: ProductBasketLine[] = [
      ...mockLines,
      {
        type: 'product',
        productId: 202,
        quantity: 1,
        title: 'New Item',
        priceWhenAdded: 50_000,
        addedAt: 2,
      },
    ]

    server.use(
      http.get('*/user/users/me/client-state/cart-v3', () => {
        return HttpResponse.json({
          value: JSON.stringify(serverLines),
          version: 6,
        })
      }),
    )

    const { result } = renderHook(() => useBasketRemoteSync())

    let syncResult: { changed: boolean } | undefined
    await act(async () => {
      syncResult = await result.current.sync()
    })

    expect(syncResult).toEqual({ changed: true })
    expect(mockSetLines).toHaveBeenCalled()
  })

  it('does not sync when the experiment variant is disabled', async () => {
    mockUseExperiment.mockReturnValue({
      key: 'disabled',
      label: 'غیرفعال',
      weight: 100,
      payload: { enabled: false },
    })

    server.use(
      http.get('*/user/users/me/client-state/cart-v3', () => {
        return HttpResponse.json({
          value: JSON.stringify(mockLines),
          version: 5,
        })
      }),
    )

    renderHook(() => useBasketSync({ enabled: true }))

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockSetLines).not.toHaveBeenCalled()

    const { result } = renderHook(() => useBasketRemoteSync())
    let syncResult: { changed: boolean } | undefined
    await act(async () => {
      syncResult = await result.current.sync()
    })
    expect(syncResult).toEqual({ changed: false })
  })

  it('defaults to disabled when the experiment has not resolved yet', async () => {
    mockUseExperiment.mockReturnValue(null)

    server.use(
      http.get('*/user/users/me/client-state/cart-v3', () => {
        return HttpResponse.json({
          value: JSON.stringify(mockLines),
          version: 5,
        })
      }),
    )

    renderHook(() => useBasketSync({ enabled: true }))

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockSetLines).not.toHaveBeenCalled()
  })
})
