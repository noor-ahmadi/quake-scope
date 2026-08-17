import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import type { Earthquake } from '../types'
import { formatMagnitude, formatRelativeTime, magnitudeTone } from '../format'
import { createAtlasMarkerIcon } from './atlasMarker'

interface EarthquakeMapProps {
  earthquakes: Earthquake[]
  selectedId: string | null
  onSelect: (earthquake: Earthquake) => void
}

function MapViewport({ earthquakes }: { earthquakes: Earthquake[] }) {
  const map = useMap()
  const eventKey = earthquakes.map((event) => event.usgsId).join('|')

  useEffect(() => {
    if (earthquakes.length === 0) return

    if (earthquakes.length === 1) {
      map.flyTo([earthquakes[0].latitude, earthquakes[0].longitude], 5, { duration: 0.6 })
      return
    }

    const bounds = latLngBounds(earthquakes.map((event) => [event.latitude, event.longitude]))
    map.fitBounds(bounds.pad(0.12), { animate: true, duration: 0.6, maxZoom: 6 })
  }, [earthquakes, eventKey, map])

  return null
}

interface AtlasObservationProps {
  earthquake: Earthquake
  index: number
  selected: boolean
  onSelect: (earthquake: Earthquake) => void
}

function AtlasObservation({ earthquake, index, selected, onSelect }: AtlasObservationProps) {
  const icon = useMemo(
    () => createAtlasMarkerIcon(earthquake.magnitude, selected),
    [earthquake.magnitude, selected],
  )
  const tone = magnitudeTone(earthquake.magnitude)
  const magnitudeLabel = formatMagnitude(earthquake.magnitude)

  return (
    <Marker
      position={[earthquake.latitude, earthquake.longitude]}
      icon={icon}
      title={`${magnitudeLabel} — ${earthquake.place ?? 'Unknown location'}`}
      zIndexOffset={selected ? 1000 : 0}
      riseOnHover
      eventHandlers={{ click: () => onSelect(earthquake) }}
    >
      <Tooltip
        key={selected ? 'locked' : 'hover'}
        className="atlas-tooltip"
        direction="auto"
        opacity={1}
        permanent={selected}
      >
        <span className="atlas-tooltip__register">
          <small>Observation {String(index + 1).padStart(2, '0')}</small>
          <b>{tone}</b>
        </span>
        <strong>{magnitudeLabel}</strong>
        <span>{earthquake.place ?? 'Unknown location'}</span>
        <small>
          {formatRelativeTime(earthquake.occurredAt)} / depth {earthquake.depthKm.toFixed(1)} km
        </small>
      </Tooltip>
    </Marker>
  )
}

export function EarthquakeMap({ earthquakes, selectedId, onSelect }: EarthquakeMapProps) {
  return (
    <section className="panel map-panel" aria-label="Earthquake map">
      <div className="panel-heading map-heading">
        <div>
          <span className="eyebrow">Plate 01 / global plot</span>
          <h2>Live atlas</h2>
        </div>
        <span className="map-count"><b>{earthquakes.length}</b> events plotted</span>
      </div>

      <div className="map-shell">
        <MapContainer
          className="quake-map"
          center={[20, 0]}
          zoom={2}
          minZoom={0}
          maxZoom={12}
          scrollWheelZoom
          worldCopyJump
          preferCanvas
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewport earthquakes={earthquakes} />
          {earthquakes.map((earthquake, index) => (
            <AtlasObservation
              key={earthquake.usgsId}
              earthquake={earthquake}
              index={index}
              selected={earthquake.usgsId === selectedId}
              onSelect={onSelect}
            />
          ))}
        </MapContainer>

        {earthquakes.length === 0 && (
          <div className="map-empty">
            <span>No events match this view</span>
            <small>Broaden the filters to repopulate the map.</small>
          </div>
        )}

        <div className="map-legend" aria-label="Magnitude legend">
          <span><i className="legend-dot legend-dot--minor" /> Under 3.0</span>
          <span><i className="legend-dot legend-dot--moderate" /> 3.0–4.4</span>
          <span><i className="legend-dot legend-dot--strong" /> 4.5–5.9</span>
          <span><i className="legend-dot legend-dot--major" /> 6.0+</span>
        </div>

        <div className="map-instruction" aria-hidden="true">Drag to survey / scroll to zoom</div>
      </div>
    </section>
  )
}
