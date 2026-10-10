# Artemis Test Implementation Progress Tracker

This document tracks the execution phases, setup checklists, and progress of implementing tests in the Artemis codebase.

---

## 📊 Overall Progress

- [x] **Phase 1: Foundation & Unit Testing Setup** (100%)
- [x] **Phase 2: UI Integration & Component Testing** (100%)
- [x] **Phase 3: E2E & Mobile Layout Validation** (100%)

---

## 🛠️ Phase 1: Foundation & Unit Testing Setup

**Goal:** Setup Vitest test runner, configure import aliases, and write the first suite of unit tests.

- [x] **1.1. Install Vitest Dependencies**
  - Install `vitest`, `@vitejs/plugin-react`, and `jsdom` as devDependencies.
- [x] **1.2. Configure Vitest**
  - Create `vitest.config.ts` matching Next.js alias paths mapping to `src/`.
  - Add test scripts (`pnpm test`, `pnpm test:watch`) to [package.json](file:///Users/farzin/Projects/AllBox/Artemis/package.json).
- [x] **1.3. Set Up Global Setup File**
  - Create `vitest.setup.ts` to extend jest-dom matchers.
- [x] **1.4. Write Helper Unit Tests**
  - Test digit converter helpers in [numbers/index.ts](file:///Users/farzin/Projects/AllBox/Artemis/src/utils/numbers/index.ts).
  - Test validation regex rules in `src/constants/regex.ts`.

---

## 🧪 Phase 2: UI Integration & Component Testing

**Goal:** Configure React Testing Library, enable Orval MSW handlers, and test custom design-system slots.

- [x] **2.1. Install Component Testing Dependencies**
  - Install `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`.
- [x] **2.2. Enable Orval MSW Mocking**
  - Add `mock: true` to the configuration blocks in [orval.config.ts](file:///Users/farzin/Projects/AllBox/Artemis/orval.config.ts).
  - Run Orval generation script to generate `.msw.ts` handlers.
- [x] **2.3. Setup MSW Server**
  - Configure MSW interceptor server in `vitest.setup.ts`.
- [x] **2.4. Write Custom Render Wrapper**
  - Implement a `renderWithProviders` helper to wrap components in TanStack Query + Jotai providers.
- [x] **2.5. Write Component Integration Tests**
  - Test slot-based layouts and price calculation states in [PriceTag.tsx](file:///Users/farzin/Projects/AllBox/Artemis/src/components/PriceTag/PriceTag.tsx).

---

## 📱 Phase 3: E2E & Mobile Layout Validation

**Goal:** Set up Playwright for mobile viewport emulation, configure auth mocks, and check for RTL horizontal layout overflows.

- [x] **3.1. Install Playwright**
  - Install `@playwright/test` and run browser installation scripts.
- [x] **3.2. Configure Playwright Mobile Emulators**
  - Setup Playwright configurations to emulate iOS (Mobile Safari) and Android (Mobile Chrome) viewports.
  - Set default test boundaries to match the `.w-app` constraint (`448px` max-width).
- [x] **3.3. Write Auth E2E Tests**
  - Simulate OTP receipt, validation success, redirect, and state updates.
- [x] **3.4. Implement Visual Regression Testing**
  - Capture page screenshots and establish visual baselines to prevent layout regressions on mobile.
