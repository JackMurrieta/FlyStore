import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CatalogoModel } from '../../aplicacion/CatalogoModel'
import { BajaProductoModel } from '../../aplicacion/BajaProductoModel'
import { ProductoModel, errorDeGrupo } from '../../aplicacion/ProductoModel'
import type { IProductoService } from '../../dominio/puertos/IProductoService'
import type { ICatalogoService } from '../../dominio/puertos/ICatalogoService'
import type { ProductoCatalogoDTO } from '../../aplicacion/dto/ProductoCatalogoDTO'
import type { ProductoEdicionDTO } from '../../aplicacion/dto/ProductoEdicionDTO'
import { filtrosVacios, useCatalogoAdmin } from './useCatalogoAdmin'
import { useBajaProducto } from './useBajaProducto'
import { useFormularioProducto } from './useFormularioProducto'

function dependencias() {
  const producto: IProductoService = {
    obtenerProductos: vi.fn().mockResolvedValue([]), buscarProductos: vi.fn().mockResolvedValue([]),
    obtenerPagina: vi.fn().mockResolvedValue({ productos: [], pagina: 0, tamano: 7, hayMas: false }),
    crearProducto: vi.fn(), obtenerProductoParaEditar: vi.fn(), editarProducto: vi.fn(), darDeBajaProducto: vi.fn(),
  }
  const catalogo: ICatalogoService = {
    obtenerFiltrosDisponibles: vi.fn().mockResolvedValue({ categorias: [{ id: 'gorras', nombre: 'Gorras' }], subcategorias: [], marcas: [], colores: ['Verde', 'Negro'] }),
    obtenerTallasPorCategoria: vi.fn().mockResolvedValue([{ idTalla: 'a', nombre: 'Ajustable' }]),
  }
  return { producto, catalogo }
}

const dto: ProductoCatalogoDTO = { idProducto: 'p1', clave: 'P1', nombre: 'Producto', img: '',
  categoria: '', subcategoria: '', marca: '', estado: 'PUBLICADO', variantes: [], preciosProducto: [] }

const edicion: ProductoEdicionDTO = {
  idProducto: '72', clave: 'NE-940-LAD', nombre: '9FORTY LA', descripcion: 'Gorra', idCategoria: 'gorras', categoria: 'Gorras',
  idSubcategoria: '3', subcategoria: '9FORTY', idMarca: '11', marca: 'New Era', estado: 'PUBLICADO',
  variantes: [
    { idVariante: '40', sku: 'NEG', idTalla: 'a', talla: 'Ajustable', idColor: '1', color: 'Negro', hex: '#000', stock: 7, conPedidos: true },
    { idVariante: '41', sku: 'VER', idTalla: 'a', talla: 'Ajustable', idColor: '2', color: 'Verde', hex: '#0a0', stock: 1, conPedidos: false },
  ],
  preciosProducto: [{ tipoPrecio: 'BASE', precio: 450, minPiezas: 1 }],
  imagenes: [
    { idImagen: '55', url: 'https://cdn/negro.webp', idColor: '1', color: 'Negro', orden: 0 },
    { idImagen: '56', url: 'https://cdn/verde.webp', idColor: '2', color: 'Verde', orden: 1 },
  ],
}

const png = (nombre: string) => new File(['foto'], nombre, { type: 'image/png' })

// jsdom no crea URLs blob: se sustituyen y se restauran en cada prueba.
const urlOriginal = { crear: URL.createObjectURL, revocar: URL.revokeObjectURL }
beforeEach(() => {
  let n = 0
  URL.createObjectURL = vi.fn(() => `blob:foto-${++n}`)
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => {
  cleanup() // desmonta antes de restaurar: el formulario libera sus vistas previas al salir
  URL.createObjectURL = urlOriginal.crear
  URL.revokeObjectURL = urlOriginal.revocar
})

async function formulario(dependencia = dependencias(), idProducto?: string) {
  const { producto, catalogo } = dependencia
  // Modelos estables, como los del contenedor: el ViewModel recarga si cambian.
  const catalogoModel = new CatalogoModel(catalogo, producto)
  const productoModel = new ProductoModel(producto)
  const hook = renderHook(() => useFormularioProducto(catalogoModel, productoModel, idProducto))
  await waitFor(() => expect(hook.result.current.cargando).toBe(false))
  return hook
}

describe('useFormularioProducto · alta', () => {
  it('conserva colores y fotos al volver a pulsar la línea seleccionada y sugiere la única talla', async () => {
    const { result } = await formulario()
    act(() => result.current.seleccionarCategoria('gorras'))
    await waitFor(() => expect(result.current.tallasCategoria).toHaveLength(1))
    act(() => result.current.agregarColor())
    const grupo = result.current.datosProducto.grupos[0]!
    expect(grupo.variantes[0]!.talla).toBe('Ajustable')
    act(() => { result.current.cambiarColor(grupo.clave, 'Verde') })
    act(() => { result.current.agregarFotos(grupo.clave, [png('verde.png')]) })
    act(() => result.current.seleccionarCategoria('gorras'))
    expect(result.current.datosProducto.grupos[0]).toMatchObject({ color: 'Verde', fotos: [{ vistaPrevia: 'blob:foto-1' }] })
    expect(result.current.hayCambios).toBe(true)
  })

  it('rechaza archivos que no son imagen y avisa en el color', async () => {
    const { result } = await formulario()
    act(() => result.current.agregarColor())
    const clave = result.current.datosProducto.grupos[0]!.clave
    let aviso: string | null = null
    act(() => { aviso = result.current.agregarFotos(clave, [new File(['x'], 'notas.txt', { type: 'text/plain' }), png('ok.png')]) })
    expect(aviso).toMatch('notas.txt')
    expect(result.current.datosProducto.grupos[0]!.fotos).toHaveLength(1)
    expect(result.current.erroresPorCampo[errorDeGrupo(clave)]).toMatch('notas.txt')
  })

  it.each([
    [Object.assign(new Error('La clave ya existe'), { statusHTTP: 409 }), 'clave'],
    [new Error('No se pudo guardar'), null],
  ])('mantiene el formulario editable después de un rechazo (%s)', async (error, campo) => {
    const dependencia = dependencias()
    vi.mocked(dependencia.producto.crearProducto).mockRejectedValue(error)
    const { result } = await formulario(dependencia)
    act(() => result.current.seleccionarCategoria('gorras'))
    await waitFor(() => expect(result.current.cargandoTallas).toBe(false))
    act(() => {
      for (const c of ['clave', 'nombre', 'descripcion', 'idSubcategoria', 'idMarca'] as const) result.current.actualizarCampo(c, 'SKU')
      result.current.actualizarCampo('precios', [{ tipoPrecio: 'BASE', precio: 100, minPiezas: 1 }])
      result.current.agregarColor()
    })
    const clave = result.current.datosProducto.grupos[0]!.clave
    act(() => { result.current.cambiarColor(clave, 'Negro') })
    act(() => { result.current.agregarFotos(clave, [png('negro.png')]) })
    await act(async () => { expect(await result.current.guardarProducto()).toBeNull() })
    expect(result.current.bloqueado).toBe(false)
    if (campo) expect(result.current.erroresPorCampo[campo]).toBe('La clave ya existe')
    else expect(result.current.error).toBe('No se pudo guardar')
    act(() => result.current.actualizarCampo('clave', 'SKU-CORREGIDO'))
    expect(result.current.datosProducto.clave).toBe('SKU-CORREGIDO')
    expect(result.current.erroresPorCampo.clave).toBeUndefined()
  })
})

describe('useFormularioProducto · edición', () => {
  it('carga el producto, quita una talla con pedidos (se puede deshacer) y guarda por PUT', async () => {
    const dependencia = dependencias()
    vi.mocked(dependencia.producto.obtenerProductoParaEditar).mockResolvedValue(edicion)
    vi.mocked(dependencia.producto.editarProducto).mockResolvedValue(edicion)
    const { result } = await formulario(dependencia, '72')
    expect(result.current.modo).toBe('EDICION')
    expect(result.current.categoriaEdicion).toBe('Gorras')
    expect(result.current.hayCambios).toBe(false)
    const [negro, verde] = result.current.datosProducto.grupos
    act(() => result.current.quitarVariante(negro!.clave, negro!.variantes[0]!.clave))
    expect(result.current.datosProducto.grupos[0]!.variantes[0]).toMatchObject({ quitada: true, conPedidos: true })
    act(() => result.current.restaurarColor(negro!.clave))
    expect(result.current.datosProducto.grupos[0]!.variantes[0]!.quitada).toBe(false)
    act(() => result.current.quitarColor(verde!.clave))
    act(() => result.current.cambiarExistencia(negro!.clave, negro!.variantes[0]!.clave, 9))
    let mensaje: string | null = null
    await act(async () => { mensaje = await result.current.guardarProducto() })
    expect(mensaje).toMatch('Se guardaron los cambios')
    const [, cuerpo, archivos] = vi.mocked(dependencia.producto.editarProducto).mock.calls[0]!
    expect(cuerpo.variantes).toEqual([{ idVariante: '40', stock: 9 }])
    expect(cuerpo.imagenes).toEqual([{ idImagen: '55', color: 'Negro' }])
    expect(archivos).toEqual([])
  })

  it('muestra el error de carga si el producto ya no existe', async () => {
    const dependencia = dependencias()
    vi.mocked(dependencia.producto.obtenerProductoParaEditar).mockRejectedValue(Object.assign(new Error('No encontrado'), { statusHTTP: 404 }))
    const { result } = await formulario(dependencia, '999')
    expect(result.current.errorCarga).toMatch('ya no existe')
  })
})

describe('ViewModels de catálogo', () => {
  it('abre en la búsqueda y página guardadas al volver del formulario', async () => {
    const { producto, catalogo } = dependencias()
    vi.mocked(producto.obtenerPagina!).mockResolvedValue({ productos: [dto], pagina: 2, tamano: 7, hayMas: false })
    const filtros = { ...filtrosVacios, estado: 'BORRADOR' as const }
    const modelo = new CatalogoModel(catalogo, producto)
    const { result } = renderHook(() => useCatalogoAdmin(modelo, { filtros, pagina: 2 }))
    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(producto.obtenerPagina).toHaveBeenCalledWith(2, 7, filtros)
    expect(result.current.consulta()).toEqual({ filtros, pagina: 2 })
  })

  it('conserva la búsqueda más reciente aunque la anterior termine después', async () => {
    const { producto, catalogo } = dependencias()
    delete producto.obtenerPagina
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
