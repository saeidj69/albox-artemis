'use client'

import { RiSearchLine } from '@remixicon/react'

import Input from '@/lib/Input'

type BrandsSearchProps = {
  value: string
  onValueChange: (value: string) => void
}

const BrandsSearch = ({ value, onValueChange }: BrandsSearchProps) => {
  return (
    <Input
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder="جست‌وجوی برند"
      start={<RiSearchLine className="text-text-secondary size-5" />}
      classNames={{
        content: 'border-border-main shadow-sm',
        input: 'typo-body-small',
      }}
    />
  )
}

export default BrandsSearch
