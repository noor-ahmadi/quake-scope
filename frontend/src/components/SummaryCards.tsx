import type { EarthquakeSummary } from '../types'
import { formatCount, formatDecimal, formatMagnitude, formatRelativeTime } from '../format'

interface SummaryCardsProps {
  summary: EarthquakeSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const magnitudeCoverage = summary.totalEvents > 0
    ? `${formatCount(summary.eventsWithMagnitude)} with reported magnitude`
    : 'No catalog entries in this survey'
  const tsunamiShare = summary.totalEvents > 0
    ? `${((summary.tsunamiEvents / summary.totalEvents) * 100).toFixed(1)}% of this survey`
    : 'No catalog entries in this survey'

  return (
    <section className="summary-grid" aria-label="Earthquake summary">
      <header className="summary-register">
        <span>Catalog readings <i>/</i> current filter set</span>
        <b>QS · 01—04</b>
      </header>

      <article className="metric-card metric-card--events">
        <div className="metric-topline">
          <span className="metric-index">01</span>
          <span className="metric-label">Events logged</span>
        </div>
        <strong>{formatCount(summary.totalEvents)}</strong>
        <small>
          {summary.latestOccurredAt
            ? `Latest ${formatRelativeTime(summary.latestOccurredAt)}`
            : 'No matching activity'}
        </small>
        <span className="metric-note">{magnitudeCoverage}</span>
      </article>

      <article className="metric-card metric-card--peak">
        <div className="metric-topline">
          <span className="metric-index">02</span>
          <span className="metric-label">Strongest event</span>
        </div>
        <strong>{formatMagnitude(summary.maximumMagnitude)}</strong>
        <small>
          {summary.strongestEarthquake?.place ?? 'No magnitude reported'}
        </small>
        <span className="metric-note">Peak reading</span>
      </article>

      <article className="metric-card metric-card--depth">
        <div className="metric-topline">
          <span className="metric-index">03</span>
          <span className="metric-label">Mean depth</span>
        </div>
        <strong>{formatDecimal(summary.averageDepthKm, ' km')}</strong>
        <small>Average distance below the surface</small>
        <span className="metric-note">All matching events</span>
      </article>

      <article className="metric-card metric-card--tsunami">
        <div className="metric-topline">
          <span className="metric-index">04</span>
          <span className="metric-label">Tsunami marks</span>
        </div>
        <strong>{formatCount(summary.tsunamiEvents)}</strong>
        <small>{tsunamiShare}</small>
        <span className="metric-note">Catalog flag, not a warning</span>
      </article>
    </section>
  )
}
