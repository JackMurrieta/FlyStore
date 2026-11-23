import { describe, expect, it, vi } from 'vitest'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import { CRITERIOS_VACIOS } from '../dominio/ReglasCatalogo'
import {
  carritoFalso, detalleDodgers, diferida, gatewayFalso, paginaCaps, pendientesEnMemoria, tarjeta,
} from '../pruebas/fixturesCatalogo'
import { CatalogoEnCursoModel } from './CatalogoEnCursoModel'
import { DetalleProductoModel, MENSAJE_PERSONAL } from './DetalleProductoModel'
import { crearModelosCatalogo, invalidarModelosCatalogo } from './ModelosCatalogo'
import { CatalogoMapper } from './mappers/CatalogoMapper'
import type { CatalogoRespuestaDTO } from './dto/CatalogoRespuestaDTO'

const CAPS = { tipo: 'linea', ruta: 'caps' } as const

describe('CatalogoMapper', () => {
  it('tarjeta con colores y precio de referencia; datos faltantes no rompen', () => {
    const t = CatalogoMapper.aProductoTarjetaTs(tarjeta(10, 'Dodgers', { colores: null, imagenUrl: '' }))
    expect(t).toMatchObject({ id: 10, imagenUrl: null, colores: [], precio: { tipoPrecio: 'MAYOREO', etiqueta: 'Mayoreo', precio: 210 } })
    const pagina = CatalogoMapper.aPaginaCatalogoTs(paginaCaps({ opcionesFiltro: undefined as unknown as CatalogoRespuestaDTO['opcionesFiltro'] }))
    expect(pagina.opciones.ordenes.length).toBe(5)
    expect(pagina.opciones.marcas).toEqual([])
  })

  it('ficha: esquemas ordenados por piezas y variante sin existencia no disponible', () => {
    const d = CatalogoMapper.aDetalleProductoTs(detalleDodgers({
      precios: [{ tipoPrecio: 'DISTRIBUIDOR', minPiezas: 12, precio: 190, referencia: false }, { tipoPrecio: 'BASE', minPiezas: 1, precio: 250, referencia: true }],
    }))
    expect(d.precios.map(p => p.tipoPrecio)).toEqual(['BASE', 'DISTRIBUIDOR'])
    expect(d.variantes.find(v => v.id === 102)?.disponible).toBe(false)
  })

  it('errores: red, 404 (negocio) y 500 con mensaje de respaldo', () => {
    expect(CatalogoMapper.aErrorTs(new ErrorApi('x', 'RED'), 'r').tipo).toBe('red')
    expect(CatalogoMapper.aErrorTs(new ErrorApi('No existe', 'NEGOCIO', undefined, undefined, 404), 'r')).toEqual({ mensaje: 'No existe', tipo: 'negocio' })
    expect(CatalogoMapper.aErrorTs(new ErrorApi('SQL', 'DESCONOCIDO', undefined, undefined, 500), 'Respaldo').mensaje).toBe('Respaldo')
  })
})

describe('CatalogoEnCursoModel', () => {
  it('carga la línea y no vuelve a pedirla con los mismos criterios (regreso de la ficha)', async () => {
    const gateway = gatewayFalso()
    const modelo = new CatalogoEnCursoModel(gateway)
    await modelo.cargar(CAPS, CRITERIOS_VACIOS)
    await modelo.cargar(CAPS, CRITERIOS_VACIOS)
    expect(gateway.consultarLinea).toHaveBeenCalledTimes(1)
    expect(modelo.obtenerEstado()).toMatchObject({ total: 2, tipoPrecioReferencia: 'MAYOREO', cargando: false })
    expect(modelo.obtenerEstado().opciones?.marcas.map(m => m.nombre)).toEqual(['New Era', 'Mitchell & Ness'])
  })

  it('una respuesta vieja no pisa a la consulta más reciente', async () => {
    const gateway = gatewayFalso()
    const lenta = diferida<CatalogoRespuestaDTO>()
    gateway.consultarLinea
      .mockReturnValueOnce(lenta.promesa)
      .mockResolvedValueOnce(paginaCaps({ productos: [tarjeta(30, 'Nueva')], total: 1 }))
    const modelo = new CatalogoEnCursoModel(gateway)
    const primera = modelo.cargar(CAPS, CRITERIOS_VACIOS)
    await modelo.cargar(CAPS, { ...CRITERIOS_VACIOS, marcas: [1] })
    lenta.resolver(paginaCaps())
    await primera
    expect(modelo.obtenerEstado().productos.map(p => p.id)).toEqual([30])
  })

  it('S3 «Ver más»: agrega el siguiente bloque sin repetir y conserva los criterios', async () => {
    const gateway = gatewayFalso()
    gateway.consultarLinea
      .mockResolvedValueOnce(paginaCaps({ total: 3, hayMas: true }))
      .mockResolvedValueOnce(paginaCaps({ pagina: 1, total: 3, hayMas: false, productos: [tarjeta(11, 'Repetida'), tarjeta(12, 'Otra')] }))
    const modelo = new CatalogoEnCursoModel(gateway)
    const criterios = { ...CRITERIOS_VACIOS, orden: 'PRECIO_ASC' as const }
    await modelo.cargar(CAPS, criterios)
    await modelo.cargarMas()
    expect(gateway.consultarLinea).toHaveBeenLastCalledWith('caps', criterios, 1)
    expect(modelo.obtenerEstado().productos.map(p => p.id)).toEqual([10, 11, 12])
    expect(modelo.obtenerEstado().hayMas).toBe(false)
  })

  it('A1 · búsqueda en blanco no consulta; A4 · error y reintentar', async () => {
    const gateway = gatewayFalso()
    const modelo = new CatalogoEnCursoModel(gateway)
    await modelo.cargar({ tipo: 'busqueda', linea: null }, CRITERIOS_VACIOS)
    expect(gateway.buscar).not.toHaveBeenCalled()
    expect(modelo.obtenerEstado().error?.tipo).toBe('validacion')

    gateway.consultarLinea.mockRejectedValueOnce(new ErrorApi('x', 'RED'))
    await modelo.cargar(CAPS, CRITERIOS_VACIOS)
    expect(modelo.obtenerEstado().error?.tipo).toBe('red')
    await modelo.reintentar()
    expect(modelo.obtenerEstado().error).toBeNull()
    expect(modelo.obtenerEstado().total).toBe(2)
  })

  it('invalidar (cambio de sesión) obliga a volver a consultar', async () => {
    const gateway = gatewayFalso()
    const modelo = new CatalogoEnCursoModel(gateway)
    await modelo.cargar(CAPS, CRITERIOS_VACIOS)
    modelo.invalidar()
    await modelo.cargar(CAPS, CRITERIOS_VACIOS)
    expect(gateway.consultarLinea).toHaveBeenCalledTimes(2)
  })
})

describe('DetalleProductoModel · Agregar al carrito (CU-01 → CU-02)', () => {
  function crear(pendiente = pendientesEnMemoria()) {
    const gateway = gatewayFalso()
    const carrito = carritoFalso()
    const modelo = new DetalleProductoModel(gateway, carrito, pendiente)
    return { gateway, carrito, pendiente, modelo }
  }

  it('abre con el color de la tarjeta si tiene existencia; si no, con uno disponible', async () => {
    const { modelo } = crear()
    await modelo.cargar(10, 2)
    expect(modelo.obtenerEstado()).toMatchObject({ idColor: 1, idVariante: 101, cantidad: 1 })
  })

  it('cliente: agrega la variante y la cantidad elegidas y muestra el aviso', async () => {
    const { modelo, carrito } = crear()
    await modelo.cargar(10)
    modelo.cambiarCantidad(6)
    await modelo.agregarAlCarrito('cliente')
    expect(carrito.agregar).toHaveBeenCalledWith(101, 6)
    expect(modelo.obtenerEstado().agregado).toEqual({ producto: '9FORTY LA Dodgers', variante: 'Negro · Ajustable', cantidad: 6 })
  })

  it('sin sesión: guarda lo elegido y pide iniciar sesión; al volver con sesión se agrega solo', async () => {
    const { modelo, carrito, pendiente } = crear()
    await modelo.cargar(10)
    modelo.cambiarCantidad(3)
    await modelo.agregarAlCarrito('anonimo')
    expect(carrito.agregar).not.toHaveBeenCalled()
    expect(modelo.obtenerEstado().pideSesion).toBe(true)
    expect(pendiente.valor).toEqual({ idProducto: 10, idVariante: 101, cantidad: 3 })

    // Vuelve a la ficha ya con sesión: recupera la elección y la agrega.
    await modelo.cargar(10)
    expect(modelo.obtenerEstado().cantidad).toBe(3)
    await modelo.completarPendiente('cliente')
    expect(carrito.agregar).toHaveBeenCalledWith(101, 3)
    expect(pendiente.valor).toBeNull()
  })

  it('sesión vencida (401): conserva lo elegido y vuelve a pedir sesión', async () => {
    const { modelo, carrito, pendiente } = crear()
    carrito.agregar.mockRejectedValueOnce(new ErrorApi('Sesión expirada', 'NEGOCIO', undefined, undefined, 401))
    await modelo.cargar(10)
    await modelo.agregarAlCarrito('cliente')
    expect(modelo.obtenerEstado()).toMatchObject({ pideSesion: true, agregando: false })
    expect(pendiente.valor?.idVariante).toBe(101)
  })

  it('personal (403 o rol) no compra; variante agotada (A5) no se envía', async () => {
    const { modelo, carrito } = crear()
    await modelo.cargar(10)
    await modelo.agregarAlCarrito('personal')
    expect(modelo.obtenerEstado().errorAgregar).toBe(MENSAJE_PERSONAL)
    modelo.elegirColor(2)
    await modelo.agregarAlCarrito('cliente')
    expect(modelo.obtenerEstado().errorAgregar).toMatch(/agotada/)
    modelo.elegirColor(1)
    carrito.agregar.mockRejectedValueOnce(new ErrorApi('Prohibido', 'NEGOCIO', undefined, undefined, 403))
    await modelo.agregarAlCarrito('cliente')
    expect(modelo.obtenerEstado().errorAgregar).toBe(MENSAJE_PERSONAL)
  })

  it('el pendiente de otro producto no se agrega en esta ficha', async () => {
    const { modelo, carrito } = crear(pendientesEnMemoria({ idProducto: 99, idVariante: 1, cantidad: 2 }))
    await modelo.cargar(10)
    await modelo.completarPendiente('cliente')
    expect(carrito.agregar).not.toHaveBeenCalled()
  })

  it('al cambiar la sesión la ficha se refresca sin perder color, cantidad ni el aviso de sesión', async () => {
    const gateway = gatewayFalso()
    const modelos = crearModelosCatalogo(gateway, carritoFalso(), pendientesEnMemoria())
    await modelos.detalle.cargar(10)
    modelos.detalle.cambiarCantidad(4)
    await modelos.detalle.agregarAlCarrito('anonimo')
    gateway.obtenerProducto.mockResolvedValueOnce(detalleDodgers({ precioReferencia: { tipoPrecio: 'BASE', precio: 250, minPiezas: 1 } }))
    invalidarModelosCatalogo(modelos)
    await vi.waitFor(() => expect(modelos.detalle.obtenerEstado().detalle?.precioReferencia.tipoPrecio).toBe('BASE'))
    expect(modelos.detalle.obtenerEstado()).toMatchObject({ idVariante: 101, cantidad: 4, pideSesion: true })
  })
})
