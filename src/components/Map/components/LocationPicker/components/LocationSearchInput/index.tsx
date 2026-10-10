import { FC, Fragment, useRef, useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Location, Routing, SearchNormal } from 'iconsax-reactjs'
import { cloneDeep } from 'lodash'
import { useDebouncedValue } from 'rooks'

import { MapViewState } from '@/components/Map/types'

import { useListMapAreas } from '@/api/functions/map'
import { useSearchAddresses } from '@/api/functions/mapsi/search'
import type { MapMapArea, MapMapAreaBase } from '@/api/models'
import { MapMapAreaType } from '@/api/models'
import type { SearchAddress, SearchSuccessResponse } from '@/api/models/mapsi'

import Divider from '@/lib/Divider'
import { cn } from '@/lib/utils'

import SearchItem from './components/SearchItem'

interface LocationSearchInputProps {
  onSelectLocation?: (value: MapViewState) => void
}

const SEARCH_ITEM_SKELETON_COUNT = 6
const MIN_SEARCH_QUERY_LENGTH = 2
const MAX_CITY_RESULTS = 3

const SEARCHABLE_AREA_TYPES: MapMapAreaType[] = [
  MapMapAreaType.province,
  MapMapAreaType.city,
]

const getAddressKey = (address: SearchAddress, index: number) =>
  `${address.location?.latitude}-${address.location?.longitude}-${index}`

/** «استان گیلان، شهر رشت» — the province/city chain with type labels. */
const formatAreaSubtitle = (area: MapMapArea) => {
  const chain = [...area.ancestors, area]

  const province = chain.find(
    (part) => part.type.value === MapMapAreaType.province,
  )
  const city = chain.find((part) => part.type.value === MapMapAreaType.city)

  return [province, city]
    .filter((part): part is MapMapAreaBase => part != null)
    .map((part) => `${part.type.label} ${part.name}`)
    .join('، ')
}

const LocationSearchInput: FC<LocationSearchInputProps> = (props) => {
  const { onSelectLocation } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestionsRef] = useAutoAnimate()

  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, 300)

  const trimmedQuery = debouncedQuery?.trim()
  const hasMinQueryLength = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH

  const onFocusInput = () => {
    inputRef.current?.focus()
  }

  const { data: cityAreas, isPending: isCitySearchPending } = useListMapAreas(
    { query: trimmedQuery || undefined },
    { query: { enabled: hasMinQueryLength } },
  )

  const { data: mapsiResults = [], isPending: isAddressSearchPending } =
    useSearchAddresses(
      {
        query: trimmedQuery,
      },
      {
        query: {
          enabled: hasMinQueryLength,
          select(data) {
            return (data.data as SearchSuccessResponse).addresses ?? []
          },
        },
      },
    )

  const isPending =
    hasMinQueryLength && (isCitySearchPending || isAddressSearchPending)

  const cityResults = (cityAreas?.mapAreas ?? [])
    .filter((area) => SEARCHABLE_AREA_TYPES.includes(area.type.value))
    .slice(0, MAX_CITY_RESULTS)

  const cityItems = cityResults.map((item) => ({
    key: String(item.id),
    title: item.name,
    subtitle: formatAreaSubtitle(item),
    onSelect: () => {
      if (!item.representativePoint) return
      onSelectLocation?.({
        zoom: 14,
        latitude: item.representativePoint.latitude,
        longitude: item.representativePoint.longitude,
      })
      setQuery('')
    },
  }))

  const mapsiItems = mapsiResults.map((item, index) => ({
    key: getAddressKey(item, index),
    title: item.title ?? '',
    subtitle: item.subtitle ?? '',
    onSelect: () => {
      if (!item.location?.latitude || !item.location?.longitude) return
      onSelectLocation?.({
        zoom: 14,
        latitude: item.location.latitude,
        longitude: item.location.longitude,
      })
      setQuery('')
    },
  }))

  const suggestionItems = [
    ...cityItems.map((item) => {
      return { ...item, type: 'city' }
    }),

    ...mapsiItems.map((item) => {
      const temp = cloneDeep(item)

      if (temp?.subtitle?.trim()?.endsWith('،')) {
        temp.subtitle = temp?.subtitle?.trim()?.slice(0, -1)
      }

      return { ...temp, type: 'address' }
    }),
  ]

  return (
    <div className="bg-background-main rounded-brand p-3 shadow-xs">
      <div onClick={onFocusInput} className="flex items-center gap-2">
        <SearchNormal className="text-text-secondary" />

        <input
          ref={inputRef}
          placeholder="جست‌وجوی استان، شهر یا خیابان"
          className={cn(
            'caret-secondary-500 typo-body-small placeholder:typo-body-small w-full outline-none',
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div
        className={cn(
          'h-[50vh] overflow-hidden overflow-y-auto transition-all duration-200',
          hasMinQueryLength ? 'mt-2 max-h-full' : 'mt-0 h-0 max-h-0',
        )}
      >
        <Divider className="my-2" />

        <div ref={suggestionsRef} className="flex h-full flex-col">
          {isPending &&
            Array.from({ length: SEARCH_ITEM_SKELETON_COUNT }, (_, index) => (
              <Fragment key={index}>
                <SearchItem.Skeleton withSubtitle withIcon />
                {index !== SEARCH_ITEM_SKELETON_COUNT - 1 && (
                  <Divider className="my-2" />
                )}
              </Fragment>
            ))}

          {suggestionItems.length > 0 &&
            suggestionItems.map((item, index) => (
              <Fragment key={item.key}>
                <SearchItem
                  icon={
                    item.type === 'city' ? (
                      <Routing className="text-primary-600" />
                    ) : (
                      <Location className="text-primary-600" />
                    )
                  }
                  onClick={item.onSelect}
                  title={item.title}
                  subtitle={item.subtitle}
                />
                {index !== suggestionItems.length - 1 && (
                  <Divider className="my-2" />
                )}
              </Fragment>
            ))}

          {debouncedQuery && !isPending && suggestionItems.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="typo-label-medium text-text-primary">
                چیزی پیدا نکردیم :/{' '}
              </div>
              <p className="typo-body-small text-text-secondary mt-2">
                نتیجه‌ای برای جست‌وجوی شما پیدا نشد.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationSearchInput
