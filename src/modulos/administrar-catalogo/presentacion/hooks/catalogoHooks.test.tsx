import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CatalogoModel } from '../../aplicacion/CatalogoModel'
import { BajaProductoModel } from '../../aplicacion/BajaProductoModel'
import type { IProductoService } from '../../dominio/puertos/IProductoService'
import type { ICatalogoService } from '../../dominio/puertos/ICatalogoService'
import type { ProductoCatalogoDTO } from '../../aplicacion/dto/ProductoCatalogoDTO'
import { filtrosVacios, useCatalogoAdmin } from './useCatalogoAdmin'
import { useBajaProducto } from './useBajaProducto'
import { useNuevoProducto } from './useNuevoProducto'
import { ProductoModel } from '../../aplicacion/ProductoModel'

function dependencias() {
  const producto: IProductoService = {
    obtenerProductos: vi.fn().mockResolvedValue([]), buscarProductos: vi.fn().mockResolvedValue([]),
    crearProducto: vi.fn(), agregarVariante: vi.fn(), crearPrecios: vi.fn(), darDeBajaProducto: vi.fn(),
  }
  const catalogo: ICatalogoService = {
    obtenerFiltrosDisponibles: vi.fn().mockResolvedValue({ categorias: [], subcategorias: [], marcas: [] }),
    obtenerTallasPorCategoria: vi.fn().mockResolvedValue([]),
  }
  return { producto, catalogo }
}

const dto: ProductoCatalogoDTO = { idProducto: 'p1', clave: 'P1', nombre: 'Producto', img: '',
  categoria: '', subcategoria: '', marca: '', estado: 'PUBLICADO', variantes: [], preciosProducto: [] }

describe('ViewModels de catálogo', () => {
  it('conserva las tallas y las variantes al volver a pulsar la categoría seleccionada', async () => {
    const { producto, catalogo } = dependencias()
    vi.mocked(catalogo.obtenerTallasPorCategoria).mockResolvedValue([{ idTalla: 'm', nombre: 'M' }])
    const catalogoModel = new CatalogoModel(catalogo, producto)
    const productoModel = new ProductoModel(producto)
    const { result } = renderHook(() => useNuevoProducto(catalogoModel, productoModel))
    await waitFor(() => expect(result.current.cargando).toBe(false))
    act(() => result.current.actualizarCampo('idCategoria', 'ropa'))
    await waitFor(() => expect(result.current.tallasCategoria).toHaveLength(1))
    act(() => {
      result.current.actualizarCampo('idSubcategoria', 'playera')
      result.current.agregarVariante({ talla: 'M', color: 'Verde', stock: 33 })
    })
    act(() => result.current.actualizarCampo('idCategoria', 'ropa'))
    expect(result.current.tallasCategoria).toEqual([{ idTalla: 'm', nombre: 'M' }])
    expect(result.current.datosProducto.variantes).toHaveLength(1)
    expect(result.current.datosProducto.idSubcategoria).toBe('playera')
  })

  it.each([false, true])('mantiene el formulario editable solo cuando no hay un alta remota parcial (%s)', async parcial => {
    const { producto, catalogo } = dependencias()
    if (parcial) {
      vi.mocked(producto.crearProducto).mockResolvedValue({ idProducto: 'p1', clave: 'SKU' })
      vi.mocked(producto.agregarVariante).mockRejectedValue(new Error('No se pudo registrar la variante'))
    } else {
      vi.mocked(producto.crearProducto).mockRejectedValue(new Error('La clave ya existe'))
    }
    const catalogoModel = new CatalogoModel(catalogo, producto)
    const productoModel = new ProductoModel(producto)
    const { result } = renderHook(() => useNuevoProducto(catalogoModel, productoModel))
    await waitFor(() => expect(result.current.cargando).toBe(false))
    act(() => {
      for (const campo of ['clave', 'nombre', 'descripcion', 'idCategoria', 'idSubcategoria', 'idMarca'] as const) {
        result.current.actualizarCampo(campo, 'SKU')
      }
      result.current.actualizarCampo('imagenes', new File(['foto'], 'foto.png', { type: 'image/png' }))
      result.current.actualizarCampo('variantes', [{ talla: 'M', color: 'Negro', stock: 2 }])
      result.current.actualizarCampo('precios', [{ tipoPrecio: 'BASE', precio: 100, minPiezas: 1 }])
    })
    await act(async () => { expect(await result.current.guardarProducto()).toBe(false) })
    expect(result.current.bloqueado).toBe(parcial)
    expect(result.current.datosProducto.nombre).toBe('SKU')
    act(() => result.current.actualizarCampo('clave', 'SKU-CORREGIDO'))
    expect(result.current.datosProducto.clave).toBe(parcial ? 'SKU' : 'SKU-CORREGIDO')
  })

  it('conserva la búsqueda más reciente aunque la anterior termine después', async () => {
    const { producto, catalogo } = dependencias()
    let resolverAnterior!: (lista: ProductoCatalogoDTO[]) => void
    vi.mocked(producto.buscarProductos)
      .mockReturnValueOnce(new Promise(resolve => { resolverAnterior = resolve }))
      .mockResolvedValueOnce([{ ...dto, nombre: 'Resultado reciente' }])
    const modelo = new CatalogoModel(catalogo, producto)
    const { result } = renderHook(() => useCatalogoAdmin(modelo))
    await waitFor(() => expect(result.current.cargando).toBe(false))
    let anterior!: Promise<void>
    act(() => { anterior = result.current.buscarProductos({ ...filtrosVacios, texto: 'anterior' }) })
    await act(async () => { await result.current.buscarProductos({ ...filtrosVacios, texto: 'reciente' }) })
    await act(async () => { resolverAnterior([{ ...dto, nombre: 'Resultado antiguo' }]); await anterior })
    expect(result.current.productos[0]?.nombre).toBe('Resultado reciente')
  })

  it('impide confirmar la baja dos veces mientras está pendiente', async () => {
    const { producto } = dependencias()
    let resolver!: () => void
    vi.mocked(producto.darDeBajaProducto).mockImplementation(() => new Promise(resolve => {
      resolver = () => resolve({ idProducto: 'p1', tipoBaja: 'ELIMINADO' })
    }))
    const model = new BajaProductoModel(producto)
    const { result } = renderHook(() => useBajaProducto(model))
    act(() => result.current.solicitarBaja({ ...dto, imagen: '', estado: 'PUBLICADO', existencias: 0, precios: [] }))
    let primera!: Promise<boolean>
    act(() => { primera = result.current.confirmarBaja() })
    await act(async () => { expect(await result.current.confirmarBaja()).toBe(false) })
    expect(producto.darDeBajaProducto).toHaveBeenCalledTimes(1)
    await act(async () => { resolver(); await primera })
    expect(result.current.producto).toBeNull()
    expect(result.current.resultado?.tipoBaja).toBe('ELIMINADO')
  })
})
