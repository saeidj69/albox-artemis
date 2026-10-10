'use client'

import { useCallback } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'

import { basketLineQuantityAtomFamily, basketLinesAtom } from '../atoms'
import type { AddBasketLineInput, BasketLine, BasketLineKey } from '../types'
import { addLineToList, removeLineFromList, setQuantityInList } from '../utils'

type AddInput = Omit<AddBasketLineInput, 'type' | 'productId' | 'bundleId'>

/**
 * Single-entity access: this line's quantity plus add/remove/setQuantity
 * scoped to it. Only re-renders when this specific (type, id) line's
 * quantity changes — unrelated basket edits don't touch it.
 */
export function useBasketEntity(type: BasketLine['type'], id: number) {
  const key: BasketLineKey = `${type}:${id}`
  const quantity = useAtomValue(basketLineQuantityAtomFamily(key))
  const setLines = useSetAtom(basketLinesAtom)

  const add = useCallback(
    (input: AddInput) => {
      const line = {
        ...input,
        type,
        ...(type === 'product' ? { productId: id } : { bundleId: id }),
      } as AddBasketLineInput

      setLines((prev) => addLineToList(prev, line))
    },
    [setLines, type, id],
  )

  const remove = useCallback(() => {
    setLines((prev) => removeLineFromList(prev, key))
    basketLineQuantityAtomFamily.remove(key)
  }, [setLines, key])

  const setQuantity = useCallback(
    (quantity: number) => {
      setLines((prev) => setQuantityInList(prev, key, quantity))
      if (quantity <= 0) {
        basketLineQuantityAtomFamily.remove(key)
      }
    },
    [setLines, key],
  )

  return { quantity, add, remove, setQuantity }
}
