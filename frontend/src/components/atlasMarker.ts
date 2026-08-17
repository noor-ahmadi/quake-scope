import { divIcon, type DivIcon } from 'leaflet'
import { formatMagnitude, magnitudeTone, markerRadius } from '../format'

export function atlasMarkerSize(magnitude: number | null): number {
  return Math.round(Math.max(18, markerRadius(magnitude) * 2 + 2))
}

export function createAtlasMarkerIcon(magnitude: number | null, selected: boolean): DivIcon {
  const tone = magnitudeTone(magnitude)
  const coreSize = atlasMarkerSize(magnitude)
  const footprint = coreSize + (selected ? 20 : 8)
  const magnitudeLabel = formatMagnitude(magnitude)

  return divIcon({
    className: `atlas-marker-host atlas-marker-host--${tone}${selected ? ' is-selected' : ''}`,
    html: `
      <span class="atlas-marker" style="--atlas-marker-size: ${coreSize}px" aria-hidden="true">
        <i class="atlas-marker__ring"></i>
        <i class="atlas-marker__pulse"></i>
        <i class="atlas-marker__core"></i>
        ${selected ? `<b class="atlas-marker__label">${magnitudeLabel}</b>` : ''}
      </span>
    `,
    iconAnchor: [footprint / 2, footprint / 2],
    iconSize: [footprint, footprint],
    tooltipAnchor: [0, -(coreSize / 2 + 8)],
  })
}
