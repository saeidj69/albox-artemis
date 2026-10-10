import { createContext, useContext } from 'react'

import type { VariantProps } from 'tailwind-variants'

import type { tabVariants } from './variants'

export type TabSize = NonNullable<VariantProps<typeof tabVariants>['size']>

type TabContextValue = {
  size: TabSize
}

export const TabContext = createContext<TabContextValue>({ size: 'medium' })

export function useTabContext() {
  return useContext(TabContext)
}
