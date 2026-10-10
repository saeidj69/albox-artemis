'use client'

import PreparedRowRenderer from '../pages/prepared/components/PreparedRowRenderer'

/**
 * The discovery module's public surface for rendering a single page-builder
 * row (full-bleed band, row/column styles, widget dispatch).
 *
 * Screens outside this module — the categories and brands tabs — weave builder
 * rows into their own grids, so they need the row renderer without depending on
 * the prepared page's private component tree.
 */
const PreparedWidgetRow = PreparedRowRenderer

export default PreparedWidgetRow
