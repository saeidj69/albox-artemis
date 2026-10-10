'use client'

import { RiSearchLine } from '@remixicon/react'

import { englishDigits } from '@/utils/numbers'

import Input from '@/lib/Input'

type OrdersSearchProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

const OrdersSearch = ({
  value,
  onValueChange,
  placeholder = 'جست‌وجوی شماره مرسوله',
}: OrdersSearchProps) => {
  return (
    <Input
      value={value}
      onChange={(event) => onValueChange(englishDigits(event.target.value))}
      placeholder={placeholder}
      inputMode="numeric"
      start={<RiSearchLine className="text-text-secondary size-5" />}
      classNames={{
        content: 'border-border-main shadow-sm',
        input: 'typo-body-small',
      }}
    />
  )
}

export default OrdersSearch
