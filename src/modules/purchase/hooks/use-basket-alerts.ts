'use client'

import { useCallback, useMemo } from 'react'

import type { ProductBasketLine } from '@/modules/purchase/types'

import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import type {
  OrderNotFoundBasketProduct,
  OrderNotOkBasketProduct,
  OrderOkBasketProduct,
} from '@/api/models'

import { useBasket } from './use-basket'
import { useBasketCheckCall } from './use-basket-check-call'

export type BasketCheckProduct =
  | OrderOkBasketProduct
  | OrderNotOkBasketProduct
  | OrderNotFoundBasketProduct

export type ProductAlert = {
  text: string
  severity: 'error' | 'warning' | 'success'
}

export type ProductIssueKind =
  | 'not_purchasable'
  | 'out_of_stock'
  | 'quantity_cap'
  | 'price_change'
  | null

type ProductAlertsResult = {
  alerts: ProductAlert[]
  issueKind: ProductIssueKind
  proposedChange: ProductBasketLine | null
}

const PRICE_UP = (amountToman: string) =>
  `قیمت این محصول ${amountToman} تومان افزایش یافت.`

const PRICE_DOWN = (amountToman: string) =>
  `قیمت این محصول ${amountToman} تومان کاهش یافت.`

const QTY_CAP = (max: number) =>
  `تعداد قابل خرید این محصول برای شما ${persianDigits(max)} کارتن است.`

/**
 * Mirrors checkout `useBasketLines` message rules for a single check
 * product + local basket line pair.
 */
function buildProductAlerts(
  product: BasketCheckProduct,
  localProduct: ProductBasketLine,
): ProductAlertsResult {
  const alerts: ProductAlert[] = []
  let issueKind: ProductIssueKind = null
  let proposedChange: ProductBasketLine | null = null

  if (product.status === 'not_found') {
    return {
      alerts: [
        {
          text: 'این محصول به صورت خودکار از سبد خرید شما حذف می‌شود.',
          severity: 'error',
        },
      ],
      issueKind: 'not_purchasable',
      proposedChange: null,
    }
  }

  const { details } = product

  if (!details) return { alerts, issueKind, proposedChange }

  const apiPrice = details.netPrice ?? 0

  if (
    apiPrice > 0 &&
    localProduct.priceWhenAdded > 0 &&
    apiPrice !== localProduct.priceWhenAdded
  ) {
    const diff = Math.abs(toTomanPrice(apiPrice - localProduct.priceWhenAdded))

    const isCheaper = apiPrice < localProduct.priceWhenAdded

    if (diff === 0) {
      return { alerts, issueKind, proposedChange }
    }

    alerts.push({
      text: isCheaper
        ? PRICE_DOWN(formatPrice(diff))
        : PRICE_UP(formatPrice(diff)),
      severity: isCheaper ? 'success' : 'warning',
    })
    issueKind = 'price_change'
  }

  if (product.status === 'error') {
    const maxQty = details?.maxPurchaseQuantity ?? 0

    if (maxQty === 0) {
      return {
        alerts: [
          {
            text: 'این محصول به صورت خودکار از سبد خرید شما حذف می‌شود.',
            severity: 'error',
          },
        ],
        issueKind: 'out_of_stock',
        proposedChange: null,
      }
    }

    if (localProduct.quantity > maxQty) {
      alerts.push({ text: QTY_CAP(maxQty), severity: 'warning' })
      issueKind = 'quantity_cap'
      proposedChange = { ...localProduct, quantity: maxQty }
    }
  }

  if (Array.isArray(product.errorMessages)) {
    for (const msg of product.errorMessages) {
      if (typeof msg === 'string' && msg.length > 0) {
        alerts.push({ text: msg, severity: 'error' })
      }
    }
  }

  return { alerts, issueKind, proposedChange }
}

/**
 * Joins the latest basket-check snapshot with local basket lines and
 * derives per-product alerts, issue kinds, and proposed fixes. Single
 * source of truth for basket alert data — consumed by both the
 * per-product alert list and the top-level basket banner.
 */
export function useBasketAlerts() {
  const { data } = useBasketCheckCall()
  const { productLines, setQuantity, remove } = useBasket()

  const items = useMemo(() => {
    const result =
      data?.basket?.products.flatMap((product) => {
        const localProduct = productLines.find(
          (line) => line.productId === product.productId,
        )
        if (!localProduct) return []

        const { alerts, issueKind, proposedChange } = buildProductAlerts(
          product,
          localProduct,
        )

        return [{ product, localProduct, alerts, issueKind, proposedChange }]
      }) ?? []

    // Sort so that items with at least one alert come first
    return result.sort((a, b) => {
      const aHasAlert = a.alerts.length > 0 ? 1 : 0
      const bHasAlert = b.alerts.length > 0 ? 1 : 0
      return bHasAlert - aHasAlert // b first if has alert
    })
  }, [data, productLines])

  const hasError = items.some((item) =>
    item.alerts.some((alert) => alert.severity === 'error'),
  )

  /**
   * Applies every item's proposed fix: capped quantity via setQuantity,
   * or remove for unfixable kinds (not_purchasable / out_of_stock).
   * Price-change-only items have no proposedChange and are skipped.
   */
  const applyProposedChanges = useCallback(() => {
    for (const item of items) {
      if (item.proposedChange) {
        setQuantity(
          'product',
          item.proposedChange.productId,
          item.proposedChange.quantity,
        )
        continue
      }

      if (
        item.issueKind === 'not_purchasable' ||
        item.issueKind === 'out_of_stock'
      ) {
        remove('product', item.localProduct.productId)
      }
    }
  }, [items, setQuantity, remove])

  return { items, hasError, applyProposedChanges }
}
