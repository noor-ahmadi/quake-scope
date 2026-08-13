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
        <div className="detail-empty-copy">
          <span className="eyebrow">Dossier 03 / waiting for a mark</span>
          <h2>Pick a mark from the atlas.</h2>
          <p>
            Select a map marker or ledger row to pin its depth, coordinates, review status,
            and original USGS record here.
          </p>
          <span className="detail-empty-note">Map marker / ledger row</span>
        </div>
      </section>
    )
  }

  const reportedMagnitude = formatMagnitude(earthquake.magnitude).replace(/^M\s*/, '')
  const alertTone = earthquake.alert?.toLowerCase()

  return (
    <section
      className="panel detail-panel detail-panel--filled"
      aria-label={`Details for ${earthquake.place ?? earthquake.usgsId}`}
    >
      <header className="detail-header">
        <div>
          <div className="detail-register-line">
            <span className="eyebrow">Dossier 03 / selected record</span>
            <span className="detail-record-id">{earthquake.usgsId}</span>
          </div>
          <h2>{earthquake.place ?? 'Unknown location'}</h2>
          <p>Observed {formatDateTime(earthquake.occurredAt)}</p>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close event details">
          <CloseIcon />
        </button>
      </header>

      <div className="detail-body">
        <div className={`detail-magnitude detail-magnitude--${magnitudeTone(earthquake.magnitude)}`}>
          <span className="detail-magnitude-label">Magnitude</span>
          <strong>{reportedMagnitude}</strong>
          <small>USGS reported</small>
        </div>

        <div className="detail-readings">
          <div className="detail-section-label" aria-hidden="true">
            <span>Field readings</span>
            <b>01-04</b>
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
              <dd>
                {earthquake.alert ? (
                  <span className={`alert-chip alert-chip--${alertTone}`}>{earthquake.alert}</span>
                ) : 'None'}
              </dd>
            </div>
          </dl>

          <div className="coordinate-block">
            <MapPinIcon />
            <span>
              <small>Epicenter / decimal degrees</small>
              <strong>
                {coordinate(earthquake.latitude, 'N', 'S')} / {coordinate(earthquake.longitude, 'E', 'W')}
              </strong>
            </span>
          </div>
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

        <div className="detail-source">
          <span>Source record / United States Geological Survey</span>
          <a className="usgs-link" href={earthquake.detailUrl} target="_blank" rel="noreferrer">
            Open original event
            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </section>
  )
}
