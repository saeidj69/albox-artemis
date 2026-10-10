import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { beforeAll, afterEach, afterAll } from 'vitest'

// jsdom ships no matchMedia, so any component reading a media query (e.g. the
// reduced-motion check in CashbackBadge) throws. Tests that care about a query
// still stub it themselves; this is only the "no preference" baseline.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

// Initialize MSW server
export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
