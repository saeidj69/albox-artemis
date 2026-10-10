import { type FC, useMemo } from 'react'

import { getSuggestions } from '@/modules/wallet/utils/suggestions'

type SuggestionChipsProps = {
  inputValue: string
  onSelect: (value: number) => void
}

const SuggestionChips: FC<SuggestionChipsProps> = ({
  inputValue,
  onSelect,
}) => {
  const suggestions = useMemo(() => getSuggestions(inputValue), [inputValue])

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.value}
          type="button"
          onClick={() => onSelect(suggestion.value)}
          className="rounded-brand text-primary-600 typo-label-medium h-10 cursor-pointer border-0 bg-gray-200 px-4 transition-colors duration-200 active:scale-95"
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  )
}

export default SuggestionChips
