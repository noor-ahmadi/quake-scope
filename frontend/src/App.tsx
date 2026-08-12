import { useEffect, useMemo, useState } from 'react'
import { ApiError, fetchDashboard, refreshFeed } from './api'
import type { DashboardSnapshot, Earthquake, EarthquakeFilters } from './types'
import { DEFAULT_FILTERS } from './types'
import { DashboardHeader } from './components/DashboardHeader'
import { EarthquakeMap } from './components/EarthquakeMap'
import { EventDetail } from './components/EventDetail'
import { EventList } from './components/EventList'
import { FilterBar } from './components/FilterBar'
import { IngestionPanel } from './components/IngestionPanel'
import { SummaryCards } from './components/SummaryCards'
import { ActivityIcon, AlertIcon, CheckIcon, RefreshIcon } from './components/Icons'

interface ToastMessage {
  tone: 'success' | 'error'
  text: string
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debounced
}

function LoadingDashboard() {
  return (
    <div className="loading-dashboard" aria-label="Loading earthquake data" role="status">
      <div className="loading-orbit">
        <span />
        <ActivityIcon />
      </div>
      <strong>Reading the latest seismic activity</strong>
      <span>Connecting to Quake Scope…</span>
    </div>
  )
}

export default function App() {
  const [filters, setFilters] = useState<EarthquakeFilters>(DEFAULT_FILTERS)
  const debouncedFilters = useDebouncedValue(filters, 250)
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async (showLoading: boolean) => {
      if (showLoading) setLoading(true)
      try {
        const nextSnapshot = await fetchDashboard(debouncedFilters)
        if (!cancelled) {
          setSnapshot(nextSnapshot)
          setError(null)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load earthquake data.')
        }
      } finally {
        if (!cancelled && showLoading) setLoading(false)
      }
    }

    void load(true)
    const pollingInterval = window.setInterval(() => void load(false), 60_000)

    return () => {
      cancelled = true
      window.clearInterval(pollingInterval)
    }
  }, [debouncedFilters, reloadToken])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 5_000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const selectedEarthquake = useMemo(
    () => snapshot?.earthquakes.content.find((earthquake) => earthquake.usgsId === selectedId) ?? null,
    [selectedId, snapshot],
  )

  const selectEarthquake = (earthquake: Earthquake) => {
    setSelectedId(earthquake.usgsId)
    window.requestAnimationFrame(() => {
      document.querySelector('.detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  const handleFiltersChange = (nextFilters: EarthquakeFilters) => {
    setSelectedId(null)
    setFilters(nextFilters)
  }

  const handleManualRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await refreshFeed()
      const nextSnapshot = await fetchDashboard(filters)
      setSnapshot(nextSnapshot)
      setError(null)
      setToast({
        tone: 'success',
        text: `Sync complete: ${result.inserted} new and ${result.updated} updated events.`,
      })
    } catch (refreshError) {
      const conflict = refreshError instanceof ApiError && refreshError.status === 409
      setToast({
        tone: 'error',
        text: conflict
          ? 'A data sync is already running. The dashboard will update when it finishes.'
          : refreshError instanceof Error
            ? refreshError.message
            : 'The manual sync could not be completed.',
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="app-shell" id="top">
      <DashboardHeader
        health={snapshot?.health ?? 'UNKNOWN'}
        loadedAt={snapshot?.loadedAt ?? null}
        refreshing={refreshing}
        onRefresh={handleManualRefresh}
      />

      <main>
        <section className="hero">
          <div>
            <span className="hero-kicker"><i /> Earth in motion</span>
            <h1>See seismic activity<br /><em>as it unfolds.</em></h1>
          </div>
          <p>
            Explore recent earthquakes around the world with live USGS data, focused analytics,
            and a pipeline that keeps its own history honest.
          </p>
        </section>

        <FilterBar filters={filters} onChange={handleFiltersChange} />

        {loading && snapshot && <div className="loading-line" aria-label="Updating results"><span /></div>}

        {error && snapshot && (
          <div className="error-banner" role="alert">
            <AlertIcon />
            <span><strong>Update interrupted</strong>{error}</span>
            <button type="button" onClick={() => setReloadToken((value) => value + 1)}>Try again</button>
          </div>
        )}

        {!snapshot && loading && <LoadingDashboard />}

        {!snapshot && !loading && (
          <div className="fatal-state" role="alert">
            <span><AlertIcon /></span>
            <h2>Quake Scope could not reach its data service</h2>
            <p>{error ?? 'Check the API and database, then try again.'}</p>
            <button type="button" onClick={() => setReloadToken((value) => value + 1)}>
              <RefreshIcon /> Retry connection
            </button>
          </div>
        )}

        {snapshot && (
          <>
            <SummaryCards summary={snapshot.summary} />

            <div className="primary-grid">
              <EarthquakeMap
                earthquakes={snapshot.earthquakes.content}
                selectedId={selectedId}
                onSelect={selectEarthquake}
              />
              <EventList
                earthquakes={snapshot.earthquakes.content}
                total={snapshot.earthquakes.page.totalElements}
                selectedId={selectedId}
                onSelect={selectEarthquake}
              />
            </div>

            <div className="secondary-grid">
              <EventDetail earthquake={selectedEarthquake} onClose={() => setSelectedId(null)} />
              <IngestionPanel runs={snapshot.ingestionRuns.content} />
            </div>
          </>
        )}
      </main>

      <footer>
        <span><ActivityIcon /> Quake Scope</span>
        <p>Earthquake observations are sourced from the U.S. Geological Survey.</p>
        <a href="https://earthquake.usgs.gov/" target="_blank" rel="noreferrer">USGS Earthquake Hazards Program</a>
      </footer>

      {toast && (
        <div className={`toast toast--${toast.tone}`} role="status">
          {toast.tone === 'success' ? <CheckIcon /> : <AlertIcon />}
          <span>{toast.text}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </div>
  )
}
