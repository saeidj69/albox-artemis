import { ReactNode } from 'react'

import { ButtonProps } from '@/lib/Button'

export type ActionSheetIcon = 'success' | 'warning' | 'error'

export type ActionSheetProps = {
  title: string
  description?: string
  icon?: ActionSheetIcon
  children?: ReactNode
  actions?: (ButtonProps & { id: string })[]
  onClose?: VoidFunction
}
