'use client'

import { FC, useEffect, useRef, useState } from 'react'

import { EmptyWalletTick, EmptyWalletTime } from 'iconsax-reactjs'

import { formatGiftPercentageAmount } from '@/modules/campaigns/utils/build-nmv-campaign-view'

import { cn } from '@/lib/utils'

type MilestoneStepProps = {
  percentage?: number | null
  isActive?: boolean
}

const MilestoneStep: FC<MilestoneStepProps> = (props) => {
  const { percentage, isActive = false } = props
  const wasActiveRef = useRef(false)
  const [popKey, setPopKey] = useState(0)

  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      setPopKey((current) => current + 1)
    }
    wasActiveRef.current = isActive
  }, [isActive])

  return (
    <div className="relative w-18">
      <div
        key={popKey}
        className={cn('origin-center', popKey > 0 && 'animate-nmv-step-pop')}
      >
        <div
          className={cn(
            'grid size-18 place-items-center rounded-full',
            'transition-colors duration-300 ease-out',
            isActive ? 'bg-primary-100' : 'bg-background-darker',
            isActive ? 'text-primary-600' : 'text-text-secondary',
          )}
        >
          {percentage != null ? (
            <span className="typo-subtitle-medium -mb-4" dir="ltr">
              {formatGiftPercentageAmount(percentage)}٪
            </span>
          ) : null}

          <span className="relative size-6">
            <EmptyWalletTick
              className={cn(
                'absolute inset-0 size-6 transition-opacity duration-300 ease-out',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
            />
            <EmptyWalletTime
              className={cn(
                'absolute inset-0 size-6 transition-opacity duration-300 ease-out',
                isActive ? 'opacity-0' : 'opacity-100',
              )}
            />
          </span>
        </div>

        <div
          className={cn(
            'absolute -bottom-1.5 left-0 -z-10 size-18 rounded-full',
            'transition-colors duration-300 ease-out',
            isActive ? 'bg-primary-200' : 'bg-background-disabled',
          )}
        />
      </div>
    </div>
  )
}

export default MilestoneStep
