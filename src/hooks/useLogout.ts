import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants'
import { clearAnalyticsUser } from '@/helpers/analytics'

import { useLogout as useLogoutMutation } from '@/api/functions/auth'

import { queryClient } from '@/providers/ReactQuery'

type UseLogoutOptions = {
  onSuccess?: () => void
}

export const useLogout = (options?: UseLogoutOptions) => {
  const router = useRouter()

  const { mutate, isPending } = useLogoutMutation()

  const logout = () => {
    mutate(undefined, {
      onSuccess: () => {
        clearAnalyticsUser()
        queryClient.clear()
        localStorage.clear()
        router.push(ROUTES.AUTH.LOGIN)

        options?.onSuccess?.()
      },
    })
  }

  return { logout, isLoggingOut: isPending }
}
