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

  it('envía el agregado en un solo paso y permite corregir tras un rechazo', async () => {
    const { producto } = servicios()
    vi.mocked(producto.crearProducto).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValue(undefined)
    const model = new ProductoModel(producto)
    await expect(model.registrarProducto(datos())).rejects.toThrow('Sin conexión')
    await model.registrarProducto(datos())
    expect(producto.crearProducto).toHaveBeenCalledTimes(2)
    expect(producto.crearProducto).toHaveBeenLastCalledWith(expect.objectContaining({variantes: datos().variantes, preciosProducto: datos().precios}))
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

  it('conserva los cinco esquemas del diagrama tanto al listar como al buscar', async () => {
    const { producto, catalogo } = servicios()
    const precios = ['BASE', 'EMPRENDEDOR', 'MAYOREO', 'DISTRIBUIDOR', 'SOCIO_COMERCIAL'].map((tipoPrecio, i) => ({tipoPrecio, precio: 100-i*10, minPiezas: i+1}))
    const dto = {idProducto:'1',clave:'CINCO',nombre:'Gorra',img:'',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado:'PUBLICADO',variantes:datos().variantes,preciosProducto:precios}
    vi.mocked(producto.obtenerProductos).mockResolvedValue([dto])
    vi.mocked(producto.buscarProductos).mockResolvedValue([dto])
    const modelo = new CatalogoModel(catalogo,producto)
    expect((await modelo.obtenerCatalogo())[0]?.precios).toEqual(precios)
    expect((await modelo.buscarProductos({texto:'Gorra',idCategoria:'',idSubcategoria:'',idMarca:'',estado:null}))[0]?.precios).toEqual(precios)
  })

  it.each(['PUBLICADO', 'STOCK_BAJO', 'INACTIVO', 'BORRADOR'])('preserva el estado %s del backend al listar y buscar', async estado => {
    const { producto, catalogo } = servicios()
    const dto = {idProducto:'7',clave:'ESTADO',nombre:'Gorra',img:'',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado,variantes:datos().variantes,preciosProducto:datos().precios}
    vi.mocked(producto.obtenerProductos).mockResolvedValue([dto])
    vi.mocked(producto.buscarProductos).mockResolvedValue([dto])
    const modelo = new CatalogoModel(catalogo,producto)
    expect((await modelo.obtenerCatalogo())[0]?.estado).toBe(estado)
    expect((await modelo.buscarProductos({texto:'Gorra',idCategoria:'',idSubcategoria:'',idMarca:'',estado:null}))[0]?.estado).toBe(estado)
  })

  it('no permite crear un producto con el estado histórico STOCK_BAJO', () => {
    const model = new ProductoModel(servicios().producto)
    expect(model.validarDatosCompletos({...datos(), estado:'STOCK_BAJO'})).toHaveProperty('estado')
  })
})
