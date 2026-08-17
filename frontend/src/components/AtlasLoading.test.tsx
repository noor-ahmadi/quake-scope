import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AtlasLoading } from './AtlasLoading'

afterEach(cleanup)

describe('AtlasLoading', () => {
  it('holds the atlas footprint while the map engine arrives', () => {
    render(<AtlasLoading eventCount={37} />)

    const status = screen.getByRole('status', { name: 'Loading earthquake map' })
    expect(within(status).getByRole('heading', { name: 'Live atlas' })).toBeInTheDocument()
    expect(within(status).getByText('37', { selector: '.map-count b' })).toBeInTheDocument()
    expect(within(status).getByText('Plotting field observations.')).toBeInTheDocument()
  })
})
