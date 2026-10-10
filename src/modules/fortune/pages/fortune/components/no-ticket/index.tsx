'use client'

import { TicketExpired } from 'iconsax-reactjs'

import Button from '@/lib/Button'

type NoTicketProps = {
  onGuideClick: () => void
}

const NoTicket = ({ onGuideClick }: NoTicketProps) => {
  return (
    <div className="border-border-main rounded-brand w-full border bg-white p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-error-light flex size-14 items-center justify-center rounded-full">
          <TicketExpired className="text-error-main size-7" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="typo-title-small text-text-primary font-bold">
            وقت جمع‌کردن بلیطه!{' '}
          </h2>
          <p className="typo-body-small text-text-secondary">
            برای چرخوندن گردونه، اول بلیط جمع کن.{' '}
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={onGuideClick}
        >
          چطور بلیط بگیرم؟{' '}
        </Button>
      </div>
    </div>
  )
}

export default NoTicket
