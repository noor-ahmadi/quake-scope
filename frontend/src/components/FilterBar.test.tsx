import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS } from '../types'
import { FilterBar } from './FilterBar'

describe('FilterBar', () => {
  it('emits an updated time range', () => {
    const onChange = vi.fn()
    render(<FilterBar filters={DEFAULT_FILTERS} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '7 days' }))

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, timeRange: '7d' })
  })

  it('can reset an active filter set', () => {
    const onChange = vi.fn()
    render(
      <FilterBar
        filters={{ ...DEFAULT_FILTERS, minMagnitude: '4.5', tsunamiOnly: true }}
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS)
  })
})
