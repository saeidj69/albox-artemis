import { atomFamily } from 'jotai-family'
import { selectAtom } from 'jotai/utils'

import type { BasketLineKey } from '../types/basket-line'
import { basketLinesAtom } from './basket'

/**
 * One quantity atom per (type, id) line, keyed by `${type}:${id}`. Backs
 * `useBasketEntity` so a single product's add-to-basket button only
 * re-renders when *that* product's quantity changes — adding/removing a
 * different line in the basket doesn't touch it.
 *
 * `atomFamily` caches by key: the same key always returns the same derived
 * atom instance, so repeated calls (e.g. every render) don't create a new
 * subscription each time.
 */
export const basketLineQuantityAtomFamily = atomFamily((key: BasketLineKey) =>
  selectAtom(
    basketLinesAtom,
    (lines) =>
      lines.find(
        (line) =>
          `${line.type}:${line.type === 'product' ? line.productId : line.bundleId}` ===
          key,
      )?.quantity ?? 0,
  ),
)
