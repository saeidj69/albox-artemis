'use client'

import type { GlobalFilterCustomOption } from './types'

export type GlobalFilterCustomBodyProps = {
  option: GlobalFilterCustomOption
  value: unknown
  onChange: (next: unknown) => void
  goBack: () => void
}

const GlobalFilterCustomBody = (props: GlobalFilterCustomBodyProps) => {
  const { option, value, onChange, goBack } = props

  return option.render({
    value,
    setValue: onChange,
    goBack,
  })
}

export default GlobalFilterCustomBody
