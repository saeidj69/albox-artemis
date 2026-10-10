'use client'

import { useEffect } from 'react'

import { identifyAnalyticsUser } from '@/helpers/analytics'

import { useProfile } from '@/api/functions/profile'

type UseAnalyticsAuthInitOptions = {
  /** Gate until auth/profile is ready — e.g. `enabled: !!profile`. */
  enabled?: boolean
}

/**
 * Re-binds the logged-in user to WebEngage, Clarity, and GTM whenever the
 * protected session has a profile. Covers cold start / refresh where OTP
 * login tracking never re-runs.
 */
export function useAnalyticsAuthInit(
  options?: UseAnalyticsAuthInitOptions,
): void {
  const { enabled = false } = options ?? {}
  const { data: profileData } = useProfile()
  const user = profileData?.profile

  useEffect(() => {
    if (!enabled || !user?.id) return

    identifyAnalyticsUser({
      id: user.id,
      mobileNumber: user.mobileNumber,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  }, [enabled, user?.id, user?.mobileNumber, user?.firstName, user?.lastName])
}
