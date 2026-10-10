'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useMediaMatch } from 'rooks'

import {
  CASHBACK_PREVIEW_DURATION_MS,
  CASHBACK_PREVIEW_INITIAL_DELAY_MS,
} from '../constants'
import type { CashbackBadgeHandle } from '../types'

export function useCashbackBadgeExpand(alwaysExpanded: boolean): {
  collapsed: boolean
  handle: CashbackBadgeHandle
} {
  const prefersReducedMotion = useMediaMatch('(prefers-reduced-motion: reduce)')
  const [collapsed, setCollapsed] = useState(!alwaysExpanded)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer)
    timersRef.current = []
  }, [])

  const expand = useCallback(() => {
    if (alwaysExpanded) return

    clearTimers()

    // Reduced motion removes the animation, not the message: the label appears
    // at once (CSS already drops the transition) and still collapses on time.
    if (prefersReducedMotion) {
      setCollapsed(false)
      timersRef.current = [
        window.setTimeout(
          () => setCollapsed(true),
          CASHBACK_PREVIEW_DURATION_MS,
        ),
      ]
      return
    }

    timersRef.current = [
      window.setTimeout(
        () => setCollapsed(false),
        CASHBACK_PREVIEW_INITIAL_DELAY_MS,
      ),
      window.setTimeout(
        () => setCollapsed(true),
        CASHBACK_PREVIEW_INITIAL_DELAY_MS + CASHBACK_PREVIEW_DURATION_MS,
      ),
    ]
  }, [alwaysExpanded, prefersReducedMotion, clearTimers])

  const collapse = useCallback(() => {
    clearTimers()
    setCollapsed(true)
  }, [clearTimers])

  const handle = useMemo<CashbackBadgeHandle>(
    () => ({ expand, collapse }),
    [expand, collapse],
  )

  useEffect(() => clearTimers, [clearTimers])

  // A preference flip mid-preview needs no special handling: the pending
  // timers keep the same schedule and the CSS transition is what drops out.

  return { collapsed: alwaysExpanded ? false : collapsed, handle }
}
