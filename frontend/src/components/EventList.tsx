import type { Earthquake } from '../types'
import {
  formatCount,
  formatMagnitude,
  formatRelativeTime,
  magnitudeTone,
} from '../format'

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
          <span className="eyebrow">Ledger 02 / latest first</span>
          <h2>Recent events</h2>
        </div>
        <span className="result-count"><b>{formatCount(total)}</b> in survey</span>
      </div>

      {earthquakes.length > 0 ? (
        <>
          <div className="ledger-columns" aria-hidden="true">
            <span>No.</span>
            <span>Mag.</span>
            <span>Location / coordinates</span>
            <span>Observed</span>
          </div>
          <div className="event-list">
            {earthquakes.map((earthquake, index) => (
              <button
                className={`event-row ${selectedId === earthquake.usgsId ? 'is-selected' : ''}`}
                type="button"
                key={earthquake.usgsId}
                onClick={() => onSelect(earthquake)}
                aria-pressed={selectedId === earthquake.usgsId}
              >
                <span className="ledger-index">{String(index + 1).padStart(2, '0')}</span>
                <span className={`magnitude-badge magnitude-badge--${magnitudeTone(earthquake.magnitude)}`}>
                  <strong>{formatMagnitude(earthquake.magnitude).replace('M ', '')}</strong>
                  <small>MAG</small>
                </span>
                <span className="event-copy">
                  <strong>{earthquake.place ?? 'Unknown location'}</strong>
                  <span>
                    {earthquake.latitude.toFixed(2)}, {earthquake.longitude.toFixed(2)}
                    <i aria-hidden="true">/</i>
                    D {earthquake.depthKm.toFixed(1)} km
                  </span>
                </span>
                <span className="event-time">
                  {formatRelativeTime(earthquake.occurredAt)}
                  {earthquake.tsunami && <small className="tsunami-tag">Tsunami</small>}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-rings" aria-hidden="true" />
          <strong>No earthquakes found</strong>
          <p>Try a wider time range or remove one of the active filters.</p>
        </div>
      )}

      {total > earthquakes.length && (
        <p className="list-limit-note">
          Ledger shows the newest {earthquakes.length} of {formatCount(total)} matching events.
        </p>
      )}
    </section>
  )
}
