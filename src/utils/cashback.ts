export function parseCashbackPercent(
  raw: string | null | undefined,
): number | undefined {
  if (raw == null || raw.trim() === '') {
    return undefined
  }

  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) {
    return undefined
  }

  return value
}

export function getEnvCashbackPercent(): number | undefined {
  return parseCashbackPercent(process.env.CASHBACK_PERCENT)
}

export function calculateCashbackAmount(
  unitDiscountedPrice: number,
  cashbackPercent: number | null | undefined,
) {
  if (cashbackPercent == null || cashbackPercent <= 0) {
    return null
  }

  return Math.round((unitDiscountedPrice * cashbackPercent) / 100)
}

export function selectCashbackPercent(
  isAvailable: boolean,
  cashbackPercent: number | null | undefined,
) {
  if (isAvailable && cashbackPercent != null && cashbackPercent > 0) {
    return cashbackPercent
  }

  return undefined
}
