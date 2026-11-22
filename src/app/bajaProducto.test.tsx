import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SesionProvider } from '@compartido/sesion'
import type { EstadoSesionTs, ISesion } from '@compartido/sesion/ISesion'
import { Rutas } from './rutas'

vi.mock('./contenedor', async () => {
  const { HttpClient } = await import('@infraestructura/http/HttpClient')
  const { ProductoService } = await import('@modulos/administrar-catalogo/infraestructura/ProductoService')
  const { CatalogoService } = await import('@modulos/administrar-catalogo/infraestructura/CatalogoService')
  const { CatalogoModel } = await import('@modulos/administrar-catalogo/aplicacion/CatalogoModel')
  const { BajaProductoModel } = await import('@modulos/administrar-catalogo/aplicacion/BajaProductoModel')
  const http = new HttpClient()
  const productoService = new ProductoService(http)
  return { contenedor: { productoService, bajaProductoModel: new BajaProductoModel(productoService),
    catalogoModel: new CatalogoModel(new CatalogoService(http), productoService) } }
})
const producto = { idProducto: '9223372036854775807', clave: 'BAJA-001', nombre: 'Gorra de baja', img: '',
  categoria: 'Gorras', subcategoria: 'Clásicas', marca: 'FLY', estado: 'PUBLICADO',
  variantes: [{ talla: 'M', color: 'Rojo', stock: 3 }], preciosProducto: [{ tipoPrecio: 'BASE', precio: 100, minPiezas: 1 }] }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
function backend(tipo = 'FISICA', status = 200, pendiente = false) {
  const llamadas: string[] = []
  let baja = false
  let completar = () => {}
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const ruta = new URL(url, 'http://localhost').pathname
    llamadas.push(`${init.method} ${ruta}${new URL(url, 'http://localhost').search}`)
    expect(init.credentials).toBe('include')
    if (init.method === 'DELETE') {
      expect(ruta).toBe('/api/productos/9223372036854775807')
      const respuesta = () => {
        if (status !== 200) return json({ error: 'RECURSO_YA_EXISTE', message: 'No se puede eliminar por referencias existentes' }, status)
        baja = true
        return json({ idProducto: producto.idProducto, tipoBaja: tipo })
      }
      if (pendiente) return new Promise<Response>(resolve => { completar = () => resolve(respuesta()) })
      return respuesta()
    }
    if (ruta.endsWith('/filtros')) return json({ categorias: [], subcategorias: [], marcas: [], colores: [] })
    return json(baja ? tipo === 'LOGICA' ? [{ ...producto, estado: 'INACTIVO' }] : [] : [producto])
  }))
  return { llamadas, completar: () => completar() }
}
async function abrir() {
  const estado: EstadoSesionTs = { estado: 'autenticado', usuario: { id: 1, nombre: 'Admin', correo: 'a@example.com',
    telefono: null, rol: 'ADMIN', perfilCompleto: true, iniciales: 'AD' } }
  const sesion: ISesion = { obtenerEstado: () => estado, suscribir: () => () => {}, iniciarConGoogle: vi.fn(), cerrarSesion: vi.fn() }
  render(<MemoryRouter initialEntries={['/admin/catalogo']}><SesionProvider sesion={sesion}><Rutas /></SesionProvider></MemoryRouter>)
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Dar de baja Gorra de baja' }))
  return { user, dialogo: screen.getByRole('dialog') }
}
afterEach(() => vi.unstubAllGlobals())
describe('Baja por la ruta real', () => {
  it('solicita confirmación y cancelar no envía DELETE', async () => {
    const api = backend()
    const { user, dialogo } = await abrir()
    expect(within(dialogo).getByText('BAJA-001 · 3 pzas en existencia')).toBeInTheDocument()
    expect(api.llamadas.filter(l => l.startsWith('DELETE'))).toHaveLength(0)
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(api.llamadas.filter(l => l.startsWith('DELETE'))).toHaveLength(0)
    expect(screen.getByText('Gorra de baja')).toBeInTheDocument()
  })
  it.each(['FISICA', 'LOGICA'])('confirma %s y vuelve a consultar el catálogo', async tipo => {
    const api = backend(tipo)
    const { user, dialogo } = await abrir()
    await user.click(within(dialogo).getByRole('button', { name: 'Dar de baja' }))
    await screen.findByText(tipo === 'FISICA' ? 'Producto eliminado correctamente.' : 'Producto inactivado correctamente.')
    await waitFor(() => expect(api.llamadas.filter(l => l === 'GET /api/productos')).toHaveLength(2))
    expect(api.llamadas.filter(l => l.startsWith('DELETE'))).toHaveLength(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    if (tipo === 'FISICA') await screen.findByText('No encontramos productos')
    else await within(screen.getByRole('table')).findByText('Inactivo')
  })
  it('bloquea confirmaciones repetidas y cancelar mientras espera', async () => {
    const api = backend('LOGICA', 200, true)
    const { user, dialogo } = await abrir()
    await user.click(within(dialogo).getByRole('button', { name: 'Dar de baja' }))
    expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(api.llamadas.filter(l => l.startsWith('DELETE'))).toHaveLength(1)
    api.completar()
    await screen.findByText('Producto inactivado correctamente.')
  })
  it.each([404, 409])('un rechazo %s conserva la confirmación y no anuncia éxito', async status => {
    const api = backend('FISICA', status)
    const { user, dialogo } = await abrir()
    await user.click(within(dialogo).getByRole('button', { name: 'Dar de baja' }))
    await within(dialogo).findByText('No se puede eliminar por referencias existentes')
    expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toBeEnabled()
    expect(api.llamadas.filter(l => l === 'GET /api/productos')).toHaveLength(1)
    expect(screen.queryByText(/Producto eliminado correctamente/)).not.toBeInTheDocument()
  })

  it('recarga la búsqueda activa después de dar de baja', async () => {
    const api = backend('FISICA')
    const { user, dialogo } = await abrir()
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }))
    await user.type(screen.getByRole('searchbox'), 'Gorra')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(api.llamadas.filter(l => l === 'GET /api/productos/buscar?texto=Gorra')).toHaveLength(1))
    await user.click(await screen.findByRole('button', { name: 'Dar de baja Gorra de baja' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dar de baja' }))
    await screen.findByText('Producto eliminado correctamente.')
    await waitFor(() => expect(api.llamadas.filter(l => l === 'GET /api/productos/buscar?texto=Gorra')).toHaveLength(2))
  })
})
