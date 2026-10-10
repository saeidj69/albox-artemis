import { TOMAN } from '@/constants'
import { EmptyWallet } from 'iconsax-reactjs'

import { formatPrice, toTomanPrice } from '@/utils/numbers'

import { BAROOK_PAGE_COPY } from '../constants'
import AmountDisplay from './amount-display'

type WalletCardProps = {
  balanceRial: number
  usablePrincipalRial: number
}

const WalletCard = (props: WalletCardProps) => {
  const { balanceRial, usablePrincipalRial } = props

  return (
    <section
      data-slot="barook-wallet-card"
      className="border-border-main flex flex-col gap-2 rounded-[10px] border px-3 py-2"
    >
      <div className="flex items-center gap-1.5">
        <div className="bg-secondary-50 flex shrink-0 items-center rounded-full p-2">
          <EmptyWallet variant="Outline" className="text-primary-600 size-5" />
        </div>
        <p className="min-w-0 flex-1 text-right">
          <span className="typo-body-small text-text-primary">
            {BAROOK_PAGE_COPY.walletLabel}{' '}
          </span>
          <span className="typo-title-x-small text-text-primary">
            {formatPrice(toTomanPrice(balanceRial))}
          </span>{' '}
          <span className="typo-body-x-small text-text-secondary">{TOMAN}</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-text-primary min-w-0">
          <span className="typo-body-small">
            {BAROOK_PAGE_COPY.walletDeduction}{' '}
          </span>
          <span className="typo-body-x-small text-text-secondary">
            {BAROOK_PAGE_COPY.walletDeductionHint}
          </span>
        </p>
        <AmountDisplay
          amountRial={usablePrincipalRial}
          size="sm"
          valueClassName="text-success-main"
        />
      </div>
    </section>
  )
}

export default WalletCard
