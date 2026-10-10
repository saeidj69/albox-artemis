type BaseBasketLine = {
  quantity: number
  /** Snapshot at add-time, for removed/not-found alerts. Never live truth. */
  title: string
  /** Snapshot at add-time, display-only. Never used for totals/checkout. */
  priceWhenAdded: number
  addedAt: number
}

/** A basket line for a regular product, identified by `productId`. */
export type ProductBasketLine = BaseBasketLine & {
  type: 'product'
  productId: number
}

/**
 * A basket line for a bundle entity, identified by `bundleId`. No real
 * add-to-basket entry point exists yet — this exists so mapping/rendering/
 * merge code is proven polymorphic on `type` now, not bolted on later.
 */
export type BundleBasketLine = BaseBasketLine & {
  type: 'bundle'
  bundleId: number
}

/**
 * A single line in the basket. Discriminated union on `type` — add a new
 * entity kind by adding a member here, not by branching existing code on
 * an `if (type === 'product')`.
 */
export type BasketLine = ProductBasketLine | BundleBasketLine

/**
 * Shape callers pass to `add`/`addLine` — a `BasketLine` minus `addedAt`,
 * which mutation code stamps itself so callers never fabricate a
 * timestamp.
 */
export type AddBasketLineInput =
  | Omit<ProductBasketLine, 'addedAt'>
  | Omit<BundleBasketLine, 'addedAt'>

/** Identifies a line independent of its entity type, e.g. `product:123`. */
export type BasketLineKey = `${BasketLine['type']}:${number}`

function getLineId(line: BasketLine | AddBasketLineInput): number {
  return line.type === 'product' ? line.productId : line.bundleId
}

/**
 * Single place that knows how to identify a basket line. Used everywhere
 * lines need to be matched/deduped instead of ad-hoc `productId`
 * comparisons at call sites.
 */
export function getBasketLineKey(
  line: BasketLine | AddBasketLineInput,
): BasketLineKey {
  return `${line.type}:${getLineId(line)}`
}
