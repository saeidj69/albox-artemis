import {
  BAROOK_AMOUNT_MODE,
  BAROOK_VALIDATION_MESSAGE,
  ERROR_CODES,
  MIN_IPG_TOMAN,
  PAYMENT_REFERENCE_ENTITY,
} from '@/constants'
import { EVENTS } from '@/helpers/analytics'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { formatPrice, persianDigits } from '@/utils/numbers'
import { fireEvent, render, screen } from '@/utils/test-utils'

import type { PaymentBarookInitiationResult } from '@/api/models'

import { BAROOK_PAGE_COPY } from './constants'
import BarookCalculatorPage from './index'
import {
  largestAffordablePrincipal,
  rialToTomanTrunc,
  tomanToRial,
} from './utils/calculator'

const ORDER_ID = 42
const RATE = 5
const ORDER_TOMAN = 900_000_000
const WALLET_TOMAN = 210_000_000
const WALLET_PRINCIPAL_TOMAN = 200_000_000
const CREDIT_TOMAN = 850_000_000
const REMAINING_AFTER_WALLET_TOMAN = ORDER_TOMAN - WALLET_PRINCIPAL_TOMAN
const PENDING_RIAL = tomanToRial(ORDER_TOMAN)
const CREDIT_RIAL = tomanToRial(CREDIT_TOMAN)
const WALLET_BALANCE_RIAL = tomanToRial(WALLET_TOMAN)
const WALLET_PRINCIPAL_RIAL = tomanToRial(WALLET_PRINCIPAL_TOMAN)
const FULL_PRINCIPAL_RIAL = tomanToRial(ORDER_TOMAN)
const FIRST_KEY = '11111111-1111-1111-1111-111111111111'
const SECOND_KEY = '22222222-2222-2222-2222-222222222222'

const replace = vi.fn()
const mutate = vi.fn()
const showSheet = vi.fn()
const hideSheet = vi.fn()
const navigateToExternalUrl = vi.fn()
const track = vi.fn()
const useExperimentMock = vi.fn()

const ORDER_DEDUCTION_VARIANT = {
  key: 'order_deduction',
  label: 'حالت کسر از سفارش',
  weight: 50,
  payload: { mode: BAROOK_AMOUNT_MODE.ORDER_DEDUCTION },
}

const GATEWAY_VARIANT = {
  key: 'gateway',
  label: 'حالت درگاه',
  weight: 50,
  payload: { mode: BAROOK_AMOUNT_MODE.GATEWAY },
}

let paymentQuery: {
  data?: { payment: { pendingAmount: number } }
  isLoading: boolean
  isError: boolean
}

let walletQuery: {
  data?: {
    enabled: boolean
    balance: number
    commissionPercentage: number
    maxAffordablePrincipal: number | null
    remote: {
      expendableCreditAmount: number
      balanceDate: string | null
      isUserBlocked: boolean
    } | null
  }
  isLoading: boolean
  isError: boolean
  error?: { response?: { data?: unknown } }
}

const enabledWallet = {
  enabled: true,
  balance: WALLET_BALANCE_RIAL,
  commissionPercentage: RATE,
  maxAffordablePrincipal: WALLET_PRINCIPAL_RIAL,
  remote: {
    expendableCreditAmount: CREDIT_RIAL,
    balanceDate: null,
    isUserBlocked: false,
  },
}

const noCreditRemote = {
  expendableCreditAmount: 0,
  balanceDate: null,
  isUserBlocked: false,
}

const noWallet = {
  ...enabledWallet,
  balance: 0,
  maxAffordablePrincipal: 0,
}

const walletOnly = {
  ...enabledWallet,
  remote: noCreditRemote,
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, back: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/api/functions/payment-management', () => ({
  useLatestPaymentByReference: () => paymentQuery,
}))

vi.mock('@/api/functions/barook', () => ({
  useGetBarookWallet: () => walletQuery,
  useInitiateBarookPayment: () => ({ mutate, isPending: false }),
}))

vi.mock('@/helpers/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/helpers/analytics')>()
  return {
    ...actual,
    track: (...args: unknown[]) => track(...args),
  }
})

vi.mock('@/modules/experiments/hooks/useExperiment', () => ({
  useExperiment: (...args: unknown[]) => useExperimentMock(...args),
}))

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => showSheet(...args),
    hideSheet: (...args: unknown[]) => hideSheet(...args),
  }
})

vi.mock(
  '@/modules/payment/utils/payment-navigation',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/modules/payment/utils/payment-navigation')
      >()
    return {
      ...actual,
      navigateToExternalUrl: (...args: unknown[]) =>
        navigateToExternalUrl(...(args as [string])),
    }
  },
)

if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
}

let uuidSpy: ReturnType<typeof vi.spyOn>

const confirmButton = () =>
  screen.getByRole('button', { name: BAROOK_PAGE_COPY.confirm })

const netInput = () => screen.getByLabelText(BAROOK_PAGE_COPY.netPaymentInput)

const lastMutateCall = () => {
  const [variables, options] = mutate.mock.calls.at(-1) as [
    { data: Record<string, unknown> },
    {
      onSuccess?: (data: Partial<PaymentBarookInitiationResult>) => void
      onError?: (
        error: unknown,
        variables: { data: Record<string, unknown> },
      ) => void
    },
  ]

  return { variables, options }
}

describe('BarookCalculatorPage', () => {
  beforeEach(() => {
    replace.mockReset()
    mutate.mockReset()
    showSheet.mockReset()
    hideSheet.mockReset()
    navigateToExternalUrl.mockReset()
    track.mockReset()
    useExperimentMock.mockReset()
    useExperimentMock.mockReturnValue(ORDER_DEDUCTION_VARIANT)

    paymentQuery = {
      data: { payment: { pendingAmount: PENDING_RIAL } },
      isLoading: false,
      isError: false,
    }
    walletQuery = {
      data: enabledWallet,
      isLoading: false,
      isError: false,
    }

    uuidSpy = vi.spyOn(crypto, 'randomUUID')
    uuidSpy.mockReset()
    uuidSpy.mockReturnValueOnce(FIRST_KEY).mockReturnValueOnce(SECOND_KEY)
  })

  afterEach(() => {
    uuidSpy.mockRestore()
  })

  test('submits the prefilled remaining principal and follows a Barook redirect', async () => {
    const user = userEvent.setup()
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(screen.getByText(BAROOK_PAGE_COPY.walletLabel)).toBeInTheDocument()
    expect(confirmButton()).toBeEnabled()

    await user.click(confirmButton())

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(lastMutateCall().variables.data).toEqual({
      referenceEntity: PAYMENT_REFERENCE_ENTITY.ORDER,
      referenceId: String(ORDER_ID),
      principalAmount: FULL_PRINCIPAL_RIAL,
      idempotencyKey: FIRST_KEY,
    })

    lastMutateCall().options.onSuccess?.({
      redirectUrl: 'https://barook.test/pay',
    })

    expect(navigateToExternalUrl).toHaveBeenCalledWith(
      'https://barook.test/pay',
    )
    expect(replace).not.toHaveBeenCalled()
  })

  test('replaces to the local success result when redirectUrl is null', async () => {
    const user = userEvent.setup()
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    await user.click(confirmButton())

    lastMutateCall().options.onSuccess?.({ redirectUrl: null })

    expect(navigateToExternalUrl).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith(
      '/payment/result?status=success&type=barook&referenceId=42',
    )
  })

  test('reuses the idempotency key on a non-5027 retry', async () => {
    const user = userEvent.setup()
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    await user.click(confirmButton())
    lastMutateCall().options.onError?.(
      { response: { data: { code: 500 } } },
      {
        data: lastMutateCall().variables.data,
      },
    )

    await user.click(confirmButton())

    expect(mutate).toHaveBeenCalledTimes(2)
    expect(lastMutateCall().variables.data.idempotencyKey).toBe(FIRST_KEY)
    expect(showSheet).not.toHaveBeenCalled()
  })

  test('opens the 5027 ActionSheet and retries with force and a new key', async () => {
    const user = userEvent.setup()
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    await user.click(confirmButton())

    const firstCall = lastMutateCall()
    firstCall.options.onError?.(
      {
        response: {
          data: { code: ERROR_CODES.BAROOK_ATTEMPT_ALREADY_IN_PROGRESS },
        },
      },
      { data: firstCall.variables.data },
    )

    expect(showSheet).toHaveBeenCalledTimes(1)
    const [, sheetProps] = showSheet.mock.calls[0] as [
      unknown,
      {
        title: string
        actions: { id: string; onClick: () => void }[]
      },
    ]
    expect(sheetProps.title).toBe(BAROOK_PAGE_COPY.pendingTitle)

    const proceed = sheetProps.actions.find((action) => action.id === 'proceed')
    proceed?.onClick()

    expect(hideSheet).toHaveBeenCalled()
    expect(mutate).toHaveBeenCalledTimes(2)
    expect(lastMutateCall().variables.data).toEqual({
      referenceEntity: PAYMENT_REFERENCE_ENTITY.ORDER,
      referenceId: String(ORDER_ID),
      principalAmount: FULL_PRINCIPAL_RIAL,
      idempotencyKey: SECOND_KEY,
      force: true,
    })
  })

  test('hides the wallet card and disables confirm when the input is empty and there is no balance', () => {
    walletQuery = {
      data: {
        ...noWallet,
        remote: noCreditRemote,
      },
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(
      screen.queryByText(BAROOK_PAGE_COPY.walletLabel),
    ).not.toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()

    const footer = document.querySelector(
      '[data-slot="barook-calculator-footer"]',
    )
    expect(footer).toHaveTextContent(formatPrice(0))
  })

  test('submits wallet plus typed credit as the total net principal', async () => {
    const user = userEvent.setup()
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    fireEvent.change(netInput(), { target: { value: '80000000' } })

    const footer = document.querySelector(
      '[data-slot="barook-calculator-footer"]',
    )
    expect(footer).toHaveTextContent(formatPrice(280_000_000))
    expect(footer).toHaveTextContent(formatPrice(84_000_000))
    expect(confirmButton()).toBeEnabled()

    await user.click(confirmButton())

    expect(lastMutateCall().variables.data.principalAmount).toBe(
      tomanToRial(280_000_000),
    )
  })

  test('TC-25 replaces a previous valid amount in the summary', () => {
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    fireEvent.change(netInput(), { target: { value: '100000000' } })
    fireEvent.change(netInput(), { target: { value: '80000000' } })

    const footer = document.querySelector(
      '[data-slot="barook-calculator-footer"]',
    )
    expect(footer).toHaveTextContent(formatPrice(280_000_000))
    expect(footer).not.toHaveTextContent(formatPrice(300_000_000))
    expect(footer).toHaveTextContent(formatPrice(84_000_000))
  })

  test('shows the credit error with the numeric max and disables confirm', () => {
    walletQuery = {
      data: noWallet,
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    fireEvent.change(netInput(), { target: { value: String(CREDIT_TOMAN) } })

    const maxToman = rialToTomanTrunc(
      largestAffordablePrincipal(CREDIT_RIAL, RATE),
    )
    expect(
      screen.getByText(BAROOK_VALIDATION_MESSAGE.CREDIT(formatPrice(maxToman))),
    ).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  test('shows the order error with the remaining max when credit is ample', () => {
    walletQuery = {
      data: {
        ...noWallet,
        remote: {
          expendableCreditAmount: tomanToRial(2_000_000_000),
          balanceDate: null,
          isUserBlocked: false,
        },
      },
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    fireEvent.change(netInput(), {
      target: { value: String(ORDER_TOMAN + 1) },
    })

    expect(
      screen.getByText(
        BAROOK_VALIDATION_MESSAGE.ORDER(formatPrice(ORDER_TOMAN)),
      ),
    ).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  test('disables the amount input when the wallet covers the order', () => {
    paymentQuery = {
      data: { payment: { pendingAmount: WALLET_PRINCIPAL_RIAL } },
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(netInput()).toBeDisabled()
    expect(confirmButton()).toBeEnabled()
    expect(
      screen.queryByRole('button', { name: BAROOK_PAGE_COPY.clearAmount }),
    ).not.toBeInTheDocument()
  })

  test('renders the order-deduction mode fixed by the experiment variant, with no tab switcher', () => {
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(netInput()).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  test('renders the gateway mode fixed by the experiment variant, with no tab switcher', () => {
    useExperimentMock.mockReturnValue(GATEWAY_VARIANT)

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(
      screen.getByLabelText(BAROOK_PAGE_COPY.gatewayAmountInput),
    ).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  test('tracks the gateway variant to Plausible and Clarity exactly once', () => {
    useExperimentMock.mockReturnValue(GATEWAY_VARIANT)

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.BAROOK_AVAILABLE_CREDIT, {
      plausible: true,
      clarity: true,
    })
  })

  test('tracks the order-deduction variant to Plausible and Clarity exactly once', () => {
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith(EVENTS.BAROOK_NET_PAYMENT, {
      plausible: true,
      clarity: true,
    })
  })

  test('shows the loading skeleton while the experiment variant is unresolved', () => {
    useExperimentMock.mockReturnValue(null)

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(
      screen.queryByLabelText(BAROOK_PAGE_COPY.netPaymentInput),
    ).not.toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
    expect(track).not.toHaveBeenCalled()
  })

  test('rejects a negative paste instead of treating it as a positive amount', () => {
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    fireEvent.change(netInput(), { target: { value: '-1000000' } })

    expect(netInput()).toHaveValue(formatPrice(REMAINING_AFTER_WALLET_TOMAN))
    expect(confirmButton()).toBeEnabled()
  })

  test('truncates a decimal paste to the toman integer', () => {
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    fireEvent.change(netInput(), { target: { value: '80000000.9' } })

    expect(netInput()).toHaveValue(formatPrice(80_000_000))
  })

  test('prefills min of credit and remaining when leftover is safe', () => {
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(netInput()).toHaveValue(formatPrice(REMAINING_AFTER_WALLET_TOMAN))
    expect(confirmButton()).toBeEnabled()
  })

  test('clears the prefilled amount without resuggesting it', async () => {
    const user = userEvent.setup()
    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(netInput()).toHaveValue(formatPrice(REMAINING_AFTER_WALLET_TOMAN))

    await user.click(
      screen.getByRole('button', { name: BAROOK_PAGE_COPY.clearAmount }),
    )

    expect(netInput()).toHaveValue('')
    expect(
      screen.queryByRole('button', { name: BAROOK_PAGE_COPY.clearAmount }),
    ).not.toBeInTheDocument()
  })

  test('does not prefill when leftover would be below MIN_IPG', () => {
    paymentQuery = {
      data: { payment: { pendingAmount: tomanToRial(50_000) } },
      isLoading: false,
      isError: false,
    }
    walletQuery = {
      data: {
        ...noWallet,
        commissionPercentage: 0,
        remote: {
          expendableCreditAmount: tomanToRial(45_000),
          balanceDate: null,
          isUserBlocked: false,
        },
      },
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(netInput()).toHaveValue('')
    expect(confirmButton()).toBeDisabled()
  })

  test('shows the leftover IPG error and disables confirm', () => {
    paymentQuery = {
      data: { payment: { pendingAmount: tomanToRial(50_000) } },
      isLoading: false,
      isError: false,
    }
    walletQuery = {
      data: {
        ...noWallet,
        commissionPercentage: 0,
        remote: {
          expendableCreditAmount: tomanToRial(45_000),
          balanceDate: null,
          isUserBlocked: false,
        },
      },
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    fireEvent.change(netInput(), { target: { value: '45000' } })

    expect(
      screen.getByText(
        BAROOK_VALIDATION_MESSAGE.IPG_REMAINDER(formatPrice(MIN_IPG_TOMAN)),
      ),
    ).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
  })

  test('shows the 0% fee hint', () => {
    walletQuery = {
      data: {
        ...enabledWallet,
        commissionPercentage: 0,
      },
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(
      screen.getByText(BAROOK_PAGE_COPY.feeAdded(persianDigits(0))),
    ).toBeInTheDocument()
  })

  test('submits wallet-only principal when there is no remote credit', async () => {
    const user = userEvent.setup()
    walletQuery = {
      data: walletOnly,
      isLoading: false,
      isError: false,
    }

    render(<BarookCalculatorPage orderId={ORDER_ID} />)

    expect(netInput()).toHaveValue('')
    expect(confirmButton()).toBeEnabled()

    await user.click(confirmButton())

    expect(lastMutateCall().variables.data.principalAmount).toBe(
      WALLET_PRINCIPAL_RIAL,
    )
  })
})
