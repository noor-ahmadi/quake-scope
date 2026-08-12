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

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <section className="filter-panel" aria-label="Earthquake filters">
      <div className="search-field">
        <SearchIcon />
        <label className="sr-only" htmlFor="place-filter">
          Search locations
        </label>
        <input
          id="place-filter"
          type="search"
          placeholder="Search a place or region"
          value={filters.place}
          onChange={(event) => update('place', event.target.value)}
        />
      </div>

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

      <label className="select-field">
        <span>Magnitude</span>
        <select
          value={filters.minMagnitude}
          onChange={(event) => update('minMagnitude', event.target.value)}
        >
          <option value="">Any magnitude</option>
          <option value="2.5">M 2.5+</option>
          <option value="4.5">M 4.5+</option>
          <option value="6">M 6.0+</option>
        </select>
      </label>

      <label className="select-field">
        <span>Status</span>
        <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
          <option value="">Any status</option>
          <option value="automatic">Automatic</option>
          <option value="reviewed">Reviewed</option>
          <option value="deleted">Deleted</option>
        </select>
      </label>

      <label className="toggle-filter">
        <input
          type="checkbox"
          checked={filters.tsunamiOnly}
          onChange={(event) => update('tsunamiOnly', event.target.checked)}
        />
        <span className="toggle-track" aria-hidden="true">
          <span />
        </span>
        <WaveIcon />
        <span>Tsunami</span>
      </label>

      {isFiltered && (
        <button className="clear-filters" type="button" onClick={() => onChange(DEFAULT_FILTERS)}>
          Reset
        </button>
      )}
    </section>
  )
}
