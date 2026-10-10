import { beforeEach, describe, expect, test, vi } from 'vitest'

import { render, screen } from '@/utils/test-utils'

import ExplorePreparedContent from './ExplorePreparedContent'

const useGetPreparedPage = vi.fn()

let location = { latitude: 35.7, longitude: 51.4 }
let isLocationLoading = false

vi.mock('@/modules/addresses/hooks', () => ({
  useLocation: () => ({ location, isLoading: isLocationLoading }),
}))

vi.mock('@/api/functions/clients-page', () => ({
  useGetPreparedPage: (...args: unknown[]) => useGetPreparedPage(...args),
}))

vi.mock(
  '@/modules/discovery/pages/prepared/components/PreparedPageContentRenderer',
  () => ({
    default: ({ page, isHome }: { page: { id: number }; isHome: boolean }) => (
      <div data-testid="prepared-content" data-home={String(isHome)}>
        {page.id}
      </div>
    ),
  }),
)

// The real skeletons pull in Embla, which needs `matchMedia` (absent in jsdom).
// This component only owns *whether* they render, not how they look.
vi.mock(
  '@/modules/discovery/pages/prepared/components/widgets/BannerWidget',
  () => ({
    default: { Skeleton: () => <div data-testid="banner-skeleton" /> },
  }),
)

vi.mock(
  '@/modules/discovery/pages/prepared/components/widgets/ProductsCartWidget',
  () => ({
    default: { Skeleton: () => <div data-testid="products-skeleton" /> },
  }),
)

describe('ExplorePreparedContent', () => {
  beforeEach(() => {
    location = { latitude: 35.7, longitude: 51.4 }
    isLocationLoading = false
    useGetPreparedPage.mockReset()
    useGetPreparedPage.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })
  })

  test('renders the prepared page for the resolved location', () => {
    useGetPreparedPage.mockReturnValue({
      data: { page: { id: 42 } },
      isLoading: false,
      isError: false,
    })

    render(<ExplorePreparedContent path="explore" />)

    expect(useGetPreparedPage).toHaveBeenCalledWith(
      { path: 'explore', latitude: 35.7, longitude: 51.4 },
      expect.objectContaining({
        query: expect.objectContaining({ enabled: true }),
        request: { skipErrorToast: true },
      }),
    )

    const content = screen.getByTestId('prepared-content')
    expect(content).toHaveTextContent('42')
    // Surena injection stays home-only.
    expect(content).toHaveAttribute('data-home', 'false')
  })

  test('renders nothing when no page exists at the path', () => {
    useGetPreparedPage.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    const { container } = render(<ExplorePreparedContent path="explore" />)

    expect(screen.queryByTestId('prepared-content')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
    // A missing page is an empty state, so the request opts out of the toast.
    expect(useGetPreparedPage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ request: { skipErrorToast: true } }),
    )
  })

  test('shows skeletons and holds the request until location resolves', () => {
    isLocationLoading = true

    render(<ExplorePreparedContent path="explore" />)

    expect(useGetPreparedPage).toHaveBeenCalledWith(
      expect.objectContaining(location),
      expect.objectContaining({
        query: expect.objectContaining({ enabled: false }),
      }),
    )
    expect(screen.getByTestId('banner-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('products-skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('prepared-content')).not.toBeInTheDocument()
  })
})
