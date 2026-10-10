'use client'

import { useCallback, useEffect, useRef } from 'react'

import { CLIENT_STATE_KEYS } from '@/constants'
import { useOnWindowFocus } from '@/hooks/useWindowFocus'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAtom, useSetAtom, useStore } from 'jotai'

import { EXPERIMENTS, useExperiment } from '@/modules/experiments'

import {
  getGetClientStateQueryKey,
  useGetClientState,
  usePutClientState,
} from '@/api/functions/client-state'
import type { PutClientState409 } from '@/api/models'

import { basketLinesAtom } from '../atoms'
import type { BasketLine } from '../types'
import { parseServerBasketLines } from '../utils'

const DEBOUNCE_MS = 500
const CLIENT_STATE_USER = 'me' as const
const CART_KEY = CLIENT_STATE_KEYS.CART_V3

/** Shared across hook instances so version stays consistent (layout + pages). */
const expectedVersionRef: { current: number | null } = { current: null }
const lastPushedSignatureRef: { current: string | null } = { current: null }

type SetBasketLines = (
  lines: BasketLine[] | ((prev: BasketLine[]) => BasketLine[]),
) => void

function linesFromServerValue(value: string | null | undefined): BasketLine[] {
  if (!value) return []
  return parseServerBasketLines(value) ?? []
}

function adoptServerLines(
  setLines: SetBasketLines,
  lines: BasketLine[],
  version: number | null,
) {
  expectedVersionRef.current = version
  const signature = JSON.stringify(lines)
  lastPushedSignatureRef.current = signature
  setLines((current) =>
    JSON.stringify(current) === signature ? current : lines,
  )
}

function cartQueryKey() {
  return getGetClientStateQueryKey(CLIENT_STATE_USER, CART_KEY)
}

type UseBasketSyncOptions = {
  /** Only sync when true — e.g. gate on authentication upstream. */
  enabled?: boolean
}

/**
 * Debounced LWW sync of `basketLinesAtom` ↔ `CLIENT_STATE_KEYS.CART_V3`.
 *
 * - Pulls via `useGetClientState` (React Query), `refetchOnWindowFocus`.
 * - Adopts query data into the local basket atom (LWW replace).
 * - On local edits (after first fetch): debounced PUT with `expectedVersion`.
 * - On 409: adopt server snapshot; no merge, no auto-retry.
 * - No-ops when the `basket-server-sync` experiment resolves to `disabled`
 *   (or hasn't resolved yet — defaults to disabled).
 *
 * For an explicit refetch from basket/checkout, use `useBasketRemoteSync`.
 */
export function useBasketSync(options?: UseBasketSyncOptions) {
  const { enabled = false } = options ?? {}
  const basketSyncVariant = useExperiment(EXPERIMENTS.BASKET_SERVER_SYNC)
  const syncEnabled = enabled && (basketSyncVariant?.payload?.enabled ?? false)
  const [lines, setLines] = useAtom(basketLinesAtom)
  const queryClient = useQueryClient()

  const { mutateAsync: putCart } = usePutClientState({
    request: { skipErrorToast: true },
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, isFetched, dataUpdatedAt } = useGetClientState(
    CLIENT_STATE_USER,
    CART_KEY,
    {
      query: {
        enabled: syncEnabled,
        refetchOnWindowFocus: syncEnabled,
      },
      request: { skipErrorToast: true },
    },
  )

  // Server query → local basket (incl. focus refetch via React Query).
  useEffect(() => {
    if (!syncEnabled || !isFetched || data === undefined) return

    adoptServerLines(setLines, linesFromServerValue(data.value), data.version)
  }, [syncEnabled, isFetched, data, dataUpdatedAt, setLines])

  // Local edits → debounced PUT (after first fetch settles).
  useEffect(() => {
    if (!syncEnabled || !isFetched) return

    const signature = JSON.stringify(lines)
    if (signature === lastPushedSignatureRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await putCart({
            user: CLIENT_STATE_USER,
            key: CART_KEY,
            data: {
              value: JSON.stringify(lines),
              expectedVersion: expectedVersionRef.current,
            },
          })
          expectedVersionRef.current = result.version
          lastPushedSignatureRef.current = JSON.stringify(lines)
          queryClient.setQueryData(cartQueryKey(), {
            value: JSON.stringify(lines),
            version: result.version,
          })
        } catch (error) {
          if (
            axios.isAxiosError<PutClientState409>(error) &&
            error.response?.status === 409
          ) {
            const { metadata } = error.response.data
            adoptServerLines(
              setLines,
              linesFromServerValue(metadata.value),
              metadata.version,
            )
            queryClient.setQueryData(cartQueryKey(), {
              value: metadata.value,
              version: metadata.version,
            })
          }
        }
      })()
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [lines, syncEnabled, isFetched, setLines, putCart, queryClient])
}

/**
 * Refetch cart client-state from basket/checkout. Shares the React Query
 * cache with `useBasketSync` — adopt into the atom happens there.
 *
 * Imperative `sync()` returns `{ changed }` — `changed` is true when server
 * lines differ from local (after LWW adopt). `changed` is false when sync
 * is disabled or the fetch fails.
 */
export function useBasketRemoteSync() {
  const setLines = useSetAtom(basketLinesAtom)
  const store = useStore()
  const basketSyncVariant = useExperiment(EXPERIMENTS.BASKET_SERVER_SYNC)
  const syncEnabled = basketSyncVariant?.payload?.enabled ?? false

  const { data, dataUpdatedAt, isFetched, isFetching, refetch } =
    useGetClientState(CLIENT_STATE_USER, CART_KEY, {
      query: {
        enabled: syncEnabled,
        refetchOnWindowFocus: syncEnabled,
      },
      request: { skipErrorToast: true },
    })

  useOnWindowFocus(() => {
    if (!syncEnabled) return
    void refetch()
  })

  // Keep page observers in sync if layout hook is not the only subscriber.
  useEffect(() => {
    if (!syncEnabled || !isFetched || data === undefined) return

    adoptServerLines(setLines, linesFromServerValue(data.value), data.version)
  }, [syncEnabled, data, dataUpdatedAt, isFetched, setLines])

  useEffect(() => {
    if (!syncEnabled) return
    void refetch()
  }, [syncEnabled, refetch])

  const sync = useCallback(async (): Promise<{ changed: boolean }> => {
    if (!syncEnabled) return { changed: false }

    const before = JSON.stringify(store.get(basketLinesAtom))
    const result = await refetch()

    if (result.data === undefined) return { changed: false }

    const next = linesFromServerValue(result.data.value)
    const changed = JSON.stringify(next) !== before
    adoptServerLines(setLines, next, result.data.version)
    return { changed }
  }, [refetch, setLines, store, syncEnabled])

  return { sync, isSyncing: syncEnabled && isFetching }
}
