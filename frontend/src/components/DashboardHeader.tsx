import { ActivityIcon, RefreshIcon } from './Icons'
import { formatRelativeTime } from '../format'

interface DashboardHeaderProps {
  health: 'UP' | 'DOWN' | 'UNKNOWN'
  loadedAt: Date | null
  refreshing: boolean
  onRefresh: () => void
}

export function DashboardHeader({ health, loadedAt, refreshing, onRefresh }: DashboardHeaderProps) {
  const statusLabel = health === 'UP' ? 'Live system' : health === 'DOWN' ? 'API unavailable' : 'Connecting'

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Quake Scope home">
        <span className="brand-mark">
          <ActivityIcon />
        </span>
        <span>
          <strong>Quake Scope</strong>
          <small>Global seismic monitor</small>
        </span>
      </a>

      <div className="header-actions">
        <div
          className={`system-status system-status--${health.toLowerCase()}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="status-dot" />
          <span>
            <strong>{statusLabel}</strong>
            <small>{loadedAt ? `Updated ${formatRelativeTime(loadedAt)}` : 'Waiting for data'}</small>
          </span>
        </div>
        <button
          className="refresh-button"
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-busy={refreshing}
        >
          <RefreshIcon className={refreshing ? 'is-spinning' : ''} />
          <span>{refreshing ? 'Syncing…' : 'Sync now'}</span>
        </button>
      </div>
    </header>
  )
}
