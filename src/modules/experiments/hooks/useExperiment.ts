'use client'

import { useMemo } from 'react'

import { CLIENT_STATE_KEYS } from '@/constants/client-state-keys'
import { useClientState } from '@/hooks/useClientState'

import { useProfile } from '@/api/functions/profile'

import { ExperimentConfig, Variant } from '../types'
import { assignVariant } from '../utils/assignVariant'

/**
 * Returns the caller's variant for `experiment`. Prefers a stored assignment
 * from `client-state` (set by `useExperimentsBootstrap`, or manually from the
 * debug page) when its variant key still matches one of `experiment.variants`
 * — this is what lets a manual override actually take effect. Falls back to
 * computing the assignment locally (pure hash of `mobileNumber + experiment.id`)
 * when nothing is stored yet or the stored key is stale, so the caller always
 * gets an answer without waiting on the network.
 */
export function useExperiment<TKey extends string, TPayload>(
  experiment: ExperimentConfig<TKey, TPayload>,
): Variant<TKey, TPayload> | null {
  const { data: profile } = useProfile()
  const { value: stored } = useClientState(CLIENT_STATE_KEYS.EXPERIMENTS, {
    enabled: !!profile,
    shareWithImpersonators: true,
  })

  return useMemo(() => {
    if (!profile) return null

    const storedVariantKey = stored?.[experiment.id]?.variant
    const storedVariant = experiment.variants.find(
      (variant) => variant.key === storedVariantKey,
    )

    return (
      storedVariant ?? assignVariant(profile.profile.mobileNumber, experiment)
    )
  }, [profile, experiment, stored])
}
