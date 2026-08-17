import type { EarthquakeFilters, TimeRange } from '../types'
import { DEFAULT_FILTERS } from '../types'
import { SearchIcon, WaveIcon } from './Icons'

interface FilterBarProps {
  filters: EarthquakeFilters
  onChange: (filters: EarthquakeFilters) => void
}

const timeRanges: Array<{ value: TimeRange; label: string }> = [
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All data' },
]

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = <Key extends keyof EarthquakeFilters>(key: Key, value: EarthquakeFilters[Key]) => {
    onChange({ ...filters, [key]: value })
  }

  const activeFilterCount = [
    filters.place !== DEFAULT_FILTERS.place,
    filters.timeRange !== DEFAULT_FILTERS.timeRange,
    filters.minMagnitude !== DEFAULT_FILTERS.minMagnitude,
    filters.status !== DEFAULT_FILTERS.status,
    filters.tsunamiOnly !== DEFAULT_FILTERS.tsunamiOnly,
  ].filter(Boolean).length
  const isFiltered = activeFilterCount > 0

  return (
    <section className={`filter-panel${isFiltered ? ' is-filtered' : ''}`} aria-label="Earthquake filters">
      <header className="filter-register">
        <span><i /> Survey controls / query plate</span>
        <span><b>{String(activeFilterCount).padStart(2, '0')}</b> adjustments active</span>
      </header>

      <div className="filter-grid">
        <div className="filter-control filter-control--search">
          <label className="control-label" htmlFor="place-filter">
            <b aria-hidden="true">01</b>
            <span>Place / region</span>
          </label>
          <div className="search-field">
            <SearchIcon />
            <input
              id="place-filter"
              type="search"
              placeholder="Locate an observation"
              value={filters.place}
              onChange={(event) => update('place', event.target.value)}
            />
          </div>
        </div>

        <div className="filter-control filter-control--time">
          <span className="control-label">
            <b aria-hidden="true">02</b>
            <span>Observation window</span>
          </span>
          <div className="range-switch" role="group" aria-label="Time range">
            {timeRanges.map((range) => (
              <button
                className={filters.timeRange === range.value ? 'is-active' : ''}
                type="button"
                key={range.value}
                onClick={() => update('timeRange', range.value)}
                aria-pressed={filters.timeRange === range.value}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <label className="filter-control filter-control--magnitude select-field" htmlFor="magnitude-filter">
          <span className="control-label">
            <b aria-hidden="true">03</b>
            <span>Magnitude floor</span>
          </span>
          <span className="select-input">
            <select
              id="magnitude-filter"
              aria-label="Magnitude floor"
              value={filters.minMagnitude}
              onChange={(event) => update('minMagnitude', event.target.value)}
            >
              <option value="">Any magnitude</option>
              <option value="2.5">M 2.5+</option>
              <option value="4.5">M 4.5+</option>
              <option value="6">M 6.0+</option>
            </select>
          </span>
        </label>

        <label className="filter-control filter-control--status select-field" htmlFor="status-filter">
          <span className="control-label">
            <b aria-hidden="true">04</b>
            <span>Review status</span>
          </span>
          <span className="select-input">
            <select
              id="status-filter"
              aria-label="Review status"
              value={filters.status}
              onChange={(event) => update('status', event.target.value)}
            >
              <option value="">Any status</option>
              <option value="automatic">Automatic</option>
              <option value="reviewed">Reviewed</option>
              <option value="deleted">Deleted</option>
            </select>
          </span>
        </label>

        <label
          className={`filter-control filter-control--tsunami toggle-filter${filters.tsunamiOnly ? ' is-active' : ''}`}
        >
          <span className="control-label">
            <b aria-hidden="true">05</b>
            <span>Tsunami flag</span>
          </span>
          <span className="toggle-action">
            <input
              aria-label="Show tsunami events only"
              type="checkbox"
              checked={filters.tsunamiOnly}
              onChange={(event) => update('tsunamiOnly', event.target.checked)}
            />
            <span className="toggle-track" aria-hidden="true"><span /></span>
            <WaveIcon />
            <span>Flagged only</span>
          </span>
        </label>

        <div className="filter-control filter-control--reset">
          {isFiltered ? (
            <button
              className="clear-filters"
              type="button"
              aria-label="Reset"
              onClick={() => onChange(DEFAULT_FILTERS)}
            >
              <span>Reset plate</span>
              <small>Return to 24h</small>
            </button>
          ) : (
            <span className="filter-default">
              <i />
              <span>Plate ready</span>
              <small>24h default</small>
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
