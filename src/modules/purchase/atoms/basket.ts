import { STORAGE_KEYS } from '@/constants'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { BasketLine } from '../types/basket-line'

/**
 * Root basket state — the full list of lines, persisted to localStorage.
 * Single source of truth for basket contents. Written only through
 * `useBasket`/`useBasketEntity`, never set directly by UI components.
 */
export const basketLinesAtom = atomWithStorage<BasketLine[]>(
  STORAGE_KEYS.CART_V3,
  [],
)

/**
 * Distinct line count, e.g. a nav/cart badge ("3 items"). Derived, never
 * stored separately — reading it doesn't re-render on quantity-only
 * changes that don't add/remove a line.
 */
export const basketLineCountAtom = atom((get) => get(basketLinesAtom).length)

/**
 * Sum of `quantity` across all lines, e.g. a footer total. Derived —
 * changes whenever any line's quantity changes, but not on snapshot-only
 * edits (`title`/`priceWhenAdded`) that don't affect quantity.
 */
export const basketTotalQuantityAtom = atom((get) =>
  get(basketLinesAtom).reduce((total, line) => total + line.quantity, 0),
)
