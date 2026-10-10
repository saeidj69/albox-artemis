import { ROUTES } from '@/constants'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { act, render, screen } from '@/utils/test-utils'

import { ImpersonateView } from './index'

const mockReplace = vi.fn()
const mockUseProfile = vi.fn()
const mockImpersonate = vi.fn()
const showSheet = vi.fn()
const hideSheet = vi.fn()
const removeQueries = vi.fn()
const toastSuccess = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/api/functions/profile', () => ({
  useProfile: () => mockUseProfile(),
}))

vi.mock('@/api/functions/impersonation', () => ({
  useImpersonate: () => ({ mutate: mockImpersonate }),
}))

vi.mock('@/lib/Sheet', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/Sheet')>()
  return {
    ...actual,
    showSheet: (...args: unknown[]) => showSheet(...args),
    hideSheet: (...args: unknown[]) => hideSheet(...args),
  }
})

vi.mock('@/providers/ReactQuery', () => ({
  queryClient: {
    removeQueries: (...args: unknown[]) => removeQueries(...args),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}))

const renderPage = () => render(<ImpersonateView token="impersonate-token" />)

const loggedInProfile = {
  profile: {
    firstName: 'علی',
    lastName: 'حسینی',
  },
}

type SheetAction = {
  id: string
  onClick: () => void
}

const getSheetProps = () => {
  const [, sheetProps] = showSheet.mock.calls[0] as [
    unknown,
    {
      title: string
      description: string
      onClose?: () => void
      actions: SheetAction[]
    },
  ]

  return sheetProps
}

describe('ImpersonatePage', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockUseProfile.mockReset()
    mockImpersonate.mockReset()
    showSheet.mockReset()
    hideSheet.mockReset()
    removeQueries.mockReset()
    toastSuccess.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('does not impersonate while the profile request is pending', () => {
    vi.useFakeTimers()
    mockUseProfile.mockReturnValue({ data: undefined, isPending: true })

    renderPage()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(screen.getByText('خودتو بذار جای یکی دیگه')).toBeInTheDocument()
    expect(mockImpersonate).not.toHaveBeenCalled()
    expect(showSheet).not.toHaveBeenCalled()
  })

  test('impersonates after a delay when no user is logged in', () => {
    vi.useFakeTimers()
    mockUseProfile.mockReturnValue({ data: null, isPending: false })

    renderPage()

    expect(mockImpersonate).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(showSheet).not.toHaveBeenCalled()
    expect(mockImpersonate).toHaveBeenCalledTimes(1)
    expect(mockImpersonate).toHaveBeenCalledWith(
      { data: { token: 'impersonate-token' } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  test('shows a confirmation sheet and does not impersonate when a user is already logged in', () => {
    mockUseProfile.mockReturnValue({
      data: loggedInProfile,
      isPending: false,
    })

    renderPage()

    expect(mockImpersonate).not.toHaveBeenCalled()
    expect(showSheet).toHaveBeenCalledTimes(1)

    const sheetProps = getSheetProps()

    expect(sheetProps.title).toBe('قبلا با حساب دیگری وارد شده اید')
    expect(sheetProps.description).toContain('علی حسینی')
  })

  test('replaces the current user when impersonation is confirmed', () => {
    mockUseProfile.mockReturnValue({
      data: loggedInProfile,
      isPending: false,
    })

    const { rerender } = renderPage()

    const confirm = getSheetProps().actions.find(
      (action) => action.id === 'confirm',
    )

    expect(confirm).toBeDefined()
    confirm?.onClick()

    expect(hideSheet).toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
    expect(mockImpersonate).toHaveBeenCalledTimes(1)
    expect(mockImpersonate).toHaveBeenCalledWith(
      { data: { token: 'impersonate-token' } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )

    mockUseProfile.mockReturnValue({
      data: {
        profile: {
          firstName: 'سارا',
          lastName: 'محمدی',
        },
      },
      isPending: false,
    })

    rerender(<ImpersonateView token="impersonate-token" />)

    expect(showSheet).toHaveBeenCalledTimes(1)
  })

  test('returns home and does not impersonate when the sheet is cancelled', () => {
    mockUseProfile.mockReturnValue({
      data: loggedInProfile,
      isPending: false,
    })

    renderPage()

    const cancel = getSheetProps().actions.find(
      (action) => action.id === 'cancel',
    )

    expect(cancel).toBeDefined()
    cancel?.onClick()

    expect(hideSheet).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME)
    expect(mockImpersonate).not.toHaveBeenCalled()
  })

  test('returns home and does not impersonate when the sheet is dismissed', () => {
    mockUseProfile.mockReturnValue({
      data: loggedInProfile,
      isPending: false,
    })

    renderPage()

    getSheetProps().onClose?.()

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME)
    expect(mockImpersonate).not.toHaveBeenCalled()
  })
})
