'use client'

import { useCallback, useMemo } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'

import {
  basketLineCountAtom,
  basketLinesAtom,
  basketTotalQuantityAtom,
} from '../atoms'
import type { AddBasketLineInput, BasketLine, BasketLineKey } from '../types'
import { addLineToList, removeLineFromList, setQuantityInList } from '../utils'

/**
 * Whole-basket access: the full line list, aggregate counts, and
 * mutations that operate on any (type, id) line. For a single line's own
 * quantity/add/remove without pulling in the whole list, use
 * `useBasketEntity` instead.
 */
export function useBasket() {
  const lines = useAtomValue(basketLinesAtom)
  const count = useAtomValue(basketLineCountAtom)
  const totalQuantity = useAtomValue(basketTotalQuantityAtom)
  const setLines = useSetAtom(basketLinesAtom)

  const add = useCallback(
    (input: AddBasketLineInput) => {
      setLines((prev) => addLineToList(prev, input))
    },
    [setLines],
  )

  const remove = useCallback(
    (type: BasketLine['type'], id: number) => {
      const key: BasketLineKey = `${type}:${id}`
      setLines((prev) => removeLineFromList(prev, key))
    },
    [setLines],
  )

  const setQuantity = useCallback(
    (type: BasketLine['type'], id: number, quantity: number) => {
      const key: BasketLineKey = `${type}:${id}`
      setLines((prev) => setQuantityInList(prev, key, quantity))
    },
    [setLines],
  )

  const clear = useCallback(() => setLines([]), [setLines])

  const productLines = useMemo(
    () => lines.filter((item) => item.type === 'product'),
    [lines],
  )

  return {
    lines,
    count,
    totalQuantity,
    add,
    remove,
    setQuantity,
    clear,
    productLines,
  }
}
