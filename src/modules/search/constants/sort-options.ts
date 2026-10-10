export const SEARCH_SORT_OPTIONS = [
  { value: 'relevance', label: 'مرتبط ترین' },
  { value: 'price:asc', label: 'ارزان ترین' },
  { value: 'price:desc', label: 'گران ترین' },
  { value: 'discount:desc', label: 'بیشترین درصد تخفیف' },
  { value: 'popularity:desc', label: 'محبوب ترین' },
] as const

export type SearchSortOptionValue =
  (typeof SEARCH_SORT_OPTIONS)[number]['value']
