import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
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

const editorialEase = [0.22, 1, 0.36, 1] as const

const heroSequence: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.08, staggerChildren: 0.12 },
  },
}

const heroReveal: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: editorialEase },
  },
}

const contourReveal: Variants = {
  hidden: { opacity: 0, scale: 0.88, rotate: -18 },
  visible: {
    opacity: 0.16,
    scale: 1,
    rotate: -12,
    transition: { duration: 1.35, ease: editorialEase },
  },
}

const dashboardSequence: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.04, staggerChildren: 0.11 },
  },
}

const dashboardReveal: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: editorialEase },
  },
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
    <motion.div
      className="loading-dashboard"
      aria-label="Loading earthquake data"
      role="status"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: editorialEase }}
    >
      <div className="loading-orbit">
        <span />
        <ActivityIcon />
      </div>
      <strong>Reading the latest seismic activity</strong>
      <span>Connecting to Quake Scope…</span>
    </motion.div>
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
        <motion.section
          className="hero"
          variants={heroSequence}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-copy" variants={heroReveal}>
            <span className="hero-kicker"><i /> USGS / global seismic catalog</span>
            <h1>The earth<br /><em>does not hold still.</em></h1>
          </motion.div>
          <motion.div className="hero-aside" variants={heroReveal}>
            <span className="hero-index">Field note / QS—001</span>
            <p>
              A live atlas of recent earthquakes, drawn from the USGS catalog and preserved in
              Quake Scope's own queryable history.
            </p>
            <div className="hero-scale" aria-hidden="true">
              <span /><span /><span /><span /><span />
              <b>24H survey</b>
            </div>
          </motion.div>
          <motion.div className="hero-contours" aria-hidden="true" variants={contourReveal}>
            <span /><span /><span /><span />
          </motion.div>
        </motion.section>

        <motion.div
          className="filter-motion-shell"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.3, ease: editorialEase }}
        >
          <FilterBar filters={filters} onChange={handleFiltersChange} />
        </motion.div>

        {loading && snapshot && <div className="loading-line" aria-label="Updating results"><span /></div>}

        {error && snapshot && (
          <motion.div
            className="error-banner"
            role="alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: editorialEase }}
          >
            <AlertIcon />
            <span><strong>Update interrupted</strong>{error}</span>
            <button type="button" onClick={() => setReloadToken((value) => value + 1)}>Try again</button>
          </motion.div>
        )}

        {!snapshot && loading && <LoadingDashboard />}

        {!snapshot && !loading && (
          <motion.div
            className="fatal-state"
            role="alert"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: editorialEase }}
          >
            <span><AlertIcon /></span>
            <h2>Quake Scope could not reach its data service</h2>
            <p>{error ?? 'Check the API and database, then try again.'}</p>
            <button type="button" onClick={() => setReloadToken((value) => value + 1)}>
              <RefreshIcon /> Retry connection
            </button>
          </motion.div>
        )}

        {snapshot && (
          <motion.div
            className="dashboard-sections"
            variants={dashboardSequence}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={dashboardReveal}>
              <SummaryCards summary={snapshot.summary} />
            </motion.div>

            <motion.div variants={dashboardReveal}>
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
            </motion.div>

            <motion.div variants={dashboardReveal}>
              <div className="secondary-grid">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    className="detail-motion-shell"
                    key={selectedEarthquake?.usgsId ?? 'empty-dossier'}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: editorialEase }}
                  >
                    <EventDetail earthquake={selectedEarthquake} onClose={() => setSelectedId(null)} />
                  </motion.div>
                </AnimatePresence>
                <IngestionPanel runs={snapshot.ingestionRuns.content} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>

      <footer>
        <span><ActivityIcon /> Quake Scope</span>
        <p>Earthquake observations are sourced from the U.S. Geological Survey.</p>
        <a href="https://earthquake.usgs.gov/" target="_blank" rel="noreferrer">USGS Earthquake Hazards Program</a>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast toast--${toast.tone}`}
            role="status"
            initial={{ opacity: 0, y: 18, rotate: -0.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: editorialEase }}
          >
            {toast.tone === 'success' ? <CheckIcon /> : <AlertIcon />}
            <span>{toast.text}</span>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
