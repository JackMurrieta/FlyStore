import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SesionProvider, type EstadoSesionTs, type ISesion, type RolTs } from '@compartido/sesion'
import { ResumenTiendaModel } from '../aplicacion/ResumenTiendaModel'
import { PanelTienda } from './PanelTienda'
import { InicioPanelView } from './vistas/InicioPanelView'
import { ProximamenteView } from './vistas/ProximamenteView'

function abrir(ruta: string, rol: RolTs = 'ADMIN', pagos = 2) {
  const estado: EstadoSesionTs = { estado: 'autenticado', usuario: { id: 1, nombre: 'Luis Castillo', correo: 'l@fly.mx', telefono: null, rol, perfilCompleto: true, iniciales: 'LC' } }
  const cerrarSesion = vi.fn().mockResolvedValue(undefined)
  const sesion: ISesion = { obtenerEstado: () => estado, suscribir: () => () => {}, iniciarConGoogle: vi.fn(), cerrarSesion }
  const resumen = new ResumenTiendaModel({
    obtenerPagosPorConfirmar: vi.fn().mockResolvedValue(Array.from({ length: pagos }, (_, id) => ({ id }))),
    obtenerProductosPorEstado: vi.fn(async estadoProducto => ({ productos: estadoProducto === 'BORRADOR' ? [{}, {}, {}] : [], hayMas: false })),
  })
  render(<MemoryRouter initialEntries={[ruta]}><SesionProvider sesion={sesion}><Routes>
    <Route path="/" element={<p>Tienda</p>} />
    <Route path="/admin" element={<PanelTienda modelos={{ resumen }} />}>
      <Route index element={<InicioPanelView />} />
      <Route path="catalogo" element={<h1>Catálogo</h1>} />
      <Route path="empleados" element={<ProximamenteView seccion="empleados" />} />
      <Route path="inventario" element={<ProximamenteView seccion="inventario" />} />
    </Route>
  </Routes></SesionProvider></MemoryRouter>)
  return { user: userEvent.setup(), cerrarSesion, resumen }
}

describe('Panel «Administrar tienda»', () => {
  it('reúne las secciones en la barra lateral, con «Pronto» y el contador de pagos', async () => {
    abrir('/admin')
    const nav = screen.getByRole('navigation', { name: 'Secciones del panel' })
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(await within(nav).findByRole('link', { name: /^Pedidos.*2 pagos por confirmar/ })).toHaveAttribute('href', '/admin/pedidos')
    expect(within(nav).getByRole('link', { name: /Códigos de descuento\s*Pronto/ })).toHaveAttribute('href', '/admin/codigos-descuento')
    expect(within(nav).getByRole('link', { name: /Empleados/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hola, Luis' })).toBeInTheDocument()
  })

  it('el Inicio muestra los pendientes y lleva al catálogo filtrado', async () => {
    abrir('/admin')
    const borradores = (await screen.findByRole('heading', { name: 'Productos en borrador' })).closest('article') ?? document.body
    expect(await within(borradores as HTMLElement).findByText('3')).toBeInTheDocument()
    expect(within(borradores as HTMLElement).getByRole('link', { name: /Ver borradores/ })).toHaveAttribute('href', '/admin/catalogo?estado=BORRADOR')
    expect(screen.getByRole('link', { name: /Nuevo producto/ })).toHaveAttribute('href', '/admin/catalogo/nuevo')
  })

  it('el empleado no ve Empleados y si entra por URL vuelve al Inicio', async () => {
    abrir('/admin/empleados', 'EMPLEADO')
    expect(await screen.findByRole('heading', { name: 'Hola, Luis' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Empleados/ })).not.toBeInTheDocument()
  })

  it('una sección «Pronto» explica lo que incluirá y las migas dicen dónde estás', () => {
    abrir('/admin/inventario')
    expect(screen.getByRole('heading', { level: 1, name: 'Inventario' })).toBeInTheDocument()
    const migas = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    expect(within(migas).getByRole('link', { name: 'Panel' })).toHaveAttribute('href', '/admin')
    expect(within(migas).getByText('Inventario')).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('Inventario · Panel FLY')
  })

  it('el menú del celular se abre y se cierra con Escape devolviendo el foco', async () => {
    const { user } = abrir('/admin/catalogo')
    const boton = screen.getByRole('button', { name: 'Abrir menú del panel' })
    await user.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveFocus()
  })

  it('cerrar sesión limpia las cifras y lleva a la tienda', async () => {
    const { user, cerrarSesion, resumen } = abrir('/admin')
    await screen.findByRole('link', { name: /^Pedidos.*2 pagos por confirmar/ })
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(cerrarSesion).toHaveBeenCalled()
    expect(await screen.findByText('Tienda')).toBeInTheDocument()
    expect(resumen.obtenerEstado().resumen).toBeNull()
  })
})
