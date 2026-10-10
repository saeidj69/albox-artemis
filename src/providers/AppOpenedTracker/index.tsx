'use client'

import { useEffect } from 'react'

import { track, EVENTS } from '@/helpers/analytics'

export function AppOpenedTracker() {
  useEffect(() => {
    track(EVENTS.APP_OPENED, { plausible: true })
  }, [])

  return null
}
