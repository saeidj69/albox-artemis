import { FC } from 'react'

import { useGeolocation } from '@/hooks/useGeolocation'
import { Gps } from 'iconsax-reactjs'

import { MapViewState } from '@/components/Map/types'

import Button from '@/lib/Button'

interface MyLocationButtonProps {
  onClick: (location: MapViewState) => void
}

const MyLocationButton: FC<MyLocationButtonProps> = (props) => {
  const { onClick } = props

  const { getPosition, isLoading: isGpsLoading } = useGeolocation()

  return (
    <Button
      startIcon={<Gps />}
      variant="text"
      classNames={{ root: 'bg-background-main shadow-xs' }}
      onClick={() => {
        getPosition((location) => {
          onClick({
            latitude: location.latitude,
            longitude: location.longitude,
            zoom: 15,
          })
        })
      }}
      loading={isGpsLoading}
    >
      موقعیت من
    </Button>
  )
}

export default MyLocationButton
