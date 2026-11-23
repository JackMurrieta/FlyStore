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

  it('permite registrar, editar y consultar un producto nuevo y liberar sus fotos', async () => {
    const revocar = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:demo'), revokeObjectURL: revocar })
    const { productoService, liberarImagenes } = crearServiciosCatalogoDemo()
    const datos = { clave: 'SKU-NUEVO', nombre: 'Producto nuevo', descripcion: 'Descripción',
      idCategoria: 'gorras', idSubcategoria: 'gorra', idMarca: 'new-era', estado: 'BORRADOR',
      imagenes: [{ archivo: 0, color: 'Gris' }], variantes: [{talla:'Ajustable',color:'Gris',stock:5}], preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}] }
    const archivos = [new File(['imagen'], 'imagen.png', { type: 'image/png' })]
    await productoService.crearProducto(datos, archivos)
    const [creado] = await productoService.buscarProductos({ ...filtrosVacios, texto: 'SKU-NUEVO' })
    expect(creado).toMatchObject({ img: 'blob:demo', variantes: [{ stock: 5 }], preciosProducto: [{ precio: 100 }] })
    await expect(productoService.crearProducto(datos, archivos)).rejects.toThrow('SKU ya existe')

    const edicion = await productoService.obtenerProductoParaEditar(creado!.idProducto)
    expect(edicion.imagenes).toMatchObject([{ color: 'Gris', url: 'blob:demo' }])
    const editado = await productoService.editarProducto(creado!.idProducto, { clave: 'SKU-NUEVO', nombre: 'Renombrado', descripcion: 'Otra',
      idSubcategoria: 'gorra', idMarca: 'fly', estado: 'PUBLICADO', preciosProducto: datos.preciosProducto,
      variantes: [{ idVariante: edicion.variantes[0]!.idVariante, stock: 9 }],
      imagenes: [{ idImagen: edicion.imagenes[0]!.idImagen, color: 'Gris' }] }, [])
    expect(editado).toMatchObject({ nombre: 'Renombrado', marca: 'FLY', variantes: [{ stock: 9, color: 'Gris' }] })
    liberarImagenes()
    expect(revocar).toHaveBeenCalledWith('blob:demo')
  })
})
