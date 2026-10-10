import { getBasketLineKey } from '../types'
import type { AddBasketLineInput, BasketLine, BasketLineKey } from '../types'

/**
 * Pure list operations shared by `useBasket` (whole-basket access) and
 * `useBasketEntity` (single-line access), so both hooks mutate
 * `basketLinesAtom` through the same logic instead of duplicating it.
 */

/**
 * Adds a line, or bumps quantity if a line with the same `(type, id)`
 * already exists — never produces duplicate lines for the same entity.
 */
export function addLineToList(
  lines: BasketLine[],
  input: AddBasketLineInput,
): BasketLine[] {
  const key = getBasketLineKey(input)
  const existing = lines.find((line) => getBasketLineKey(line) === key)

  if (existing) {
    return lines.map((line) =>
      getBasketLineKey(line) === key
        ? {
            ...line,
            quantity: line.quantity + input.quantity,
            priceWhenAdded: input.priceWhenAdded,
            title: input.title,
          }
        : line,
    )
  }

  return [...lines, { ...input, addedAt: Date.now() } as BasketLine]
}

/** Removes the line matching `key`, if any. */
export function removeLineFromList(
  lines: BasketLine[],
  key: BasketLineKey,
): BasketLine[] {
  return lines.filter((line) => getBasketLineKey(line) !== key)
}

/**
 * Sets the quantity of the line matching `key`. A quantity of 0 or below
 * removes the line rather than leaving a zero-quantity entry behind.
 */
export function setQuantityInList(
  lines: BasketLine[],
  key: BasketLineKey,
  quantity: number,
): BasketLine[] {
  if (quantity <= 0) return removeLineFromList(lines, key)

  return lines.map((line) =>
    getBasketLineKey(line) === key ? { ...line, quantity } : line,
  )
}
