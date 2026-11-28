import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SesionProvider, type EstadoSesionTs, type ISesion, type RolTs } from '@compartido/sesion'
import { crearModelosCatalogo } from '../aplicacion/ModelosCatalogo'
import { CatalogoTienda } from './CatalogoTienda'
import { carritoFalso, detalleDodgers, gatewayFalso, pendientesEnMemoria } from '../pruebas/fixturesCatalogo'
import type { ProductoDetalleRespuestaDTO } from '../aplicacion/dto/ProductoDetalleRespuestaDTO'
import type { AgregadoPendienteTs } from '../dominio/puertos/IAgregadoPendiente'

function sesionCon(rol: RolTs | null): ISesion {
  const estado: EstadoSesionTs = rol
    ? { estado: 'autenticado', usuario: { id: 1, nombre: 'Ana Torres', correo: 'ana@correo.mx', telefono: null, rol, perfilCompleto: true, iniciales: 'AT' } }
    : { estado: 'anonimo', usuario: null }
  return { suscribir: () => () => {}, obtenerEstado: () => estado, iniciarConGoogle: vi.fn(), cerrarSesion: vi.fn().mockResolvedValue(undefined) }
}

function Ubicacion() {
  const { pathname, search } = useLocation()
  return <output data-testid="ubicacion">{pathname + search}</output>
}

function abrir(ruta: string, { rol = null as RolTs | null, pendiente = null as AgregadoPendienteTs | null, detalle = null as ProductoDetalleRespuestaDTO | null } = {}) {
  const gateway = gatewayFalso()
  if (detalle) vi.mocked(gateway.obtenerProducto).mockResolvedValue(detalle)
  const carrito = carritoFalso()
  const pendientes = pendientesEnMemoria(pendiente)
  const modelos = crearModelosCatalogo(gateway, carrito, pendientes)
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider sesion={sesionCon(rol)}>
        <Routes>
          <Route path="/categoria/:linea" element={<CatalogoTienda modelos={modelos} vista="marcas" />} />
          <Route path="/categoria/:linea/productos" element={<CatalogoTienda modelos={modelos} vista="catalogo" />} />
          <Route path="/buscar" element={<CatalogoTienda modelos={modelos} vista="busqueda" />} />
          <Route path="/producto/:id" element={<CatalogoTienda modelos={modelos} vista="detalle" />} />
          <Route path="*" element={<p>Otra página</p>} />
        </Routes>
        <Ubicacion />
      </SesionProvider>
    </MemoryRouter>,
  )
  return { gateway, carrito, pendientes }
}

const ubicacion = () => screen.getByTestId('ubicacion').textContent

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('B2 · Marcas de la línea (al elegir CAPS)', () => {
  it('antes del catálogo muestra las marcas de la línea y «Ver todo»', async () => {
    const { gateway } = abrir('/categoria/caps')
    expect(screen.getByRole('heading', { level: 1, name: 'Gorras' })).toBeInTheDocument()
    const newEra = await screen.findByRole('link', { name: /New Era/ })
    expect(newEra).toHaveAttribute('href', '/categoria/caps/productos?marca=1')
    expect(screen.getByRole('link', { name: /Mitchell & Ness/ })).toHaveAttribute('href', '/categoria/caps/productos?marca=2')
    expect(screen.getByRole('link', { name: /Ver todo/ })).toHaveAttribute('href', '/categoria/caps/productos')
    expect(gateway.consultarLinea).toHaveBeenCalledWith('caps', expect.objectContaining({ marcas: [] }), 0)
  })
})

describe('B3 · Catálogo y tarjeta con colores (como adidas)', () => {
  it('pinta las tarjetas con precio de referencia; sin colores no hay recuadros', async () => {
    abrir('/categoria/caps/productos?marca=1')
    const tarjeta = await screen.findByRole('article', { name: '9FORTY LA Dodgers' })
    expect(within(tarjeta).getByText('$210')).toBeInTheDocument()
    expect(within(tarjeta).getByText('MXN · Mayoreo')).toBeInTheDocument()
    expect(within(tarjeta).getByText('2 colores')).toBeInTheDocument()
    const sinColores = screen.getByRole('article', { name: '59FIFTY NY Yankees' })
    expect(within(sinColores).queryByRole('group')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'New Era' })).toBeInTheDocument()
  })

  it('hover cambia la foto al color; el clic lo fija y la ficha abre con ese color', async () => {
    abrir('/categoria/caps/productos')
    const tarjeta = await screen.findByRole('article', { name: '9FORTY LA Dodgers' })
    const foto = () => tarjeta.querySelector('img')?.getAttribute('src')
    expect(foto()).toBe('https://img.test/10.webp')

    const azul = within(tarjeta).getByRole('button', { name: 'Ver en Azul' })
    fireEvent.mouseEnter(azul)
    expect(foto()).toBe('https://img.test/10-azul.webp')
    expect(within(tarjeta).getByText('Azul')).toBeInTheDocument()
    fireEvent.mouseLeave(within(tarjeta).getByRole('group'))
    expect(foto()).toBe('https://img.test/10.webp')

    await userEvent.click(azul)
    expect(azul).toHaveAttribute('aria-pressed', 'true')
    fireEvent.mouseLeave(within(tarjeta).getByRole('group'))
    expect(foto()).toBe('https://img.test/10-azul.webp')
    expect(within(tarjeta).getByRole('link', { name: /9FORTY LA Dodgers/ })).toHaveAttribute('href', '/producto/10?color=2')
  })

  it('ordenar y filtrar viven en la URL y vuelven a consultar', async () => {
    const { gateway } = abrir('/categoria/caps/productos')
    await screen.findByRole('article', { name: '9FORTY LA Dodgers' })
    await userEvent.selectOptions(screen.getByRole('combobox'), 'PRECIO_ASC')
    await waitFor(() => expect(ubicacion()).toBe('/categoria/caps/productos?orden=PRECIO_ASC'))
    await waitFor(() => expect(gateway.consultarLinea).toHaveBeenLastCalledWith('caps', expect.objectContaining({ orden: 'PRECIO_ASC' }), 0))
    await userEvent.click(screen.getByRole('button', { name: 'Mitchell & Ness' }))
    await waitFor(() => expect(ubicacion()).toBe('/categoria/caps/productos?marca=2&orden=PRECIO_ASC'))
  })
})

describe('S1 · Búsqueda en toda la tienda', () => {
  it('A1 · en blanco no consulta y sugiere términos', async () => {
    const { gateway } = abrir('/buscar')
    expect(await screen.findByText('¿Qué estás buscando?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New Era' })).toHaveAttribute('href', '/buscar?texto=New+Era')
    expect(gateway.buscar).not.toHaveBeenCalled()
  })

  it('con texto busca en toda la tienda y permite acotar por línea', async () => {
    const { gateway } = abrir('/buscar?texto=dodgers')
    await screen.findByRole('article', { name: '9FORTY LA Dodgers' })
    expect(gateway.buscar).toHaveBeenCalledWith(expect.objectContaining({ texto: 'dodgers' }), null, 0)
    await userEvent.click(screen.getByRole('button', { name: /Gorras/ }))
    await waitFor(() => expect(ubicacion()).toBe('/buscar?texto=dodgers&linea=caps'))
    await waitFor(() => expect(gateway.buscar).toHaveBeenLastCalledWith(expect.objectContaining({ texto: 'dodgers' }), 'caps', 0))
  })
})

describe('S2 · Ficha y «Agregar al carrito»', () => {
  it('sin sesión pide iniciar sesión o crear cuenta y guarda lo elegido', async () => {
    const { carrito, pendientes } = abrir('/producto/10?color=1')
    await screen.findByRole('heading', { level: 1, name: '9FORTY LA Dodgers' })
    expect(screen.getByRole('row', { name: /Mayoreo.*Referencia/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Agregar una pieza' }))
    await userEvent.click(screen.getByRole('button', { name: /Agregar al carrito/ }))

    expect(carrito.agregar).not.toHaveBeenCalled()
    expect(pendientes.valor).toEqual({ idProducto: 10, idVariante: 101, cantidad: 2 })
    const dialogo = await screen.findByRole('dialog')
    expect(within(dialogo).getByText('Guardamos el color, la talla y las piezas que elegiste')).toBeInTheDocument()
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Iniciar sesión con correo' }))
    expect(ubicacion()).toBe(`/iniciar-sesion?redirigir=${encodeURIComponent('/producto/10?color=1&agregar=1')}`)
  })

  it('cliente: agrega al carrito (crea el pedido PENDIENTE) y ofrece «Ver carrito»', async () => {
    const { carrito } = abrir('/producto/10', { rol: 'CLIENTE' })
    await screen.findByRole('heading', { level: 1, name: '9FORTY LA Dodgers' })
    await userEvent.click(screen.getByRole('button', { name: /Agregar al carrito/ }))
    expect(carrito.agregar).toHaveBeenCalledWith(101, 1)
    const aviso = (await screen.findByText('Agregado al carrito')).closest('[role="status"]') as HTMLElement
    expect(within(aviso).getByRole('link', { name: 'Ver carrito' })).toHaveAttribute('href', '/carrito')
  })

  it('al volver de iniciar sesión agrega solo lo pendiente y limpia la URL', async () => {
    const { carrito } = abrir('/producto/10?color=1&agregar=1', { rol: 'CLIENTE', pendiente: { idProducto: 10, idVariante: 101, cantidad: 6 } })
    await waitFor(() => expect(carrito.agregar).toHaveBeenCalledWith(101, 6))
    await waitFor(() => expect(ubicacion()).toBe('/producto/10?color=1'))
    expect(await screen.findByText('Agregado al carrito')).toBeInTheDocument()
  })

  it('galería: la foto actual queda encendida; el hover no cambia la foto; el clic y las flechas sí', async () => {
    const imagenes = [1, 2, 3].map((n) => ({ url: `https://img.test/10-negro-${n}.webp`, idColor: 1, orden: n }))
    abrir('/producto/10?color=1', { detalle: detalleDodgers({ imagenes }) })
    await screen.findByRole('heading', { level: 1, name: '9FORTY LA Dodgers' })
    const fotos = within(screen.getByRole('group', { name: 'Fotos del producto' }))
    const principal = () => screen.getByRole('img', { name: '9FORTY LA Dodgers' })
    expect(principal()).toHaveAttribute('src', imagenes[0]!.url)
    expect(fotos.getByRole('button', { name: 'Foto 1' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.hover(fotos.getByRole('button', { name: 'Foto 3' }))
    expect(principal()).toHaveAttribute('src', imagenes[0]!.url)

    await userEvent.click(fotos.getByRole('button', { name: 'Foto 3' }))
    expect(principal()).toHaveAttribute('src', imagenes[2]!.url)
    expect(fotos.getByRole('button', { name: 'Foto 3' })).toHaveAttribute('aria-pressed', 'true')
    expect(fotos.getByRole('button', { name: 'Foto 1' })).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }))
    expect(principal()).toHaveAttribute('src', imagenes[0]!.url)
    await userEvent.click(screen.getByRole('button', { name: 'Foto anterior' }))
    expect(principal()).toHaveAttribute('src', imagenes[2]!.url)
  })

  it('A5 · variante agotada: el botón queda deshabilitado', async () => {
    abrir('/producto/10?color=2', { rol: 'CLIENTE' })
    await screen.findByRole('heading', { level: 1, name: '9FORTY LA Dodgers' })
    await userEvent.click(screen.getByRole('button', { name: /Azul/ }))
    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled()
  })
})
