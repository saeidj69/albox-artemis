import type { ComponentPropsWithRef } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { spinnerVariants } from './variants'

export interface SpinnerProps
  extends ComponentPropsWithRef<'svg'>, VariantProps<typeof spinnerVariants> {}
