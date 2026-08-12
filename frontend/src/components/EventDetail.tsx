import type { Earthquake } from '../types'
import {
  coordinate,
  formatDateTime,
  formatMagnitude,
  humanizeEnum,
  magnitudeTone,
} from '../format'
import { ActivityIcon, CloseIcon, ExternalLinkIcon, MapPinIcon, WaveIcon } from './Icons'

interface EventDetailProps {
  earthquake: Earthquake | null
  onClose: () => void
}

export function EventDetail({ earthquake, onClose }: EventDetailProps) {
  if (!earthquake) {
    return (
      <section className="panel detail-panel detail-panel--empty" aria-label="Event details">
        <span className="detail-target" aria-hidden="true">
          <i />
          <i />
          <ActivityIcon />
        </span>
        <div>
          <span className="eyebrow">Inspect an event</span>
          <h2>Select a map marker or stream entry</h2>
          <p>Coordinates, depth, review status, and the original USGS report will appear here.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="panel detail-panel" aria-label={`Details for ${earthquake.place ?? earthquake.usgsId}`}>
      <div className="detail-header">
        <div>
          <span className="eyebrow">Selected event · {earthquake.usgsId}</span>
          <h2>{earthquake.place ?? 'Unknown location'}</h2>
          <p>{formatDateTime(earthquake.occurredAt)}</p>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close event details">
          <CloseIcon />
        </button>
      </div>

      <div className="detail-body">
        <div className={`detail-magnitude detail-magnitude--${magnitudeTone(earthquake.magnitude)}`}>
          <span>{formatMagnitude(earthquake.magnitude)}</span>
          <small>Magnitude</small>
        </div>

        <dl className="detail-grid">
          <div>
            <dt>Depth</dt>
            <dd>{earthquake.depthKm.toFixed(1)} km</dd>
          </div>
          <div>
            <dt>Significance</dt>
            <dd>{earthquake.significance}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd><span className="soft-chip">{humanizeEnum(earthquake.status)}</span></dd>
          </div>
          <div>
            <dt>Alert</dt>
            <dd>{earthquake.alert ? <span className={`alert-chip alert-chip--${earthquake.alert}`}>{earthquake.alert}</span> : 'None'}</dd>
          </div>
        </dl>

        <div className="coordinate-block">
          <MapPinIcon />
          <span>
            <small>Epicenter</small>
            <strong>
              {coordinate(earthquake.latitude, 'N', 'S')} · {coordinate(earthquake.longitude, 'E', 'W')}
            </strong>
          </span>
        </div>

        {earthquake.tsunami && (
          <div className="tsunami-notice">
            <WaveIcon />
            <span>
              <strong>Tsunami flag reported</strong>
              <small>Refer to official regional warnings for actionable guidance.</small>
            </span>
          </div>
        )}

        <a className="usgs-link" href={earthquake.detailUrl} target="_blank" rel="noreferrer">
          Open original USGS event
          <ExternalLinkIcon />
        </a>
      </div>
    </section>
  )
}
