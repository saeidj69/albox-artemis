import { atom } from 'jotai'

import type { CheckBasket200 } from '@/api/models'

/** Last successful check-basket response. Survives in-flight re-checks. */
export const basketCheckSnapshotAtom = atom<CheckBasket200 | null>(null)

/** Shared in-flight flag for check-basket — readable from any consumer. */
export const basketCheckLoadingAtom = atom(false)
