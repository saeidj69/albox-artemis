import { FC, CSSProperties } from 'react'

import { cn } from '@/lib/utils'

type NmvStepProps = {
  /** Ends active after `activateDelayMs` (CSS-driven). */
  activates: boolean
  activateDelayMs: number
}

const NmvStep: FC<NmvStepProps> = (props) => {
  const { activates, activateDelayMs } = props

  const delayStyle: CSSProperties | undefined = activates
    ? { animationDelay: `${activateDelayMs}ms` }
    : undefined

  return (
    <span
      className={cn(
        'flex size-5 origin-center items-center justify-center',
        activates && 'animate-nmv-step-pop',
      )}
      style={delayStyle}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'block size-5',
          activates ? 'animate-nmv-step-activate' : 'grayscale-100',
        )}
        style={delayStyle}
      >
        <circle cx="10" cy="10" r="9.5" fill="#89CFC7" stroke="#BAE2DD" />
        <circle cx="10" cy="10" r="6.25" fill="#3FA99E" />
        <circle cx="10" cy="10" r="3.75" fill="#09847C" />
        <circle cx="10" cy="10" r="2.5" fill="#005049" />
        <circle cx="10" cy="10" r="1.25" fill="#00403B" />
      </svg>
    </span>
  )
}

export default NmvStep
