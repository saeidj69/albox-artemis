/**
 * Temporary storefront-presentation kill-switch (billboard, banner grids,
 * scallop header, product-cart countdown, extra slider backgrounds). Remove
 * after those ship.
 * Wired through next.config.ts `env` — changing this requires a rebuild.
 */
export function isPageBuilderPresentationsEnabled(): boolean {
  return process.env.ENABLE_PAGE_BUILDER_PRESENTATIONS === 'true'
}
