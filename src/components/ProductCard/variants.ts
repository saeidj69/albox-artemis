import { tv } from 'tailwind-variants'

export const productCardVariants = tv({
  slots: {
    root: [
      'bg-background-main border-border-main relative block h-full w-full overflow-hidden rounded-lg border px-1 py-1',
      'transition-transform duration-200 active:scale-[0.98]',
    ],
    imageBox: 'relative flex h-24 w-full items-center justify-center',
    imageInner:
      'bg-background-main/20 flex h-24 w-full items-center justify-center rounded-lg',
    image: 'object-contain',
    placeholder: 'text-border-darker grid size-full place-items-center',
    title:
      'typo-body-small text-text-primary mb-2 line-clamp-2 min-h-12 leading-6',
    priceRow: 'flex items-center justify-between gap-2',
    price: 'typo-body-x-small text-text-primary min-w-0',
    label: 'text-text-secondary typo-label-x-small shrink-0',
  },
  variants: {
    active: {
      true: {
        root: 'ring-primary-500/35 ring-offset-background-main ring-2 ring-offset-2',
      },
      false: {},
    },
  },
  defaultVariants: {
    active: false,
  },
})

export type ProductCardSlots = keyof ReturnType<typeof productCardVariants>

export const productCardSkeletonVariants = tv({
  slots: {
    root: [
      'bg-background-main border-border-main rounded-brand relative overflow-hidden border p-3 pb-1',
    ],
    badge: 'absolute top-4 left-0 z-10 h-[29px] w-10 min-w-8 rounded-r-lg',
    imageSection: 'relative flex justify-center',
    imageInner: 'relative size-30',
    image: 'size-30 rounded-lg',
    addToCart: 'absolute bottom-2 z-10 h-10 w-10 rounded-[10px]',
    body: 'block',
    title: 'my-1 h-9 w-full rounded-md',
    unitPriceRow: 'mt-1.5 flex items-center justify-between',
    unitPriceLabel: 'h-[15px] w-12 shrink-0 rounded',
    unitPriceValues: 'flex items-center gap-1',
    unitStrike: 'h-[15px] w-10 shrink-0 rounded',
    unitPrice: 'h-[18px] w-14 shrink-0 rounded',
    borderSection: 'border-border-main mt-1.5 mb-px border-t pt-2',
    chipRow: 'mb-1 flex items-center justify-between gap-2',
    chipGroup: 'flex shrink-0 items-center gap-0.5',
    chipIcon: 'size-3 shrink-0 rounded-sm',
    chipText: 'h-[15px] w-20 rounded',
    boxStrike: 'h-3 w-16 shrink-0 rounded',
    cartonPriceRow: 'mt-1 flex items-center justify-end gap-0.5',
    cartonPrice: 'h-[27px] w-20 shrink-0 rounded',
    cartonToman: 'h-[15px] w-7 shrink-0 rounded',
  },
})

export type ProductCardSkeletonSlots = keyof ReturnType<
  typeof productCardSkeletonVariants
>
