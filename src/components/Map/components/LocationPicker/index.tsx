import { FC, useEffect, useMemo, useRef, useState } from 'react'

import * as turf from '@turf/turf'
import { Layer, MapRef, Source, ViewState } from '@vis.gl/react-maplibre'

import Map from '@/components/Map'

import { useCheckPostalCodeLocation } from '@/api/functions/map'
import { GeoJsonMultiPolygon } from '@/api/models'

import { MapViewState } from '../../types'
import LocationSearchInput from './components/LocationSearchInput'
import MyLocationButton from './components/MyLocationButton'

interface LocationPickerProps {
  initialViewState: MapViewState
  onViewStateChange?: (viewState: MapViewState | null) => void
  onMovingChange?: (isMoving: boolean) => void
  customPinText?: string
  postalCode: string | null
}

const isValidZoom = (zoom: number) => {
  return zoom >= 15
}

const isPointInPolygon = (
  point: MapViewState,
  polygon: GeoJsonMultiPolygon,
) => {
  const pointCoordinates = [point.longitude, point.latitude]

  return turf.booleanPointInPolygon(pointCoordinates, polygon)
}

const getCenterOfPolygon = (polygon: GeoJsonMultiPolygon) => {
  return turf.centerOfMass(polygon)
}

const LocationPicker: FC<LocationPickerProps> = (props) => {
  const {
    initialViewState,
    onViewStateChange,
    onMovingChange,
    customPinText,
    postalCode,
  } = props

  const mapRef = useRef<MapRef>(null)

  const {
    data: checkPostalCodeLocationData,
    mutateAsync: checkPostalCodeLocation,
    isPending: postalCodePolygonLoading,
  } = useCheckPostalCodeLocation({
    request: { skipErrorToast: true },
  })

  const postalCodePolygon = checkPostalCodeLocationData?.locationCheck?.polygon

  const [internalViewState, setInternalViewState] = useState<ViewState>({
    ...initialViewState,
    pitch: 0,
    bearing: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  })

  const pinText = useMemo(() => {
    if (!internalViewState?.zoom) return ''

    if (internalViewState.zoom < 15) {
      return 'لطفا بیشتر زوم کنید'
    }

    if (
      postalCodePolygon &&
      isPointInPolygon(internalViewState, postalCodePolygon)
    ) {
      return 'این موقعیت با کد پستی همخوانی دارد'
    }

    return customPinText
  }, [internalViewState, customPinText, postalCodePolygon])

  useEffect(() => {
    if (isValidZoom(internalViewState.zoom)) {
      onViewStateChange?.(internalViewState)
    } else {
      onViewStateChange?.(null)
    }
  }, [internalViewState, onViewStateChange])

  const flyTo = (viewState: MapViewState) => {
    mapRef.current?.flyTo({
      zoom: viewState.zoom,
      center: [viewState.longitude, viewState.latitude],
    })
  }

  const fetchPostalCodePolygon = async () => {
    if (postalCode) {
      const res = await checkPostalCodeLocation({
        data: {
          postalCode: postalCode,
          latitude: initialViewState?.latitude,
          longitude: initialViewState?.longitude,
        },
      })

      if (res) {
        const center = getCenterOfPolygon(res.locationCheck.polygon)

        flyTo({
          longitude: center.geometry.coordinates[0],
          latitude: center.geometry.coordinates[1],
          zoom: 14,
        })
      }
    }
  }

  useEffect(() => {
    fetchPostalCodePolygon()
  }, [postalCode])

  return (
    <div className="relative size-full">
      <div className="absolute top-3 right-3 left-3 z-20">
        <LocationSearchInput onSelectLocation={flyTo} />
      </div>

      <Map
        ref={mapRef}
        pin={{ text: pinText, loading: postalCodePolygonLoading }}
        initialViewState={internalViewState}
        onMoveStart={() => {
          onMovingChange?.(true)
        }}
        onMoveEnd={(e) => {
          onMovingChange?.(false)
          setInternalViewState(e.viewState)
        }}
      >
        {postalCodePolygon && (
          <Source id="my-data" type="geojson" data={postalCodePolygon}>
            <Layer
              id="my-data-layer"
              type="fill"
              paint={{ 'fill-color': '#11a64a45' }}
            />
          </Source>
        )}
      </Map>

      <div className="absolute right-3 bottom-3 left-3 z-20">
        <MyLocationButton onClick={flyTo} />
      </div>
    </div>
  )
}

export default LocationPicker
