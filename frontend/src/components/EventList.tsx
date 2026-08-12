import type { Earthquake } from '../types'
import {
  formatCount,
  formatMagnitude,
  formatRelativeTime,
  magnitudeTone,
} from '../format'
import { DepthIcon, MapPinIcon } from './Icons'

interface EventListProps {
  earthquakes: Earthquake[]
  total: number
  selectedId: string | null
  onSelect: (earthquake: Earthquake) => void
}

export function EventList({ earthquakes, total, selectedId, onSelect }: EventListProps) {
  return (
    <section className="panel event-panel" aria-label="Recent earthquakes">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Latest first</span>
          <h2>Event stream</h2>
        </div>
        <span className="result-count">{formatCount(total)} results</span>
      </div>

      {earthquakes.length > 0 ? (
        <div className="event-list">
          {earthquakes.map((earthquake) => (
            <button
              className={`event-row ${selectedId === earthquake.usgsId ? 'is-selected' : ''}`}
              type="button"
              key={earthquake.usgsId}
              onClick={() => onSelect(earthquake)}
              aria-pressed={selectedId === earthquake.usgsId}
            >
              <span className={`magnitude-badge magnitude-badge--${magnitudeTone(earthquake.magnitude)}`}>
                {formatMagnitude(earthquake.magnitude).replace('M ', '')}
                <small>MAG</small>
              </span>
              <span className="event-copy">
                <strong>{earthquake.place ?? 'Unknown location'}</strong>
                <span>
                  <MapPinIcon />
                  {earthquake.latitude.toFixed(2)}, {earthquake.longitude.toFixed(2)}
                  <i aria-hidden="true" />
                  <DepthIcon />
                  {earthquake.depthKm.toFixed(1)} km
                </span>
              </span>
              <span className="event-time">
                {formatRelativeTime(earthquake.occurredAt)}
                {earthquake.tsunami && <small className="tsunami-tag">Tsunami</small>}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-rings" aria-hidden="true" />
          <strong>No earthquakes found</strong>
          <p>Try a wider time range or remove one of the active filters.</p>
        </div>
      )}

      {total > earthquakes.length && (
        <p className="list-limit-note">
          Showing the newest {earthquakes.length} of {formatCount(total)} matching events.
        </p>
      )}
    </section>
  )
}
