'use client'

import { useMemo } from 'react'

import type { ListingHydratedBlankGridPage } from '@/api/models'

import { useHomeDataPopulate } from '../hooks/use-home-data-populate'
import { buildRowsFromStructure } from '../utils/build-rows-from-structure'
import { normalizeHydratedRows } from '../utils/normalize-rows'
import PreparedRowRenderer from './PreparedRowRenderer'

type PreparedBlankGridPageContentProps = {
  page: ListingHydratedBlankGridPage
  isHome: boolean
}

const PreparedBlankGridPageContent = (
  props: PreparedBlankGridPageContentProps,
) => {
  const { page, isHome } = props

  const rows = useMemo(
    () =>
      normalizeHydratedRows(
        buildRowsFromStructure(page.structure, page.widgets),
      ),
    [page.structure, page.widgets],
  )

  const displayRows = useHomeDataPopulate(rows, { enabled: isHome })

  return (
    <div className="flex flex-col gap-4">
      {displayRows.map((row, index) => (
        <PreparedRowRenderer row={row} index={index} key={row.trackingId} />
      ))}
    </div>
  )
}

export default PreparedBlankGridPageContent
