import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS } from '../types'
import { FilterBar } from './FilterBar'

afterEach(cleanup)

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

    expect(screen.getByText('02', { selector: '.filter-register b' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS)
  })

  it('keeps every query instrument accessible', () => {
    const onChange = vi.fn()
    render(<FilterBar filters={DEFAULT_FILTERS} onChange={onChange} />)

    fireEvent.change(screen.getByRole('searchbox', { name: 'Place / region' }), {
      target: { value: 'Alaska' },
    })
    fireEvent.change(screen.getByLabelText('Magnitude floor'), { target: { value: '4.5' } })
    fireEvent.change(screen.getByLabelText('Review status'), { target: { value: 'reviewed' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show tsunami events only' }))

    expect(onChange).toHaveBeenNthCalledWith(1, { ...DEFAULT_FILTERS, place: 'Alaska' })
    expect(onChange).toHaveBeenNthCalledWith(2, { ...DEFAULT_FILTERS, minMagnitude: '4.5' })
    expect(onChange).toHaveBeenNthCalledWith(3, { ...DEFAULT_FILTERS, status: 'reviewed' })
    expect(onChange).toHaveBeenNthCalledWith(4, { ...DEFAULT_FILTERS, tsunamiOnly: true })
  })
})
