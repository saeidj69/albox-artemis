import Image from 'next/image'

import { persianDigits } from '@/utils/numbers'

import { PAYMENT_RESULT_COPY, PAYMENT_RESULT_IMAGES } from '../constants'

type ResultHeroProps = {
  isSuccess: boolean
  isBarook: boolean
  referenceId: string | null
}

const FailedBody = ({ isBarook }: { isBarook: boolean }) => {
  const { line1, genericLine2, barookPrefix, barookName, barookSuffix } =
    PAYMENT_RESULT_COPY.failed

  return (
    <>
      <p>{line1}</p>
      {isBarook ? (
        <p>
          {barookPrefix}
          <span className="text-text-primary font-medium">{barookName}</span>
          {barookSuffix}
        </p>
      ) : (
        <p>{genericLine2}</p>
      )}
    </>
  )
}

const SuccessBody = (props: {
  isBarook: boolean
  referenceId: string | null
}) => {
  const { isBarook, referenceId } = props

  if (isBarook) {
    return <p>{PAYMENT_RESULT_COPY.success.body}</p>
  }

  return (
    <>
      <p>{PAYMENT_RESULT_COPY.success.genericBody}</p>
      {referenceId ? (
        <p>
          {PAYMENT_RESULT_COPY.success.orderNumberLabel}{' '}
          {persianDigits(referenceId)}
        </p>
      ) : null}
    </>
  )
}

const ResultHero = (props: ResultHeroProps) => {
  const { isSuccess, isBarook, referenceId } = props
  const copy = isSuccess
    ? PAYMENT_RESULT_COPY.success
    : PAYMENT_RESULT_COPY.failed
  const title = isBarook ? copy.barookTitle : copy.title

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="relative h-[166px] w-[200px] overflow-clip">
        <Image
          src={
            isSuccess
              ? PAYMENT_RESULT_IMAGES.success
              : PAYMENT_RESULT_IMAGES.failed
          }
          alt={title}
          width={200}
          height={166}
          className="size-full object-contain"
          preload
        />
      </div>

      <div className="flex w-full flex-col items-center gap-2 text-center">
        <h2 className="typo-title-x-small text-text-primary leading-7">
          {title}
        </h2>
        <div className="typo-body-small text-text-secondary w-full leading-6">
          {isSuccess ? (
            <SuccessBody isBarook={isBarook} referenceId={referenceId} />
          ) : (
            <FailedBody isBarook={isBarook} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultHero
