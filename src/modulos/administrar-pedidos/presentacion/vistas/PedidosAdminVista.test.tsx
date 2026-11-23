import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PedidosAdminModel } from '../../aplicacion/PedidosAdminModel'
import type { IPedidosAdminService } from '../../dominio/puertos/IPedidosAdminService'
import type { PedidoResumenTs } from '../../dominio/PedidoResumenTs'
import PedidosAdminVista from './PedidosAdminVista'

// La vista toma el modelo del contenedor: cada prueba pone aquí el suyo
const referencia = vi.hoisted(() => ({ model: null as unknown }))

vi.mock('@app/contenedor', () => ({
  contenedor: {
    get pedidosAdminModel() {
      return referencia.model
    },
  },
}))

const enPreparacion: PedidoResumenTs = {
  folio: 'FLY-000128',
  fechaCreacion: new Date('2026-11-20T08:00:00-07:00'),
  clienteNombre: 'Ana Torres',
  clienteTelefono: '644 123 4567',
  total: 420,
  metodoPago: 'TRANSFERENCIA',
  estado: 'PREPARACION',
  fechaLimite: null,
}

function crearServicio(totalEncontrado = 1): IPedidosAdminService {
  return {
    listar: vi.fn().mockResolvedValue({ pedidos: [enPreparacion], totalEncontrado }),
    obtenerDetalle: vi.fn(),
    registrarPagoEfectivo: vi.fn(),
    aprobarPago: vi.fn(),
    rechazarComprobante: vi.fn(),
    actualizarEstado: vi.fn(),
  }
}

async function abrirLista(servicio: IPedidosAdminService) {
  referencia.model = new PedidosAdminModel(servicio)
  const usuario = userEvent.setup()
  render(
    <MemoryRouter>
      <PedidosAdminVista />
    </MemoryRouter>
  )
  await screen.findByText('FLY-000128')
  return usuario
}

describe('PedidosAdminVista', () => {
  it('muestra el estado «En preparación» y lo ofrece como filtro', async () => {
    const servicio = crearServicio()
    const usuario = await abrirLista(servicio)

    expect(screen.getAllByText('En preparación').length).toBeGreaterThan(1)
    await usuario.click(screen.getByRole('button', { name: 'En preparación' }))

    await waitFor(() =>
      expect(servicio.listar).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'PREPARACION', pagina: 1 }))
    )
  })

  it('filtra por rango de fechas con días locales y limita «Hasta» a partir de «Desde»', async () => {
    const servicio = crearServicio()
    await abrirLista(servicio)

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-19' } })
    await waitFor(() =>
      expect(servicio.listar).toHaveBeenLastCalledWith(expect.objectContaining({ desde: new Date(2026, 10, 19), hasta: null }))
    )
    expect(screen.getByLabelText('Hasta')).toHaveAttribute('min', '2026-11-19')

    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-20' } })
    await waitFor(() =>
      expect(servicio.listar).toHaveBeenLastCalledWith(
        expect.objectContaining({ desde: new Date(2026, 10, 19), hasta: new Date(2026, 10, 20), pagina: 1 })
      )
    )
  })

  it('pagina de 50 en 50 con los mismos filtros', async () => {
    const servicio = crearServicio(120)
    const usuario = await abrirLista(servicio)

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

    await usuario.click(screen.getByRole('button', { name: 'Siguiente' }))

    await waitFor(() => expect(screen.getByText('Página 2 de 3')).toBeInTheDocument())
    expect(servicio.listar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 2 }))
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()
  })

  it('con una sola página no muestra la paginación', async () => {
    await abrirLista(crearServicio(1))

    expect(screen.queryByRole('navigation', { name: 'Páginas de pedidos' })).not.toBeInTheDocument()
  })
})
