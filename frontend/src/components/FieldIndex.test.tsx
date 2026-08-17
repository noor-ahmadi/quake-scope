import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FieldIndex } from './FieldIndex'

afterEach(cleanup)

describe('FieldIndex', () => {
  it('links every chapter of the dashboard', () => {
    render(<FieldIndex />)

    const index = screen.getByRole('navigation', { name: 'Field index' })
    const links = screen.getAllByRole('link')

    expect(index).toBeInTheDocument()
    expect(links).toHaveLength(5)
    expect(screen.getByRole('link', { name: '00 Cover' })).toHaveAttribute('href', '#cover')
    expect(screen.getByRole('link', { name: '04 Dossiers' })).toHaveAttribute('href', '#dossiers')
    expect(screen.getByRole('link', { name: '00 Cover' })).toHaveAttribute('aria-current', 'location')

    fireEvent.click(screen.getByRole('link', { name: '03 Atlas' }))

    expect(screen.getByRole('link', { name: '03 Atlas' })).toHaveAttribute('aria-current', 'location')
  })
})
