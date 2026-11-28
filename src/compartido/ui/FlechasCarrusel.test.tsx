import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlechasCarrusel } from './FlechasCarrusel'

describe('FlechasCarrusel', () => {
  it('pinta «anterior» y «siguiente» como hijas directas del contenedor y avisa el clic', async () => {
    const alAnterior = vi.fn()
    const alSiguiente = vi.fn()
    const { container } = render(
      <div data-testid="contenedor">
        <FlechasCarrusel alAnterior={alAnterior} alSiguiente={alSiguiente} etiquetaAnterior="Foto anterior" etiquetaSiguiente="Foto siguiente" tamano="mediano" />
      </div>
    )
    const contenedor = screen.getByTestId('contenedor')
    expect(Array.from(contenedor.children).every((hija) => hija.tagName === 'BUTTON')).toBe(true)
    expect(container.querySelectorAll('button')).toHaveLength(2)

    await userEvent.click(screen.getByRole('button', { name: 'Foto anterior' }))
    await userEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }))
    expect(alAnterior).toHaveBeenCalledTimes(1)
    expect(alSiguiente).toHaveBeenCalledTimes(1)
  })
})
