'use client'

import { Gift } from 'iconsax-reactjs'

const FirstPlay = () => {
  return (
    <div className="border-border-main rounded-brand w-full border bg-white p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-secondary-50 flex size-14 items-center justify-center rounded-full">
          <Gift className="text-secondary-600 size-7" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="typo-title-small text-text-primary font-bold">
            تا حالا جایزه ای نگرفتی!
          </h2>
          <p className="typo-body-small text-text-secondary">
            گردونه رو بچرخون تا شانستو امتحان کنی
          </p>
        </div>
      </div>
    </div>
  )
}

export default FirstPlay
