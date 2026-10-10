import { getBasketLineKey } from '../types'
import type { BasketLine } from '../types'

/**
 * Resolves two versions of the basket (e.g. local vs. server on a 409, or
 * local vs. server on login) into one. Union by (type, id), keeping the
 * higher quantity — avoids double-counting when the same line exists on
 * both sides (e.g. added on two devices) while never dropping a line only
 * one side has. Snapshot fields (`title`/`priceWhenAdded`) are taken from
 * whichever side's line is newer (`addedAt`).
 */
export function mergeBasketLines(
  local: BasketLine[],
  remote: BasketLine[],
): BasketLine[] {
  const merged = new Map<string, BasketLine>()

  for (const line of local) {
    merged.set(getBasketLineKey(line), line)
  }

  for (const line of remote) {
    const key = getBasketLineKey(line)
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, line)
      continue
    }

    const newer = line.addedAt > existing.addedAt ? line : existing
    merged.set(key, {
      ...newer,
      quantity: Math.max(existing.quantity, line.quantity),
    })
  }

  return Array.from(merged.values())
}
