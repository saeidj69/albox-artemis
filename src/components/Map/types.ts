import {
  MapProps as MapLibreMapProps,
  MapRef,
  ViewState,
} from '@vis.gl/react-maplibre'

export type MapProps = MapLibreMapProps & {
  pin?: {
    size?: 'small' | 'medium'
    text?: string
    loading?: boolean
  }
  ref?: React.Ref<MapRef>
}

export type MapViewState = Pick<ViewState, 'latitude' | 'longitude' | 'zoom'>
