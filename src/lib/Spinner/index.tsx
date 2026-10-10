import { RiLoader5Fill } from '@remixicon/react'

import type { SpinnerProps } from './types'
import { spinnerVariants } from './variants'

/**
 * # Spinner
 * @param props - SpinnerProps
 * @description A spinner is a loading indicator that shows a circular progress bar.
 * @example
 * <Spinner />
 * <Spinner size="small" />
 */
const Spinner = (props: SpinnerProps) => {
  const { ref, size, className } = props

  const slots = spinnerVariants({ size })

  return <RiLoader5Fill className={slots.root({ className })} ref={ref} />
}

export default Spinner

export type { SpinnerProps }
