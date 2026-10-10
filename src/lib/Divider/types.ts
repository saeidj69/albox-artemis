import type { ComponentPropsWithRef } from 'react'

import type { VariantProps } from 'tailwind-variants'

import { dividerVariants } from './variants'

export type DividerProps = ComponentPropsWithRef<'div'> &
  VariantProps<typeof dividerVariants>
