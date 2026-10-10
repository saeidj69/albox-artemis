'use client'

import { useCallback, useRef } from 'react'

import type { TutorialVideoPlayerHandle } from '@/modules/tutorial/pages/tutorial/components/tutorialVideoPlayer'

export function useVideoFullscreen() {
  const playerRef = useRef<TutorialVideoPlayerHandle>(null)

  const enterFullscreen = useCallback(() => {
    playerRef.current?.requestFullscreen()
  }, [])

  return { playerRef, enterFullscreen }
}
