export const FAB_POSITIONS = [
  'bottom-left',
  'bottom-right',
  'top-left',
  'top-right',
] as const

export type FabPosition = (typeof FAB_POSITIONS)[number]

export const FAB_POSITION_OPTIONS: { value: FabPosition; label: string }[] = [
  { value: 'bottom-left', label: 'پایین چپ' },
  { value: 'bottom-right', label: 'پایین راست' },
  { value: 'top-left', label: 'بالا چپ' },
  { value: 'top-right', label: 'بالا راست' },
]

export const FAB_POSITION_CLASSES: Record<FabPosition, string> = {
  'bottom-left': 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4',
  'bottom-right': 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4',
  'top-left': 'top-[calc(1rem+env(safe-area-inset-top))] left-4',
  'top-right': 'top-[calc(1rem+env(safe-area-inset-top))] right-4',
}

export const DEFAULT_FAB_POSITION: FabPosition = 'bottom-left'
