import { ERROR_CODES } from '@/constants/payment'
import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { describe, expect, it } from 'vitest'

import type { PaymentBarookWalletDetails } from '@/api/models'

import { getBarookOptionState } from './get-barook-option-state'

const wallet = (
  overrides: Partial<PaymentBarookWalletDetails> = {},
): PaymentBarookWalletDetails => ({
  enabled: true,
  balance: 200_000_000,
  commissionPercentage: 1,
  maxAffordablePrincipal: 1000,
  remote: {
    expendableCreditAmount: 1,
    balanceDate: null,
    isUserBlocked: false,
  },
  ...overrides,
})

const axiosError = (args: { status?: number; code?: number }) =>
  new AxiosError(
    'request failed',
    undefined,
    {} as InternalAxiosRequestConfig,
    undefined,
    {
      status: args.status ?? 500,
      data: args.code != null ? { code: args.code } : {},
      headers: {},
      statusText: '',
      config: {} as InternalAxiosRequestConfig,
    } as AxiosResponse,
  )

describe('getBarookOptionState', () => {
  it('returns loading while the wallet query is in flight', () => {
    expect(getBarookOptionState({ isLoading: true })).toBe('loading')
  })

  it('returns unknown for 5024 before discover, inactive after', () => {
    const walletNotFound = {
      isLoading: false,
      error: axiosError({
        status: 404,
        code: ERROR_CODES.BAROOK_WALLET_NOT_FOUND,
      }),
    }

    expect(getBarookOptionState(walletNotFound)).toBe('unknown')
    expect(
      getBarookOptionState({ ...walletNotFound, discoverAttempted: true }),
    ).toBe('inactive')
  })

  it('returns inactive for 5025', () => {
    expect(
      getBarookOptionState({
        isLoading: false,
        error: axiosError({
          status: 422,
          code: ERROR_CODES.BAROOK_WALLET_DISABLED,
        }),
      }),
    ).toBe('inactive')
  })

  it('returns providerError for 5029, 5030, and network failures', () => {
    expect(
      getBarookOptionState({
        isLoading: false,
        error: axiosError({
          status: 502,
          code: ERROR_CODES.BAROOK_PROVIDER_REQUEST_FAILED,
        }),
      }),
    ).toBe('providerError')

    expect(
      getBarookOptionState({
        isLoading: false,
        error: axiosError({
          status: 503,
          code: ERROR_CODES.BAROOK_PROVIDER_UNAVAILABLE,
        }),
      }),
    ).toBe('providerError')

    expect(
      getBarookOptionState({
        isLoading: false,
        error: new Error('network'),
      }),
    ).toBe('providerError')
  })

  it('returns rateLimited for HTTP 429', () => {
    expect(
      getBarookOptionState({
        isLoading: false,
        error: axiosError({ status: 429 }),
      }),
    ).toBe('rateLimited')
  })

  it('returns inactive when the wallet is disabled', () => {
    expect(
      getBarookOptionState({
        isLoading: false,
        wallet: wallet({ enabled: false }),
      }),
    ).toBe('inactive')
  })

  it('returns unknown when credit is missing before discover, inactive after', () => {
    expect(getBarookOptionState({ isLoading: false })).toBe('unknown')
    expect(
      getBarookOptionState({ isLoading: false, discoverAttempted: true }),
    ).toBe('inactive')

    expect(
      getBarookOptionState({
        isLoading: false,
        wallet: wallet({ remote: null }),
      }),
    ).toBe('unknown')
    expect(
      getBarookOptionState({
        isLoading: false,
        wallet: wallet({ remote: null }),
        discoverAttempted: true,
      }),
    ).toBe('inactive')
  })

  it('returns active when the wallet is enabled and remote credit exists', () => {
    expect(
      getBarookOptionState({
        isLoading: false,
        wallet: wallet(),
      }),
    ).toBe('active')
  })

  it('prefers error overlay over a successful wallet payload', () => {
    expect(
      getBarookOptionState({
        isLoading: false,
        wallet: wallet(),
        error: axiosError({
          status: 503,
          code: ERROR_CODES.BAROOK_PROVIDER_UNAVAILABLE,
        }),
      }),
    ).toBe('providerError')
  })
})
