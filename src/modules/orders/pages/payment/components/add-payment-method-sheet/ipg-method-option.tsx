import Image from 'next/image'

import MethodOptionFrame from './method-option-frame'

type IpgMethodOptionProps = {
  selected: boolean
  onSelect: () => void
}

const IpgMethodOption = (props: IpgMethodOptionProps) => {
  const { selected, onSelect } = props

  return (
    <MethodOptionFrame selected={selected} onSelect={onSelect}>
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center">
          <Image
            src="/images/banks/behpardakht.svg"
            alt="درگاه آنلاین"
            width={40}
            height={40}
            className="size-10 object-contain"
          />
        </div>

        <p className="typo-title-x-small text-text-primary">درگاه آنلاین</p>
      </div>
    </MethodOptionFrame>
  )
}

export default IpgMethodOption
