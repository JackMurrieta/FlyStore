import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpClient } from '@infraestructura/http/HttpClient'
import { ProductoService } from '../infraestructura/ProductoService'
import { CatalogoService } from '../infraestructura/CatalogoService'
import { CatalogoModel } from '../aplicacion/CatalogoModel'
import { BajaProductoModel } from '../aplicacion/BajaProductoModel'
import { PantallaCatalogoAdmin } from './vistas/PantallaCatalogoAdmin'
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })
function montar(total = 15) {
  let productos = Array.from({length: total}, (_,i) => ({idProducto:String(100+i),clave:'SKU-'+i,nombre:'Producto '+i,img:'',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado:'PUBLICADO',variantes:[],preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}]}))
  const consultas: URL[] = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const u = new URL(url, 'http://localhost')
    consultas.push(u)
    if(init.method === 'DELETE') {
      productos = productos.filter(p => p.idProducto !== u.pathname.split('/').at(-1))
      return json({idProducto:u.pathname.split('/').at(-1),tipoBaja:'FISICA'})
    }
    if(u.pathname.endsWith('/filtros'))return json({categorias:[],subcategorias:[],marcas:[],colores:[]})
    const lista = productos.filter(p => !u.searchParams.get('texto') || p.nombre.includes(u.searchParams.get('texto')!))
    const pagina = Number(u.searchParams.get('pagina')), tamano = Number(u.searchParams.get('tamano'))
    return json({productos:lista.slice(pagina*tamano,pagina*tamano+tamano),pagina,tamano,hayMas:lista.length>(pagina+1)*tamano})
  }))
  const http = new HttpClient(), servicio = new ProductoService(http)
  const model = new CatalogoModel(new CatalogoService(http), servicio)
  render(<PantallaCatalogoAdmin catalogoModel={model} bajaProductoModel={new BajaProductoModel(servicio)} alAgregar={vi.fn()} />)
  return {consultas,user:userEvent.setup()}
}
afterEach(() => vi.unstubAllGlobals())
describe('Paginación del catálogo en el servidor', () => {
  it('solo muestra siete resultados, solicita páginas distintas y conserva la búsqueda', async () => {
    const {user,consultas}=montar()
    await screen.findByText('Producto 0')
    await waitFor(()=>expect(screen.getByRole('button',{name:'Página siguiente'})).toBeEnabled())
    expect(screen.queryByText('Producto 7')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button',{name:'Página siguiente'}))
    await screen.findByText('Producto 7')
    expect(screen.queryByText('Producto 0')).not.toBeInTheDocument()
    expect(consultas.at(-1)?.searchParams.get('pagina')).toBe('1')
    await user.click(screen.getByRole('button',{name:'Página siguiente'}))
    await screen.findByText('Producto 14')
    expect(screen.getByRole('button',{name:'Página siguiente'})).toBeDisabled()
    await user.type(screen.getByRole('searchbox'),'Producto 1')
    await user.click(screen.getByRole('button',{name:'Buscar'}))
    await screen.findByText('Producto 1')
    expect(consultas.at(-1)?.searchParams.get('pagina')).toBe('0')
    expect(consultas.at(-1)?.searchParams.get('texto')).toBe('Producto 1')
    expect(consultas.filter(u=>u.pathname.endsWith('/filtros'))).toHaveLength(1)
  })
  it('vuelve a la página anterior al eliminar el único producto de la última', async () => {
    const {user}=montar(8)
    await screen.findByText('Producto 0')
    await waitFor(()=>expect(screen.getByRole('button',{name:'Página siguiente'})).toBeEnabled())
    await user.click(screen.getByRole('button',{name:'Página siguiente'}))
    await screen.findByText('Producto 7')
    await user.click(screen.getByRole('button',{name:'Dar de baja Producto 7'}))
    await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Dar de baja'}))
    await screen.findByText('Producto eliminado correctamente.')
    await screen.findByText('Producto 0')
    expect(screen.queryByText('Producto 7')).not.toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Página anterior'})).toBeDisabled()
    expect(screen.getByRole('button',{name:'Página siguiente'})).toBeDisabled()
  })
})
