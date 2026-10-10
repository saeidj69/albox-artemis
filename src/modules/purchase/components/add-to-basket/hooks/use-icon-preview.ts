/* eslint-disable react-hooks/refs */
'use client'

import { useEffect, useRef, useState } from 'react'

export const ICON_PREVIEW_INITIAL_DELAY_MS = 500
export const ICON_PREVIEW_DURATION_MS = 5000

type PreviewPhase = 'idle' | 'expanded' | 'done'

type UseIconPreviewOptions = {
  enabled: boolean
  onComplete?: () => void
}

export function useIconPreview(options: UseIconPreviewOptions) {
  const { enabled, onComplete } = options
  const [prevEnabled, setPrevEnabled] = useState(enabled)
  const [phase, setPhase] = useState<PreviewPhase>('idle')

  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled)
    setPhase('idle')
  }

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Reset during render (not in an effect) whenever `enabled` changes —
  // React's documented pattern for adjusting state on prop change, avoids
  // a synchronous setState inside an effect body. Covers both directions:
  // turning off mid-cycle, and starting a fresh cycle on re-enable.
  const prevEnabledRef = useRef(enabled)
  if (prevEnabledRef.current !== enabled) {
    prevEnabledRef.current = enabled
    if (phase !== 'idle') {
      setPhase('idle')
    }
  }

  useEffect(() => {
    if (!enabled) return

    const expandTimer = window.setTimeout(() => {
      setPhase('expanded')
    }, ICON_PREVIEW_INITIAL_DELAY_MS)

    const completeTimer = window.setTimeout(() => {
      setPhase('done')
      onCompleteRef.current?.()
    }, ICON_PREVIEW_INITIAL_DELAY_MS + ICON_PREVIEW_DURATION_MS)

    return () => {
      window.clearTimeout(expandTimer)
      window.clearTimeout(completeTimer)
    }
  }, [enabled])

  return {
    isExpanded: phase === 'expanded',
    showLabel: phase === 'expanded',
    isAnimating: enabled && phase !== 'done',
  }
}
