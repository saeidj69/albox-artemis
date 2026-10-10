import { Gift } from 'iconsax-reactjs'

const IpgCashbackBadge = () => {
  return (
    <span
      data-slot="ipg-cashback-badge"
      aria-hidden
      className="bg-warning-main rounded-ss-brand pointer-events-none absolute start-0 top-0 flex items-center rounded-ee-[9px] p-1"
    >
      <Gift variant="Outline" className="text-primary-700 size-3.5" />
    </span>
  )
}

export default IpgCashbackBadge
