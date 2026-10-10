export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  title: string
  items: FAQItem[]
}

export type FAQCategoryId =
  | 'about'
  | 'delivery'
  | 'returns'
  | 'order'
  | 'tracking'
  | 'personal-info'
