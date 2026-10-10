import { FC, useState } from 'react'

import {
  Map as MapLibreMap,
  ViewStateChangeEvent,
} from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

import Spinner from '@/lib/Spinner'
import { cn } from '@/lib/utils'

import { MapProps } from './types'

const MAP_STYLE_URL = '/map/style.json'
const RTL_PLUGIN_URL = '/map/mapbox-gl-rtl-text.js'

// const TEMP_STYLE =
//   'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const Map: FC<MapProps> = ({ ref, ...props }) => {
  const [isMoving, setIsMoving] = useState(false)

  const handleMoveEnd = (e: ViewStateChangeEvent) => {
    setIsMoving(false)

    props.onMoveEnd?.(e)
  }

  const handleMoveStart = (e: ViewStateChangeEvent) => {
    setIsMoving(true)

    props.onMoveStart?.(e)
  }

  const getTooltipWidth = () => {
    let value = 0

    if (props.pin?.loading) {
      value += 4
    }

    if (props.pin?.text) {
      value = props.pin?.text?.length + 4
    }

    return Math.max(6, value) + 'ch'
  }

  return (
    <div className="bg-background-darker size-full">
      <MapLibreMap
        ref={ref}
        attributionControl={false}
        RTLTextPlugin={RTL_PLUGIN_URL}
        // mapStyle={TEMP_STYLE ?? MAP_STYLE_URL}
        mapStyle={MAP_STYLE_URL}
        {...props}
        onMoveEnd={handleMoveEnd}
        onMoveStart={handleMoveStart}
      />

      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center',
          props.pin?.size === 'small' && 'scale-75',
          props.pin?.size === 'medium' && 'size-100',
        )}
      >
        <div
          className={cn(
            'relative flex -translate-y-4 flex-col items-center justify-center',
          )}
        >
          <div
            className={cn(
              'absolute z-10 duration-100',
              isMoving && '-translate-y-4',
            )}
          >
            <div
              className={cn(
                'border-secondary-400 bg-primary-600 size-6 overflow-hidden rounded-full border-2',
                'absolute bottom-7 left-1/2 -translate-x-1/2 transition-all duration-200',
                'typo-body-small flex h-full w-8 items-center justify-center whitespace-nowrap text-white',
              )}
              style={{
                width: getTooltipWidth(),
              }}
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-1">
                {props?.pin?.text && <span>{props?.pin?.text}</span>}
                {props.pin?.loading && (
                  <span>
                    <Spinner size="medium" />
                  </span>
                )}
              </div>
            </div>

            <div className="h-8 w-1 rounded-full bg-gray-500" />
          </div>

          <div
            className={cn(
              'absolute -bottom-6 z-0 -mt-2 size-4 rounded-full bg-black/40 backdrop-blur-md',
              'scale-y-50 duration-100',
              isMoving && 'scale-x-200 bg-black/20',
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default Map
