'use client'

import { useCallback, useEffect } from 'react'

import { useAtom } from 'jotai'

import {
  tempAddressDraftAtom,
  type TempAddressDraft,
} from '@/modules/addresses/atoms/temp-address-draft'
import type { AddressFormValues } from '@/modules/addresses/validation/address-form-schema'

type CreateDraftScope = { mode: 'create' }
type EditDraftScope = { mode: 'edit'; addressId: number }

export type TempAddressDraftScope = CreateDraftScope | EditDraftScope

const matchesScope = (
  draft: TempAddressDraft | null,
  scope: TempAddressDraftScope,
): draft is TempAddressDraft => {
  if (!draft) return false

  if (scope.mode === 'create') {
    return draft.mode === 'create'
  }

  return draft.mode === 'edit' && draft.addressId === scope.addressId
}

export const useTempAddressDraft = (scope: TempAddressDraftScope) => {
  const [draft, setDraft] = useAtom(tempAddressDraftAtom)

  useEffect(() => {
    if (draft && !matchesScope(draft, scope)) {
      setDraft(null)
    }
  }, [draft, scope, setDraft])

  const draftValues = matchesScope(draft, scope) ? draft.values : null

  const persistDraft = useCallback(
    (values: AddressFormValues) => {
      if (scope.mode === 'create') {
        setDraft({ mode: 'create', values })
        return
      }

      setDraft({ mode: 'edit', addressId: scope.addressId, values })
    },
    [scope, setDraft],
  )

  const clearDraft = useCallback(() => {
    setDraft(null)
  }, [setDraft])

  return { draftValues, persistDraft, clearDraft }
}
