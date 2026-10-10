import { FC } from 'react'

import { Clock, Gift } from 'iconsax-reactjs'

import Chip from '@/lib/Chip'
import { cn } from '@/lib/utils'

export type CampaignHistoryTone = 'warning' | 'success' | 'muted'

export type CampaignHistoryCardProps = {
  periodTitle: string
  statusLabel: string
  tone: CampaignHistoryTone
  orderAmountLabel: string
  prizeLabel: string
  prizeAmountLabel: string
  footerMessage?: string | null
  settledAtLabel?: string | null
}

/** @deprecated Use CampaignHistoryCardProps */
export type CampaignHistoryCardComponentProps = CampaignHistoryCardProps

const STATUS_CHIP_CLASSNAMES = {
  warning: {
    root: 'bg-warning-lighter border-transparent',
    content: 'text-warning-main',
  },
  success: {
    root: 'bg-success-lighter border-transparent',
    content: 'text-success-main',
  },
  muted: {
    root: 'bg-background-secondary border-transparent',
    content: 'text-text-secondary',
  },
} as const

const toneIcon = (tone: CampaignHistoryTone) => {
  if (tone === 'warning') {
    return <Clock variant="Outline" className="size-5" />
  }

  return <Gift variant="Outline" className="size-5" />
}

export const CampaignHistoryCardComponent: FC<CampaignHistoryCardProps> = (
  props,
) => {
  const {
    periodTitle,
    statusLabel,
    tone,
    orderAmountLabel,
    prizeLabel,
    prizeAmountLabel,
    footerMessage,
    settledAtLabel,
  } = props

  return (
    <article className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="typo-label-medium text-text-primary">{periodTitle}</p>
        {settledAtLabel ? (
          <p className="typo-body-x-small text-text-secondary shrink-0">
            {settledAtLabel}
          </p>
        ) : null}
      </div>

      <div className="border-border-main rounded-brand flex flex-col gap-2 border p-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full',
              tone === 'warning' && 'bg-warning-lighter text-warning-main',
              tone === 'success' && 'bg-success-lighter text-success-main',
              tone === 'muted' && 'bg-background-secondary text-text-disabled',
            )}
            data-slot="campaign-history-card-icon"
          >
            {toneIcon(tone)}
          </div>

          <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center justify-between">
              <div className="typo-body-small text-text-secondary">
                سفارش‌های شما: {orderAmountLabel} تومان
              </div>
              {tone !== 'muted' && (
                <Chip
                  size="small"
                  content={statusLabel}
                  classNames={STATUS_CHIP_CLASSNAMES[tone]}
                />
              )}
            </div>

            {tone === 'muted' ? (
              footerMessage && (
                <p className="typo-label-small text-text-primary">
                  {footerMessage}
                </p>
              )
            ) : (
              <div className="flex w-full items-center justify-between">
                <span className="typo-label-small text-text-primary">
                  {prizeLabel}
                </span>

                <span className="typo-label-small text-text-primary">
                  {prizeAmountLabel}

                  <span className="typo-label-x-small text-text-secondary">
                    {' '}
                    تومان{' '}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {tone !== 'muted' && footerMessage && (
          <p className="typo-body-small text-text-primary">{footerMessage}</p>
        )}
      </div>
    </article>
  )
}
