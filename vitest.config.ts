import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura'],
      exclude: ['src/api/**', '**/*.config.*', '**/*.d.ts', '.next/**'],
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 60,
        branches: 55,
      },
    },
  },
})
