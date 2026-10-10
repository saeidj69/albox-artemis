import type { ReactNode } from 'react'

import Image from 'next/image'

import { BAROOK_CREDIT_URL, TOMAN } from '@/constants'
import { ArrowLeft2 } from 'iconsax-reactjs'

import { formatPrice, persianDigits, toTomanPrice } from '@/utils/numbers'

import Button from '@/lib/Button'
import Chip from '@/lib/Chip'
import Spinner from '@/lib/Spinner'
import { cn } from '@/lib/utils'

import type { BarookOptionState } from '../../utils/get-barook-option-state'
import MethodOptionFrame from './method-option-frame'

type BarookMethodOptionProps = {
  state: BarookOptionState
  selected: boolean
  commissionPercentage?: number
  balanceRial: number
  isDiscovering: boolean
  onSelect: () => void
  onRetry: () => void
}

/** Fee copy for active / loading rows (inactive hides it). */
const feeLabel = (commissionPercentage?: number) =>
  commissionPercentage
    ? `+${persianDigits(commissionPercentage)}٪ هزینه خدمات اعتباری آل‌باکس`
    : 'هزینه خدمات اعتباری آل‌باکس به صورت جداگانه محاسبه خواهد شد'

/** CTAs live inside a disabled card shell — stop the frame from swallowing clicks. */
const stopCardClick = (event: { stopPropagation: () => void }) => {
  event.stopPropagation()
}

type StatusDetailsProps = {
  state: Exclude<BarookOptionState, 'active'>
  isDiscovering: boolean
  onRetry: () => void
}

const StatusDetails = (props: StatusDetailsProps) => {
  const { state, isDiscovering, onRetry } = props

  const handleRetry = (event: { stopPropagation: () => void }) => {
    stopCardClick(event)
    onRetry()
  }

  switch (state) {
    case 'loading':
      return (
        <div className="mt-2 flex items-center gap-2">
          <Spinner size="small" className="text-text-secondary" />
          <p className="typo-body-small text-text-secondary">
            در حال بررسی اعتبار باروک شما...
          </p>
        </div>
      )

    case 'unknown':
      return (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="typo-body-small text-text-secondary">
            وضعیت اعتبار: نامشخص
          </p>
          <Button
            variant="ghost"
            size="small"
            loading={isDiscovering}
            classNames={{ root: 'text-primary-600 border-primary-600' }}
            onClick={handleRetry}
          >
            بررسی وضعیت اعتبار
          </Button>
        </div>
      )

    case 'inactive':
      return (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="typo-body-small text-text-disabled">
            اعتبار باروک شما فعال نیست
          </p>
          <Button
            as="a"
            href={BAROOK_CREDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            size="small"
            endIcon={<ArrowLeft2 />}
            onClick={stopCardClick}
          >
            دریافت اعتبار
          </Button>
        </div>
      )

    case 'providerError':
      return (
        <div className="mt-2 space-y-2">
          <p className="typo-label-small text-error-main">
            بررسی اعتبار با خطا مواجه شد. لطفا دوباره تلاش کنید.
          </p>
          <p className="typo-label-small text-text-secondary">
            خطا در برقراری ارتباط با سرورهای باروک.
          </p>
          <div className="flex justify-end">
            <Button
              variant="text"
              size="small"
              loading={isDiscovering}
              endIcon={<ArrowLeft2 />}
              onClick={handleRetry}
            >
              تلاش مجدد
            </Button>
          </div>
        </div>
      )

    case 'rateLimited':
      return (
        <div className="mt-2 space-y-2">
          <p className="typo-label-small text-error-main">
            تعداد درخواست‌ها بیش از حد مجاز است.
          </p>
          <p className="typo-label-small text-text-secondary">
            لطفاً کمی بعد دوباره تلاش کنید.
          </p>
        </div>
      )
  }
}

const BarookMethodOption = (props: BarookMethodOptionProps) => {
  const {
    state,
    selected,
    commissionPercentage,
    balanceRial,
    isDiscovering,
    onSelect,
    onRetry,
  } = props

  const isInactive = state === 'inactive'
  const isActive = state === 'active'
  const showFee = isActive
  const showBalance = isActive && balanceRial > 0
  const statusDetails: ReactNode =
    state === 'active' ? null : (
      <StatusDetails
        state={state}
        isDiscovering={isDiscovering}
        onRetry={onRetry}
      />
    )

  return (
    <MethodOptionFrame
      selected={selected}
      disabled={!isActive}
      onSelect={onSelect}
      loading={state === 'loading'}
      error={state === 'providerError' || state === 'rateLimited'}
    >
      <div
        className={cn(
          'flex gap-3',
          showBalance || statusDetails ? 'items-start' : 'items-center',
        )}
      >
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center',
            isInactive && 'opacity-50',
          )}
        >
          <Image
            src="/images/barook.svg"
            alt="باروک"
            width={40}
            height={40}
            className="size-10 object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                'typo-title-x-small',
                isInactive ? 'text-text-disabled' : 'text-text-primary',
              )}
            >
              <span>پرداخت با اعتبار باروک</span>
            </p>

            {showFee && (
              <div className="text-text-secondary typo-body-small">
                {feeLabel(commissionPercentage)}
              </div>
            )}

            {isInactive && (
              <Chip
                as="div"
                size="small"
                variant="soft"
                content="غیرفعال"
                classNames={{
                  root: 'bg-warning-light border-transparent',
                  content: 'text-warning-dark typo-label-x-small',
                }}
              />
            )}
          </div>

          {showBalance && (
            <p className="typo-body-small text-text-primary mt-1">
              {formatPrice(toTomanPrice(balanceRial))} {TOMAN} شارژ کیف پول
            </p>
          )}

          {statusDetails}
        </div>
      </div>
    </MethodOptionFrame>
  )
}

export default BarookMethodOption
