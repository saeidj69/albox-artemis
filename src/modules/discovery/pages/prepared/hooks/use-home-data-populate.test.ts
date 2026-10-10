import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import type { PreparedHydratedRow } from '../types'
import {
  NMV_ROW_TRACKING_ID,
  SURENA_ROW_TRACKING_ID,
} from '../utils/tracking-ids'
import { useHomeDataPopulate } from './use-home-data-populate'

const profileState: { data?: { profile?: { surenaCode?: string | null } } } = {}
const nmvState = { show: false }

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => profileState,
}))

vi.mock('./use-home-nmv-campaign', () => ({
  useHomeNmvCampaign: () => nmvState,
}))

const apiRows = [
  { trackingId: 'row-2', position: 2, style: {}, columns: [] },
  { trackingId: 'row-0', position: 0, style: {}, columns: [] },
] as PreparedHydratedRow[]

describe('useHomeDataPopulate', () => {
  beforeEach(() => {
    profileState.data = undefined
    nmvState.show = false
  })

  test('pins the NMV card directly under Surena, then the builder rows', () => {
    profileState.data = { profile: { surenaCode: '  code  ' } }
    nmvState.show = true

    const { result } = renderHook(() => useHomeDataPopulate(apiRows))

    expect(result.current.map((row) => row.trackingId)).toEqual([
      SURENA_ROW_TRACKING_ID,
      NMV_ROW_TRACKING_ID,
      'row-0',
      'row-2',
    ])
    expect(result.current[0]?.columns[0]?.widget).toEqual({
      type: 'SURENA',
      surenaCode: 'code',
    })
    expect(result.current[1]?.columns[0]?.widget).toEqual({ type: 'NMV' })
  })

  test('pins NMV at the top when the profile has no Surena code', () => {
    nmvState.show = true

    const { result } = renderHook(() => useHomeDataPopulate(apiRows))

    expect(result.current.map((row) => row.trackingId)).toEqual([
      NMV_ROW_TRACKING_ID,
      'row-0',
      'row-2',
    ])
  })

  test('leaves builder rows untouched when NMV has nothing to show', () => {
    profileState.data = { profile: { surenaCode: '' } }

    const { result } = renderHook(() => useHomeDataPopulate(apiRows))

    expect(result.current.map((row) => row.trackingId)).toEqual([
      'row-0',
      'row-2',
    ])
  })

  test('skips client rows when populate is disabled', () => {
    profileState.data = { profile: { surenaCode: 'code' } }
    nmvState.show = true

    const { result } = renderHook(() =>
      useHomeDataPopulate(apiRows, { enabled: false }),
    )

    expect(result.current.map((row) => row.trackingId)).toEqual([
      'row-2',
      'row-0',
    ])
  })
})
