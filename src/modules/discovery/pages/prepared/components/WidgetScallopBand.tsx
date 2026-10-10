import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { WIDGET_HEADER_SVG_PATH } from '../utils/widget-header'

type WidgetScallopBandProps = {
  color: string
  className?: string
}

const maskStyle = (color: string): CSSProperties => ({
  width: '100%',
  height: '100%',
  backgroundColor: color,
  WebkitMaskImage: `url('${WIDGET_HEADER_SVG_PATH}')`,
  maskImage: `url('${WIDGET_HEADER_SVG_PATH}')`,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
})

const WidgetScallopBand = (props: WidgetScallopBandProps) => {
  const { color, className } = props

  return (
    <div
      aria-hidden
      data-slot="widget-scallop-band"
      className={cn(className)}
      style={maskStyle(color)}
    />
  )
}

export default WidgetScallopBand
