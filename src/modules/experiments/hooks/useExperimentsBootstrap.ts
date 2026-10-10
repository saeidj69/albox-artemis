'use client'

import { useEffect } from 'react'

import { CLIENT_STATE_KEYS } from '@/constants/client-state-keys'
import { useClientState } from '@/hooks/useClientState'

import { useProfile } from '@/api/functions/profile'

import { EXPERIMENTS } from '../constants/experiments'
import { assignVariant } from '../utils/assignVariant'

type UseExperimentsBootstrapOptions = {
  /** Only run once the caller is ready — e.g. gate on authentication. */
  enabled?: boolean
}

/**
 * Persists a record of every active experiment's assignment to client-state.
 * On every load, recomputes the natural (hash-based) variant for each
 * experiment and rewrites any entry that's missing or has drifted from that
 * natural variant — so weight changes in `EXPERIMENTS` take effect for
 * everyone on their next load. Entries with `overridden: true` (set via the
 * debug page) are left untouched; manual overrides always win over recompute.
 *
 * Writes set `shareWithImpersonators` so impersonated sessions can persist
 * the same assignments. A failed write is not retried — otherwise a 403
 * (e.g. readonly impersonation) would loop for as long as the page stays
 * mounted.
 */
export function useExperimentsBootstrap(
  options?: UseExperimentsBootstrapOptions,
) {
  const { enabled = false } = options ?? {}

  const { data: profile } = useProfile()
  const { value, setValue, isLoading, isSaving, isSaveError } = useClientState(
    CLIENT_STATE_KEYS.EXPERIMENTS,
    {
      enabled,
      shareWithImpersonators: true,
    },
  )

  useEffect(() => {
    if (!enabled || !profile || isLoading || isSaving || isSaveError) return

    const stored = value ?? {}
    const assignedAt = Date.now()
    const patch = Object.fromEntries(
      Object.values(EXPERIMENTS).flatMap((experiment) => {
        const entry = stored[experiment.id]
        if (entry?.overridden) return []

        const natural = assignVariant(
          profile.profile.mobileNumber,
          experiment,
        ).key
        if (entry?.variant === natural) return []

        return [
          [experiment.id, { variant: natural, assignedAt, overridden: false }],
        ]
      }),
    )

    if (Object.keys(patch).length === 0) return

    setValue((prev) => ({ ...(prev ?? {}), ...patch }))
  }, [enabled, profile, isLoading, isSaving, isSaveError, value, setValue])
}
