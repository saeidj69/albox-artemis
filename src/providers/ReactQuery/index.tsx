'use client'

import useOnlineStatus from '@/hooks/useOnlineStatus'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  useOnlineStatus()

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default ReactQueryProvider
