import { RiArrowRightLine } from '@remixicon/react'

import IconButton from '@/lib/IconButton'

type FilterSheetHeaderProps = {
  /** Shown below the title when drilling into a sub-filter; omitted on the root menu. */
  subtitle?: string
  /** Return to the root filter menu; shown together with `subtitle`. */
  onBack?: () => void
}

const FilterSheetHeader = (props: FilterSheetHeaderProps) => {
  const { subtitle, onBack } = props
  const showRow = Boolean(subtitle || onBack)

  if (!showRow) return null

  return (
    <div className="mb-2 flex min-h-10 shrink-0 items-center gap-2 px-4">
      {onBack ? (
        <IconButton
          type="button"
          variant="ghost"
          size="medium"
          className="shrink-0"
          icon={<RiArrowRightLine className="size-5" aria-hidden />}
          aria-label="بازگشت به منوی فیلتر"
          onClick={onBack}
        />
      ) : null}
      {subtitle ? (
        <p className="typo-body-small text-text-secondary">{subtitle}</p>
      ) : null}
    </div>
  )
}

export default FilterSheetHeader
