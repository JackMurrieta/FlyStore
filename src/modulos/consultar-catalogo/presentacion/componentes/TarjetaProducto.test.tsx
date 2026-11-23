import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CatalogoMapper } from '../../aplicacion/mappers/CatalogoMapper'
import { tarjeta } from '../../pruebas/fixturesCatalogo'
import { TarjetaProducto } from './TarjetaProducto'

const pintar = (idColorDestacado: number | null) => render(<MemoryRouter>
  <TarjetaProducto producto={CatalogoMapper.aProductoTarjetaTs(tarjeta(10, '9FORTY LA Dodgers', { idColorDestacado }))} />
</MemoryRouter>)

describe('TarjetaProducto', () => {
  it('sin filtro de color abre la ficha sin color y muestra la foto general', () => {
    const { container } = pintar(null)
    expect(screen.getByRole('link', { name: /9FORTY LA Dodgers/ })).toHaveAttribute('href', '/producto/10')
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://img.test/10.webp')
    expect(screen.getByRole('button', { name: 'Ver en Azul' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('al filtrar por color abre en ese color y lo lleva a la ficha', async () => {
    const { container } = pintar(2)
    expect(screen.getByRole('link', { name: /9FORTY LA Dodgers/ })).toHaveAttribute('href', '/producto/10?color=2')
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://img.test/10-azul.webp')
    expect(screen.getByRole('button', { name: 'Ver en Azul' })).toHaveAttribute('aria-pressed', 'true')
    // Elegir otro color sigue funcionando sobre el destacado.
    await userEvent.setup().click(screen.getByRole('button', { name: 'Ver en Negro' }))
    expect(screen.getByRole('link', { name: /9FORTY LA Dodgers/ })).toHaveAttribute('href', '/producto/10?color=1')
  })
})
