import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearServiciosCatalogoDemo } from './serviciosCatalogoDemo'
import { filtrosVacios } from '@modulos/administrar-catalogo/presentacion/hooks/useCatalogoAdmin'

afterEach(() => vi.unstubAllGlobals())

describe('Servicios de prueba del catálogo', () => {
  it('filtra por texto, categoría, marca y estado sin modificar los datos', async () => {
    const { productoService } = crearServiciosCatalogoDemo()
    const encontrados = await productoService.buscarProductos({ ...filtrosVacios,
      texto: 'LA Dodgers', idCategoria: 'gorras', idMarca: 'new-era', estado: 'PUBLICADO' })
    expect(encontrados.map(p => p.clave)).toEqual(['NE-940-LAD-NEG'])
    encontrados[0]!.nombre = 'Modificado fuera del servicio'
    expect((await productoService.obtenerProductos())[0]?.nombre).toBe('9FORTY LA Dodgers Negro')
  })

  it('mantiene las bajas dentro de la instancia y reinicia los datos en una nueva', async () => {
    const { productoService } = crearServiciosCatalogoDemo()
    await productoService.darDeBajaProducto('demo-1')
    expect((await productoService.obtenerProductos())[0]?.estado).toBe('INACTIVO')
    expect((await crearServiciosCatalogoDemo().productoService.obtenerProductos())[0]?.estado).toBe('PUBLICADO')
  })

  it('permite registrar, completar y consultar un producto nuevo y liberar su imagen', async () => {
    const revocar = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:demo'), revokeObjectURL: revocar })
    const { productoService, liberarImagenes } = crearServiciosCatalogoDemo()
    const datos = { clave: 'SKU-NUEVO', nombre: 'Producto nuevo', descripcion: 'Descripción',
      idCategoria: 'gorras', idSubcategoria: 'gorra', idMarca: 'new-era', estado: 'BORRADOR',
      imagenes: new File(['imagen'], 'imagen.png', { type: 'image/png' }) }
    const { idProducto } = await productoService.crearProducto(datos)
    await productoService.agregarVariante(idProducto, { talla: 'Ajustable', color: 'Gris', stock: 5 })
    await productoService.crearPrecios(idProducto, { preciosProducto: [{ tipoPrecio: 'BASE', precio: 100, minPiezas: 1 }] })
    expect(await productoService.buscarProductos({ ...filtrosVacios, texto: 'SKU-NUEVO' })).toMatchObject([
      { idProducto, img: 'blob:demo', variantes: [{ stock: 5 }], preciosProducto: [{ precio: 100 }] },
    ])
    await expect(productoService.crearProducto(datos)).rejects.toThrow('SKU ya existe')
    liberarImagenes()
    expect(revocar).toHaveBeenCalledWith('blob:demo')
  })
})
