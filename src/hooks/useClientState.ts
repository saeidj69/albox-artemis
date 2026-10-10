'use client'

import { useCallback, useMemo } from 'react'

import {
  clientStateApiKeys,
  parseClientStateValue,
  serializeClientStateValue,
  type ClientStateSchemaKey,
  type ClientStateValue,
} from '@/helpers/client-state'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import {
  getGetClientStateQueryKey,
  useGetClientState,
  usePutClientState,
} from '@/api/functions/client-state'
import type { PutClientState409 } from '@/api/models'

const CLIENT_STATE_USER = 'me' as const

type CachedClientState = { value: string | null; version: number | null }

export function useClientState<K extends ClientStateSchemaKey>(
  key: K,
  options?: { enabled?: boolean; shareWithImpersonators?: boolean },
) {
  const { enabled = true, shareWithImpersonators = false } = options ?? {}
  const stateKey = clientStateApiKeys[key]
  const queryClient = useQueryClient()

  const query = useGetClientState(CLIENT_STATE_USER, stateKey, {
    query: {
      enabled,
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
    request: { skipErrorToast: true },
  })

  const value = useMemo(
    () => parseClientStateValue(key, query.data?.value),
    [key, query.data?.value],
  )

  const {
    mutate: putClientState,
    isPending: isSaving,
    isError: isSaveError,
  } = usePutClientState({
    request: { skipErrorToast: true },
  })

  const setValue = useCallback(
    (
      next:
        | ClientStateValue<K>
        | ((prev: ClientStateValue<K> | null) => ClientStateValue<K>),
    ) => {
      const cached = queryClient.getQueryData<CachedClientState>(
        getGetClientStateQueryKey(CLIENT_STATE_USER, stateKey),
      )

      const resolved =
        typeof next === 'function'
          ? next(parseClientStateValue(key, cached?.value))
          : next

      const serialized = serializeClientStateValue(key, resolved)
      if (!serialized) {
        return
      }

      putClientState(
        {
          user: CLIENT_STATE_USER,
          key: stateKey,
          data: {
            value: serialized,
            shareWithImpersonators,
            expectedVersion: cached?.version ?? null,
          },
        },
        {
          onSuccess: (result) => {
            queryClient.setQueryData<CachedClientState>(
              getGetClientStateQueryKey(CLIENT_STATE_USER, stateKey),
              { value: serialized, version: result.version },
            )
          },
          onError: (error) => {
            // A 409 means another writer won the race — adopt the server's
            // value instead of silently losing this update or the other one.
            if (
              axios.isAxiosError<PutClientState409>(error) &&
              error.response?.status === 409
            ) {
              const { metadata } = error.response.data
              queryClient.setQueryData<CachedClientState>(
                getGetClientStateQueryKey(CLIENT_STATE_USER, stateKey),
                { value: metadata.value, version: metadata.version },
              )
            }
          },
        },
      )
    },
    [key, putClientState, queryClient, stateKey, shareWithImpersonators],
  )

  return {
    value,
    setValue,
    isLoading: query.isLoading,
    isError: query.isError,
    /** True while a `setValue` write is in flight — guards against duplicate concurrent writes. */
    isSaving,
    /** True after a `setValue` write failed — callers must not retry the same patch in a loop. */
    isSaveError,
  }
}
