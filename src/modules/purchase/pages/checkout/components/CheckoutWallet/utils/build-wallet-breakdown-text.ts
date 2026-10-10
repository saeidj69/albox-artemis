type WalletBreakdownTextInput = {
  giftAmount: number
  chargeAmount: number
  barookAmount: number
}

type WalletBreakdownItem = {
  amount: number
  title: string
}

/**
 * Builds the secondary wallet line, e.g. `۱٬۰۰۰ هدیه + ۲٬۰۰۰ شارژ کیف پول`.
 * Returns `null` when both amounts are zero.
 */
export const buildWalletBreakdownText = (
  param: WalletBreakdownTextInput,
): WalletBreakdownItem[] => {
  const { giftAmount, chargeAmount, barookAmount } = param

  const parts: WalletBreakdownItem[] = []

  if (barookAmount > 0) {
    parts.push({
      amount: barookAmount,
      title: 'کیف پول‌ باروک',
    })
  }

  if (giftAmount > 0) {
    parts.push({
      amount: giftAmount,
      title: 'هدیه',
    })
  }

  if (chargeAmount > 0) {
    parts.push({
      amount: chargeAmount,
      title: 'شارژ کیف پول',
    })
  }

  return parts
}
