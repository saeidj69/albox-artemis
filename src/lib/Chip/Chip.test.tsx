import { describe, expect, test } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import Chip from './Chip'

describe('Chip component', () => {
  test('renders content string correctly', () => {
    render(<Chip content="برچسب ارسال رایگان" />)

    expect(screen.getByText('برچسب ارسال رایگان')).toBeInTheDocument()
  })

  test('renders start and end elements when provided', () => {
    render(
      <Chip
        content="برچسب ویژه"
        start={<span data-testid="chip-start">●</span>}
        end={<span data-testid="chip-end">×</span>}
      />,
    )

    expect(screen.getByTestId('chip-start')).toBeInTheDocument()
    expect(screen.getByTestId('chip-end')).toBeInTheDocument()
  })
})
