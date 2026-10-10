'use client'

import { useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'

import { useProfile } from '@/api/functions/profile'

type UseSentryUserInitOptions = {
  /** Gate until auth/profile is ready — e.g. `enabled: !!profile`. */
  enabled?: boolean
}

/**
 * Tags Sentry events with the logged-in user's internal ID only — no phone
 * number, name, or other PII.
 */
export function useSentryUserInit(options?: UseSentryUserInitOptions): void {
  const { enabled = false } = options ?? {}
  const { data: profileData } = useProfile()
  const userId = profileData?.profile?.id

  useEffect(() => {
    if (!enabled || !userId) return

    Sentry.setUser({ id: String(userId) })

    return () => {
      Sentry.setUser(null)
    }
  }, [enabled, userId])
}
