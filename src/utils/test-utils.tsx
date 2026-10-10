import React, { ReactElement } from 'react'

import NiceModal from '@ebay/nice-modal-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react'
import { Provider as JotaiProvider } from 'jotai'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <NiceModal.Provider>{children}</NiceModal.Provider>
      </JotaiProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

const customRenderHook = <Result, Props>(
  renderCallback: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
) => renderHook(renderCallback, { wrapper: AllTheProviders, ...options })

// re-export everything from testing-library
export * from '@testing-library/react'

// override standard render/renderHook with provider-wrapped versions
export { customRender as render, customRenderHook as renderHook }
