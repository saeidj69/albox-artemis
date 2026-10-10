import { type FC } from 'react'

import { englishDigits, formatPrice, onlyDigits } from '@/utils/numbers'

import Input from '@/lib/Input'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
}

const AmountInput: FC<AmountInputProps> = ({ value, onChange }) => {
  const displayValue = value ? formatPrice(Number(value)) : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = onlyDigits(englishDigits(e.target.value))
    onChange(raw)
  }

  return (
    <Input
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      end={
        <span className="text-text-secondary typo-body-small whitespace-nowrap">
          تومان
        </span>
      }
    />
  )
}

export default AmountInput
