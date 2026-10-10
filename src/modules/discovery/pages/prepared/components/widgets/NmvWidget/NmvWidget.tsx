'use client'

import Link from 'next/link'

import { ROUTES } from '@/constants'
import { ArrowLeft2, Gift } from 'iconsax-reactjs'

import Animate from '@/components/Animate'

import CampaignCountdown from '@/modules/campaigns/components/CampaignCountdown'
import { useHomeNmvCampaign } from '@/modules/discovery/pages/prepared/hooks/use-home-nmv-campaign'

import NmvWidgetLayout from './NmvWidget.Layout'
import NmvTrack from './components/NmvTrack'

export const NmvWidgetComponent = () => {
  const { campaign, view, show } = useHomeNmvCampaign()

  if (!show || !campaign || !view) {
    return null
  }

  return (
    <Link
      href={ROUTES.CAMPAIGNS.detail(campaign.id)}
      prefetch={false}
      className="block transition-transform duration-200 active:scale-[0.99]"
    >
      <NmvWidgetLayout>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Gift
                variant="Outline"
                className="text-secondary-800 size-5 shrink-0"
              />

              <Animate animation="slideDown" delay={100}>
                <span className="text-secondary-700 typo-label-medium truncate">
                  {view.title}
                </span>
              </Animate>
            </div>

            <Animate animation="slideUp" delay={200}>
              <div className="text-primary-600 mt-2 mr-6 flex items-center">
                <span className="typo-label-x-small">
                  مسیر دستیابی به جوایز اینجاست
                </span>

                <ArrowLeft2 className="size-4" />
              </div>
            </Animate>
          </div>

          <Animate animation="slideRight" delay={300} className="empty:hidden">
            <CampaignCountdown endAt={campaign.endAt} />
          </Animate>
        </div>

        <Animate animation="slideUp" delay={400}>
          {view.remainingCopy ? (
            <p className="typo-body-medium text-text-secondary mt-3">
              {view.remainingCopy.map((piece, index) => (
                <span
                  key={index}
                  className={
                    piece.emphasis
                      ? 'typo-label-small text-text-primary'
                      : 'typo-body-small text-text-secondary'
                  }
                >
                  {piece.text}
                </span>
              ))}
            </p>
          ) : null}
        </Animate>

        <div className="mt-2">
          <NmvTrack
            steps={view.trackSteps}
            leadingDotCount={view.leadingDotCount}
            trailingDotCount={view.trailingDotCount}
          />
        </div>
      </NmvWidgetLayout>
    </Link>
  )
}
