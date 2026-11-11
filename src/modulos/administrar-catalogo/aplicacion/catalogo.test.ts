import { describe, expect, it, vi } from 'vitest'
import { ProductoModel } from './ProductoModel'
import { CatalogoModel } from './CatalogoModel'
import { BajaProductoModel } from './BajaProductoModel'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { ICatalogoService } from '../dominio/puertos/ICatalogoService'
import type { DatosProductoTs } from '../dominio/DatosProductoTs'

function servicios() {
  const producto: IProductoService = {
    obtenerProductos: vi.fn(), buscarProductos: vi.fn(),
    crearProducto: vi.fn().mockResolvedValue({ idProducto: 'p1', clave: 'TEN-01' }),
    agregarVariante: vi.fn().mockResolvedValue(undefined),
    crearPrecios: vi.fn().mockResolvedValue(undefined),
    darDeBajaProducto: vi.fn().mockResolvedValue({ idProducto: 'p1', tipoBaja: 'INACTIVADO' }),
  }
  const catalogo: ICatalogoService = {
    obtenerFiltrosDisponibles: vi.fn(), obtenerTallasPorCategoria: vi.fn(),
  }
  return { producto, catalogo }
}

const datos = (): DatosProductoTs => ({ clave: 'TEN-01', nombre: 'Tenis', descripcion: 'Tenis deportivos',
  idCategoria: 'c1', idSubcategoria: 's1', idMarca: 'm1', estado: 'BORRADOR',
  imagenes: new File(['imagen'], 'tenis.png', { type: 'image/png' }),
  variantes: [{ talla: 'M', color: 'Rojo', stock: 3 }, { talla: 'L', color: 'Azul', stock: 2 }],
  precios: [{ tipoPrecio: 'BASE', precio: 100, minPiezas: 1 }],
})

describe('Modelos de administrar catálogo', () => {
  it('rechaza existencias fraccionarias y precios sin mínimo válido', () => {
    const model = new ProductoModel(servicios().producto)
    expect(model.validarVariante({ talla: 'M', color: 'Rojo', stock: 1.5 })).not.toBeNull()
    expect(model.validarPrecio({ tipoPrecio: 'BASE', precio: NaN, minPiezas: 1 })).not.toBeNull()
    expect(model.validarPrecio({ tipoPrecio: 'BASE', precio: 100, minPiezas: 0 })).not.toBeNull()
    expect(model.validarDatosCompletos({ ...datos(), imagenes: null, precios: [] })).toMatchObject({
      imagenes: expect.any(String), precios: expect.any(String),
    })
  })

  it('reanuda el alta después de un fallo sin repetir operaciones confirmadas', async () => {
    const { producto } = servicios()
    vi.mocked(producto.agregarVariante).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Sin conexión'))
    const model = new ProductoModel(producto)
    const formulario = datos()
    await expect(model.registrarProducto(formulario)).rejects.toThrow('Sin conexión')
    expect(producto.crearPrecios).not.toHaveBeenCalled()
    await model.registrarProducto(formulario)
    expect(producto.crearProducto).toHaveBeenCalledTimes(1)
    expect(producto.agregarVariante).toHaveBeenCalledTimes(3)
    expect(producto.crearPrecios).toHaveBeenCalledWith('p1', { preciosProducto: formulario.precios })
  })

  it('mapea imagen, estado, precios y existencias desde los DTO', async () => {
    const { producto, catalogo } = servicios()
    vi.mocked(producto.obtenerProductos).mockResolvedValue([{
      idProducto: 'p1', clave: 'TEN-01', nombre: 'Tenis', img: '/tenis.png',
      categoria: 'Calzado', subcategoria: 'Deportivo', marca: 'Fly', estado: 'PUBLICADO',
      variantes: datos().variantes, preciosProducto: datos().precios,
    }])
    const [resultado] = await new CatalogoModel(catalogo, producto).obtenerCatalogo()
    expect(resultado).toMatchObject({ imagen: '/tenis.png', existencias: 5, estado: 'PUBLICADO', precios: datos().precios })
  })

  it('mantiene la distinción entre inactivación y eliminación', async () => {
    const { producto } = servicios()
    const model = new BajaProductoModel(producto)
    expect(await model.darDeBaja('p1')).toEqual({ idProducto: 'p1', tipoBaja: 'INACTIVADO' })
    vi.mocked(producto.darDeBajaProducto).mockResolvedValue({ idProducto: 'p1', tipoBaja: 'ELIMINADO' })
    expect(await model.darDeBaja('p1')).toEqual({ idProducto: 'p1', tipoBaja: 'ELIMINADO' })
  })
})
