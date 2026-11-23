import { describe, expect, it, vi } from 'vitest'
import { ErrorGuardarProducto, ProductoModel, errorDeGrupo } from './ProductoModel'
import { CatalogoModel } from './CatalogoModel'
import { BajaProductoModel } from './BajaProductoModel'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { ICatalogoService } from '../dominio/puertos/ICatalogoService'
import type { DatosProductoTs, GrupoColorTs } from '../dominio/DatosProductoTs'
import type { ProductoEdicionDTO } from './dto/ProductoEdicionDTO'

function servicios() {
  const producto: IProductoService = {
    obtenerProductos: vi.fn(), buscarProductos: vi.fn(),
    crearProducto: vi.fn().mockResolvedValue(undefined),
    obtenerProductoParaEditar: vi.fn(), editarProducto: vi.fn(),
    darDeBajaProducto: vi.fn().mockResolvedValue({ idProducto: 'p1', tipoBaja: 'INACTIVADO' }),
  }
  const catalogo: ICatalogoService = {
    obtenerFiltrosDisponibles: vi.fn(), obtenerTallasPorCategoria: vi.fn(),
  }
  return { producto, catalogo }
}

const archivo = (nombre: string, tipo = 'image/png', contenido = 'imagen') => new File([contenido], nombre, { type: tipo })

const grupo = (color: string, cambios: Partial<GrupoColorTs> = {}): GrupoColorTs => ({
  clave: `g-${color}`, color, hex: null,
  variantes: [{ clave: `v-${color}`, idVariante: null, sku: null, talla: 'M', stock: 3, conPedidos: false, quitada: false }],
  fotos: [{ clave: `f-${color}`, idImagen: null, url: null, archivo: archivo(`${color}.png`), vistaPrevia: null }],
  ...cambios,
})

const datos = (): DatosProductoTs => ({ clave: 'TEN-01', nombre: 'Tenis', descripcion: 'Tenis deportivos',
  idCategoria: 'c1', idSubcategoria: 's1', idMarca: 'm1', estado: 'BORRADOR',
  grupos: [grupo('Rojo'), grupo('Azul')], fotosSinColor: [],
  precios: [{ tipoPrecio: 'BASE', precio: 100, minPiezas: 1 }],
})

const variantesCatalogo = [{ talla: 'M', color: 'Rojo', stock: 3 }, { talla: 'L', color: 'Azul', stock: 2 }]

const edicionDTO = (): ProductoEdicionDTO => ({
  idProducto: '72', clave: 'NE-940-LAD', nombre: '9FORTY LA', descripcion: 'Gorra', idCategoria: '1', categoria: 'Gorras',
  idSubcategoria: '3', subcategoria: '9FORTY', idMarca: '11', marca: 'New Era', estado: 'STOCK_BAJO',
  variantes: [
    { idVariante: '40', sku: 'NE-940-LAD-NEG', idTalla: '1', talla: 'Ajustable', idColor: '1', color: 'Negro', hex: '#000000', stock: 7, conPedidos: true },
    { idVariante: '41', sku: 'NE-940-LAD-AZM', idTalla: '1', talla: 'Ajustable', idColor: '2', color: 'Azul marino', hex: '#1b2a4a', stock: 0, conPedidos: false },
  ],
  preciosProducto: [{ tipoPrecio: 'BASE', precio: 450, minPiezas: 1 }, { tipoPrecio: 'SOCIO_COMERCIAL', precio: 320, minPiezas: 24 }],
  imagenes: [
    { idImagen: '56', url: 'https://cdn/negro-2.webp', idColor: '1', color: 'Negro', orden: 1 },
    { idImagen: '55', url: 'https://cdn/negro-1.webp', idColor: '1', color: 'Negro', orden: 0 },
    { idImagen: '57', url: 'https://cdn/azul.webp', idColor: '2', color: 'Azul marino', orden: 2 },
    { idImagen: '58', url: 'https://cdn/sin-color.webp', idColor: null, color: null, orden: 3 },
  ],
})

describe('ProductoModel · reglas del formulario', () => {
  it('rechaza existencias fraccionarias y precios sin mínimo válido', () => {
    const model = new ProductoModel(servicios().producto)
    expect(model.validarVariante({ talla: 'M', stock: 1.5, quitada: false })).not.toBeNull()
    expect(model.validarVariante({ talla: 'M', stock: 1.5, quitada: true })).toBeNull()
    expect(model.validarPrecio({ tipoPrecio: 'BASE', precio: NaN, minPiezas: 1 })).not.toBeNull()
    expect(model.validarPrecio({ tipoPrecio: 'BASE', precio: 100, minPiezas: 0 })).not.toBeNull()
    expect(model.validarDatosCompletos({ ...datos(), grupos: [], precios: [] })).toMatchObject({
      variantes: expect.any(String), precios: expect.any(String),
    })
  })

  it('exige al menos una foto por color, colores sin repetir y tallas únicas', () => {
    const model = new ProductoModel(servicios().producto)
    const sinFoto = grupo('Rojo', { fotos: [] })
    expect(model.validarDatosCompletos({ ...datos(), grupos: [sinFoto] })).toHaveProperty(errorDeGrupo(sinFoto.clave), 'Agrega al menos una foto de Rojo')
    const repetido = { ...grupo('rojo'), clave: 'otro' }
    expect(model.validarDatosCompletos({ ...datos(), grupos: [grupo('Rojo'), repetido] })).toHaveProperty(errorDeGrupo('otro'))
    const tallaDoble = grupo('Rojo', { variantes: [...grupo('Rojo').variantes, { ...grupo('Rojo').variantes[0]!, clave: 'v2' }] })
    expect(model.validarGrupo(tallaDoble)).toMatch('repetida')
    expect(model.validarGrupo(grupo('Morado'), ['Rojo', 'Azul'])).toBe('Selecciona un color de la lista')
  })

  it('limita a 10 las fotos nuevas por guardado y pide color para las fotos sin color', () => {
    const model = new ProductoModel(servicios().producto)
    const muchas = grupo('Rojo', { fotos: Array.from({ length: 11 }, (_, i) => ({ clave: `f${i}`, idImagen: null, url: null, archivo: archivo(`${i}.png`), vistaPrevia: null })) })
    expect(model.validarDatosCompletos({ ...datos(), grupos: [muchas] }).fotos).toMatch('hasta 10')
    const huerfana = { clave: 'h', idImagen: '9', url: 'https://cdn/x.webp', archivo: null, vistaPrevia: null, color: '' }
    expect(model.validarDatosCompletos({ ...datos(), fotosSinColor: [huerfana] }).fotos).toMatch('Asigna')
    expect(model.validarDatosCompletos({ ...datos(), fotosSinColor: [{ ...huerfana, color: 'Azul' }] })).not.toHaveProperty('fotos')
  })

  it('valida tipo y tamaño de cada archivo', () => {
    const model = new ProductoModel(servicios().producto)
    expect(model.validarArchivo(archivo('ok.webp', 'image/webp'))).toBeNull()
    expect(model.validarArchivo(archivo('doc.pdf', 'application/pdf'))).toMatch('no es JPG')
    expect(model.validarArchivo(archivo('vacio.png', 'image/png', ''))).toMatch('vacío')
    const pesado = archivo('pesado.jpg', 'image/jpeg')
    Object.defineProperty(pesado, 'size', { value: 6 * 1024 * 1024 })
    expect(model.validarArchivo(pesado)).toMatch('5 MB')
  })

  it('STOCK_BAJO no es estado de alta, pero se conserva al editar un producto que ya lo tenía', () => {
    const model = new ProductoModel(servicios().producto)
    expect(model.validarDatosCompletos({ ...datos(), estado: 'STOCK_BAJO' })).toHaveProperty('estado')
    expect(model.validarDatosCompletos({ ...datos(), estado: 'STOCK_BAJO' }, 'EDICION', 'PUBLICADO')).toHaveProperty('estado')
    expect(model.validarDatosCompletos({ ...datos(), estado: 'STOCK_BAJO' }, 'EDICION', 'STOCK_BAJO')).not.toHaveProperty('estado')
  })
})

describe('ProductoModel · contrato con el backend', () => {
  it('liga cada foto a su color y numera los archivos en el orden en que viajan', async () => {
    const { producto } = servicios()
    const model = new ProductoModel(producto)
    const rojo = grupo('Rojo', { fotos: [grupo('Rojo').fotos[0]!, { clave: 'r2', idImagen: null, url: null, archivo: archivo('rojo-2.png'), vistaPrevia: null }] })
    await model.registrarProducto({ ...datos(), grupos: [rojo, grupo('Azul')] })
    const [dto, archivos] = vi.mocked(producto.crearProducto).mock.calls[0]!
    expect(dto.imagenes).toEqual([{ archivo: 0, color: 'Rojo' }, { archivo: 1, color: 'Rojo' }, { archivo: 2, color: 'Azul' }])
    expect(archivos.map(item => item.name)).toEqual(['Rojo.png', 'rojo-2.png', 'Azul.png'])
    expect(dto.variantes).toEqual([{ talla: 'M', color: 'Rojo', stock: 3 }, { talla: 'M', color: 'Azul', stock: 3 }])
  })

  it('envía el agregado en un solo paso y permite corregir tras un rechazo', async () => {
    const { producto } = servicios()
    vi.mocked(producto.crearProducto).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValue(undefined)
    const model = new ProductoModel(producto)
    await expect(model.registrarProducto(datos())).rejects.toThrow('Sin conexión')
    await model.registrarProducto(datos())
    expect(producto.crearProducto).toHaveBeenCalledTimes(2)
    expect(producto.crearProducto).toHaveBeenLastCalledWith(expect.objectContaining({ preciosProducto: datos().precios }), expect.any(Array))
  })

  it('traduce una clave repetida (409) a un error del campo clave', async () => {
    const { producto } = servicios()
    vi.mocked(producto.crearProducto).mockRejectedValue(Object.assign(new Error('La clave ya existe'), { statusHTTP: 409 }))
    const error = await new ProductoModel(producto).registrarProducto(datos()).catch(e => e)
    expect(error).toBeInstanceOf(ErrorGuardarProducto)
    expect(error).toMatchObject({ campo: 'clave', message: 'La clave ya existe' })
  })

  it('agrupa el producto guardado por color y aparta las fotos sin color', () => {
    const edicion = new ProductoModel(servicios().producto).aProductoEdicion(edicionDTO())
    expect(edicion).toMatchObject({ idProducto: '72', categoria: 'Gorras', estadoOriginal: 'STOCK_BAJO' })
    expect(edicion.datos.grupos.map(g => [g.color, g.hex, g.fotos.map(f => f.idImagen)])).toEqual([
      ['Negro', '#000000', ['55', '56']], ['Azul marino', '#1b2a4a', ['57']],
    ])
    expect(edicion.datos.grupos[0]!.variantes[0]).toMatchObject({ idVariante: '40', conPedidos: true, quitada: false })
    expect(edicion.datos.fotosSinColor).toMatchObject([{ idImagen: '58', color: '' }])
    expect(edicion.datos.precios.map(p => p.tipoPrecio)).toEqual(['BASE', 'SOCIO_COMERCIAL'])
  })

  it('al editar: variantes guardadas solo con existencia, quitadas fuera y fotos conservadas por id', async () => {
    const { producto } = servicios()
    vi.mocked(producto.editarProducto).mockResolvedValue(edicionDTO())
    const model = new ProductoModel(producto)
    const { datos: formulario, estadoOriginal } = model.aProductoEdicion(edicionDTO())
    const [negro, azul] = formulario.grupos
    negro!.variantes[0]!.stock = 12
    negro!.variantes.push({ clave: 'nueva', idVariante: null, sku: null, talla: '7 1/4', stock: 2, conPedidos: false, quitada: false })
    negro!.fotos.push({ clave: 'nueva-foto', idImagen: null, url: null, archivo: archivo('negro-3.png'), vistaPrevia: null })
    azul!.variantes[0]!.quitada = true
    formulario.fotosSinColor[0]!.color = 'Negro'
    await model.guardarCambios('72', formulario, estadoOriginal)
    const [id, dto, archivos] = vi.mocked(producto.editarProducto).mock.calls[0]!
    expect(id).toBe('72')
    expect(dto.variantes).toEqual([{ idVariante: '40', stock: 12 }, { talla: '7 1/4', color: 'Negro', stock: 2 }])
    expect(dto.imagenes).toEqual([
      { idImagen: '55', color: 'Negro' }, { idImagen: '56', color: 'Negro' }, { archivo: 0, color: 'Negro' }, { idImagen: '58', color: 'Negro' },
    ])
    expect(archivos.map(item => item.name)).toEqual(['negro-3.png'])
    expect(dto).not.toHaveProperty('idCategoria')
  })
})

describe('Modelos del catálogo', () => {
  it('mapea imagen, estado, precios y existencias desde los DTO', async () => {
    const { producto, catalogo } = servicios()
    vi.mocked(producto.obtenerProductos).mockResolvedValue([{
      idProducto: 'p1', clave: 'TEN-01', nombre: 'Tenis', img: '/tenis.png',
      categoria: 'Calzado', subcategoria: 'Deportivo', marca: 'Fly', estado: 'PUBLICADO',
      variantes: variantesCatalogo, preciosProducto: datos().precios,
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
    const dto = {idProducto:'1',clave:'CINCO',nombre:'Gorra',img:'',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado:'PUBLICADO',variantes:variantesCatalogo,preciosProducto:precios}
    vi.mocked(producto.obtenerProductos).mockResolvedValue([dto])
    vi.mocked(producto.buscarProductos).mockResolvedValue([dto])
    const modelo = new CatalogoModel(catalogo,producto)
    expect((await modelo.obtenerCatalogo())[0]?.precios).toEqual(precios)
    expect((await modelo.buscarProductos({texto:'Gorra',idCategoria:'',idSubcategoria:'',idMarca:'',estado:null}))[0]?.precios).toEqual(precios)
  })

  it.each(['PUBLICADO', 'STOCK_BAJO', 'INACTIVO', 'BORRADOR'])('preserva el estado %s del backend al listar y buscar', async estado => {
    const { producto, catalogo } = servicios()
    const dto = {idProducto:'7',clave:'ESTADO',nombre:'Gorra',img:'',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado,variantes:variantesCatalogo,preciosProducto:datos().precios}
    vi.mocked(producto.obtenerProductos).mockResolvedValue([dto])
    vi.mocked(producto.buscarProductos).mockResolvedValue([dto])
    const modelo = new CatalogoModel(catalogo,producto)
    expect((await modelo.obtenerCatalogo())[0]?.estado).toBe(estado)
    expect((await modelo.buscarProductos({texto:'Gorra',idCategoria:'',idSubcategoria:'',idMarca:'',estado:null}))[0]?.estado).toBe(estado)
  })
})
