import { formatPrice } from '@/utils/numbers'

type Suggestion = {
  label: string
  value: number
}

const defaultSuggestions: Suggestion[] = [
  { label: `${formatPrice(5_000_000)} تومان`, value: 5_000_000 },
  { label: `${formatPrice(10_000_000)} تومان`, value: 10_000_000 },
  { label: `${formatPrice(15_000_000)} تومان`, value: 15_000_000 },
]

export const getSuggestions = (input: string): Suggestion[] => {
  if (!input || input === '0') {
    return defaultSuggestions
  }

  const base = parseInt(input, 10)
  if (isNaN(base) || base <= 0) {
    return defaultSuggestions
  }

  return [
    {
      label: `${formatPrice(base * 1_000)} تومان`,
      value: base * 1_000,
    },
    {
      label: `${formatPrice(base * 1_000_000)} تومان`,
      value: base * 1_000_000,
    },
    {
      label: `${formatPrice(base * 10_000_000)} تومان`,
      value: base * 10_000_000,
    },
  ]
}
