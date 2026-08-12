import type { EarthquakeSummary } from '../types'
import { formatCount, formatDecimal, formatMagnitude, formatRelativeTime } from '../format'
import { ActivityIcon, DepthIcon, WaveIcon } from './Icons'

interface SummaryCardsProps {
  summary: EarthquakeSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section className="summary-grid" aria-label="Earthquake summary">
      <article className="metric-card metric-card--events">
        <div className="metric-icon">
          <ActivityIcon />
        </div>
        <div>
          <span>Events in view</span>
          <strong>{formatCount(summary.totalEvents)}</strong>
          <small>
            {summary.latestOccurredAt
              ? `Latest ${formatRelativeTime(summary.latestOccurredAt)}`
              : 'No matching activity'}
          </small>
        </div>
        <div className="mini-wave" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </article>

      <article className="metric-card">
        <div className="metric-label-row">
          <span>Strongest</span>
          <span className="metric-chip">Peak</span>
        </div>
        <strong>{formatMagnitude(summary.maximumMagnitude)}</strong>
        <small className="truncate">
          {summary.strongestEarthquake?.place ?? 'No magnitude reported'}
        </small>
      </article>

      <article className="metric-card">
        <div className="metric-icon metric-icon--depth">
          <DepthIcon />
        </div>
        <div>
          <span>Average depth</span>
          <strong>{formatDecimal(summary.averageDepthKm, ' km')}</strong>
          <small>Below the surface</small>
        </div>
      </article>

      <article className="metric-card">
        <div className="metric-icon metric-icon--wave">
          <WaveIcon />
        </div>
        <div>
          <span>Tsunami flags</span>
          <strong>{formatCount(summary.tsunamiEvents)}</strong>
          <small>
            {summary.totalEvents > 0
              ? `${((summary.tsunamiEvents / summary.totalEvents) * 100).toFixed(1)}% of events`
              : 'No matching activity'}
          </small>
        </div>
      </article>
    </section>
  )
}
