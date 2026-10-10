'use client'

import { useRef } from 'react'

import { usePathname } from 'next/navigation'

import type { CashbackBadgeHandle } from '@/components/CashbackBadge/types'

let claim: { pathname: string; claimed: boolean } | null = null

function claimPageCashbackPreview(pathname: string): boolean {
  if (claim?.pathname !== pathname) claim = { pathname, claimed: false }
  if (claim.claimed) return false
  claim.claimed = true
  return true
}

// Test-only: resets module-level claim state between test cases.
export function resetCashbackPreviewClaimForTests() {
  claim = null
}

export function useCashbackPreview(eligible: boolean) {
  const pathname = usePathname()
  const ref = useRef<CashbackBadgeHandle>(null)
  const alreadyClaimed =
    eligible && claim?.pathname === pathname && claim.claimed

  const onVisible = (inView: boolean) => {
    if (!inView || !eligible) return
    if (!claimPageCashbackPreview(pathname)) return
    ref.current?.expand()
  }

  return {
    ref,
    onVisible,
    needsVisibility: eligible && !alreadyClaimed,
  }
}
