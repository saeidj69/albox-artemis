'use client'

import { FC } from 'react'

import Image from 'next/image'

import Animate from '@/components/Animate'

type SurenaWidgetProps = {
  surenaCode: string
  index: number
}

const SurenaWidget: FC<SurenaWidgetProps> = (props) => {
  const { surenaCode } = props

  return (
    <section className="rounded-brand w-app relative h-16 overflow-hidden">
      <Image
        src="/images/surena-card.png"
        alt="Surena card"
        fill
        sizes="100vw"
        preload
      />

      <div className="absolute inset-0 flex items-center gap-4 px-4">
        <Animate animation="fadeIn">
          <Image
            preload
            src="/images/logo.svg"
            alt="logo"
            width={24}
            height={24}
          />
        </Animate>

        <div>
          <Animate animation="slideDown" delay={100}>
            <div className="typo-body-medium text-primary-600 mb-1">
              شما با حساب سورنا وارد شده‌اید.
            </div>
          </Animate>

          <Animate animation="slideUp" delay={100}>
            <div className="typo-body-small text-text-secondary">
              کد شما:{' '}
              <span className="bg-background-darker/50 text-text-primary rounded-brand px-2 py-1">
                {surenaCode}
              </span>
            </div>
          </Animate>
        </div>
      </div>
    </section>
  )
}

export default SurenaWidget
