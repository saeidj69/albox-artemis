import { CLIENT_STATE_KEYS } from '@/constants/client-state-keys'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '@/utils/test-utils'

import { EXPERIMENTS } from '../constants/experiments'
import { assignVariant } from '../utils/assignVariant'
import { useExperimentsBootstrap } from './useExperimentsBootstrap'

const MOBILE_NUMBER = '09120000000'

const mockUseProfile = vi.fn()
const mockUseClientState = vi.fn()
const mockSetValue = vi.fn()

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => mockUseProfile(),
}))

vi.mock('@/hooks/useClientState', () => ({
  useClientState: (...args: unknown[]) => mockUseClientState(...args),
}))

function naturalKeyFor(
  experiment: (typeof EXPERIMENTS)[keyof typeof EXPERIMENTS],
) {
  return assignVariant(MOBILE_NUMBER, experiment).key
}

describe('useExperimentsBootstrap', () => {
  beforeEach(() => {
    mockSetValue.mockReset()
    mockUseClientState.mockClear()
    mockUseProfile.mockReturnValue({
      data: {
        profile: { mobileNumber: MOBILE_NUMBER, isImpersonating: false },
      },
    })
  })

  it('assigns a variant for an experiment missing from client-state', () => {
    mockUseClientState.mockReturnValue({
      value: {},
      setValue: mockSetValue,
      isLoading: false,
      isSaving: false,
    })

    renderHook(() => useExperimentsBootstrap({ enabled: true }))

    expect(mockSetValue).toHaveBeenCalledTimes(1)
    const updater = mockSetValue.mock.calls[0][0]
    const result = updater({})

    for (const experiment of Object.values(EXPERIMENTS)) {
      expect(result[experiment.id]).toEqual({
        variant: naturalKeyFor(experiment),
        assignedAt: expect.any(Number),
        overridden: false,
      })
    }
  })

  it('rewrites a non-overridden entry whose stored variant has drifted from the natural computation', () => {
    const stored = Object.fromEntries(
      Object.values(EXPERIMENTS).map((experiment) => [
        experiment.id,
        { variant: 'stale-variant-key', assignedAt: 1, overridden: false },
      ]),
    )

    mockUseClientState.mockReturnValue({
      value: stored,
      setValue: mockSetValue,
      isLoading: false,
      isSaving: false,
    })

    renderHook(() => useExperimentsBootstrap({ enabled: true }))

    expect(mockSetValue).toHaveBeenCalledTimes(1)
    const updater = mockSetValue.mock.calls[0][0]
    const result = updater(stored)

    for (const experiment of Object.values(EXPERIMENTS)) {
      expect(result[experiment.id].variant).toBe(naturalKeyFor(experiment))
      expect(result[experiment.id].overridden).toBe(false)
    }
  })

  it('leaves an overridden entry untouched even if it disagrees with the natural computation', () => {
    const stored = Object.fromEntries(
      Object.values(EXPERIMENTS).map((experiment) => [
        experiment.id,
        { variant: 'manually-picked', assignedAt: 1, overridden: true },
      ]),
    )

    mockUseClientState.mockReturnValue({
      value: stored,
      setValue: mockSetValue,
      isLoading: false,
      isSaving: false,
    })

    renderHook(() => useExperimentsBootstrap({ enabled: true }))

    expect(mockSetValue).not.toHaveBeenCalled()
  })

  it('does not write when every non-overridden entry already matches the natural computation', () => {
    const stored = Object.fromEntries(
      Object.values(EXPERIMENTS).map((experiment) => [
        experiment.id,
        {
          variant: naturalKeyFor(experiment),
          assignedAt: 1,
          overridden: false,
        },
      ]),
    )

    mockUseClientState.mockReturnValue({
      value: stored,
      setValue: mockSetValue,
      isLoading: false,
      isSaving: false,
    })

    renderHook(() => useExperimentsBootstrap({ enabled: true }))

    expect(mockSetValue).not.toHaveBeenCalled()
  })

  it('shares experiment client-state with impersonators', () => {
    mockUseClientState.mockReturnValue({
      value: {},
      setValue: mockSetValue,
      isLoading: false,
      isSaving: false,
      isSaveError: false,
    })

    renderHook(() => useExperimentsBootstrap({ enabled: true }))

    expect(mockUseClientState).toHaveBeenCalledWith(
      CLIENT_STATE_KEYS.EXPERIMENTS,
      expect.objectContaining({ shareWithImpersonators: true }),
    )
  })

  it('persists assignments while impersonating', () => {
    mockUseProfile.mockReturnValue({
      data: { profile: { mobileNumber: MOBILE_NUMBER, isImpersonating: true } },
    })
    mockUseClientState.mockReturnValue({
      value: {},
      setValue: mockSetValue,
      isLoading: false,
      isSaving: false,
      isSaveError: false,
    })

    renderHook(() => useExperimentsBootstrap({ enabled: true }))

    expect(mockSetValue).toHaveBeenCalledTimes(1)
  })

  it('does not retry a write after a previous save failed', () => {
    mockUseClientState.mockReturnValue({
      value: {},
      setValue: mockSetValue,
      isLoading: false,
      isSaving: false,
      isSaveError: true,
    })

    renderHook(() => useExperimentsBootstrap({ enabled: true }))

    expect(mockSetValue).not.toHaveBeenCalled()
  })
})
