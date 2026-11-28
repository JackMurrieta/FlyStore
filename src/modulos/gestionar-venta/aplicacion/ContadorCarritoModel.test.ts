import { describe, expect, it, vi } from 'vitest'
import { crearModelosVenta, reiniciarModelosVenta } from './ModelosVenta'
import { gatewayFalso, pedidoFigma } from '../pruebas/fixturesVenta'
import type { PedidoVentaDTO } from './dto/PedidoVentaDTO'

const AHORA = new Date('2026-10-23T18:37:00-07:00')
const png = () => new File(['imagen'], 'comprobante.png', { type: 'image/png' })
const vacio = (): PedidoVentaDTO => ({ ...pedidoFigma(), detalles: [] })

describe('ContadorCarritoModel (contador del encabezado)', () => {
  it('consulta el carrito una sola vez y cuenta productos distintos, no piezas', async () => {
    const gateway = gatewayFalso()
    const { contadorCarrito } = crearModelosVenta(gateway)
    expect(contadorCarrito.obtenerProductos()).toBeNull()

    contadorCarrito.cargar('7')
    contadorCarrito.cargar('7')
    await vi.waitFor(() => expect(contadorCarrito.obtenerProductos()).toBe(4))
    contadorCarrito.cargar('7')
    expect(gateway.obtenerPedidoVentaEnCurso).toHaveBeenCalledTimes(1)
  })

  it('no toca el estado del pedido en curso al consultar', async () => {
    const { contadorCarrito, pedidoEnCurso } = crearModelosVenta(gatewayFalso())
    const antes = pedidoEnCurso.obtenerEstado()
    contadorCarrito.cargar('7')
    await vi.waitFor(() => expect(contadorCarrito.obtenerProductos()).toBe(4))
    expect(pedidoEnCurso.obtenerEstado()).toBe(antes)
  })

  it('sigue al carrito: agregar desde la ficha, quitar una línea y registrar el pedido', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.actualizarCantidad).mockResolvedValue({ ...pedidoFigma(), detalles: pedidoFigma().detalles.slice(1) })
    const { contadorCarrito, pedidoEnCurso, datosEntrega } = crearModelosVenta(gateway, () => AHORA)
    const oyente = vi.fn()
    contadorCarrito.suscribir(oyente)

    await pedidoEnCurso.agregarAlCarrito(101, 1)
    expect(contadorCarrito.obtenerProductos()).toBe(4)
    expect(oyente).toHaveBeenCalled()

    await pedidoEnCurso.actualizarCantidad(1, 0)
    expect(contadorCarrito.obtenerProductos()).toBe(3)

    await datosEntrega.obtenerDatosEntrega('7')
    await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'TRANSFERENCIA', folio: 'FLY-000128', comprobantePagoArchivo: png() })
    await pedidoEnCurso.registrarPedidoVenta()
    expect(contadorCarrito.obtenerProductos()).toBe(0)
  })

  it('si el carrito cambia mientras consulta, manda el cambio más reciente', async () => {
    const gateway = gatewayFalso()
    let responder: (dto: PedidoVentaDTO) => void = () => {}
    vi.mocked(gateway.obtenerPedidoVentaEnCurso).mockImplementation(() => new Promise((r) => { responder = r }))
    const { contadorCarrito, pedidoEnCurso } = crearModelosVenta(gateway)

    contadorCarrito.cargar('7')
    await pedidoEnCurso.agregarAlCarrito(101, 1)
    responder(vacio())
    await Promise.resolve()
    expect(contadorCarrito.obtenerProductos()).toBe(4)
  })

  it('al cerrar sesión se olvida y descarta respuestas que llegan tarde', async () => {
    const gateway = gatewayFalso()
    let responder: (dto: PedidoVentaDTO) => void = () => {}
    vi.mocked(gateway.obtenerPedidoVentaEnCurso).mockImplementation(() => new Promise((r) => { responder = r }))
    const modelos = crearModelosVenta(gateway)

    modelos.contadorCarrito.cargar('7')
    reiniciarModelosVenta(modelos)
    responder(pedidoFigma())
    await Promise.resolve()
    expect(modelos.contadorCarrito.obtenerProductos()).toBeNull()
  })

  it('si la consulta falla no muestra contador y vuelve a intentar después', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.obtenerPedidoVentaEnCurso).mockRejectedValueOnce(new Error('sin red'))
    const { contadorCarrito } = crearModelosVenta(gateway)

    contadorCarrito.cargar('7')
    await vi.waitFor(() => expect(gateway.obtenerPedidoVentaEnCurso).toHaveBeenCalledTimes(1))
    expect(contadorCarrito.obtenerProductos()).toBeNull()
    // Al volver a montarse el encabezado (otra página) lo intenta de nuevo.
    await vi.waitFor(() => {
      contadorCarrito.cargar('7')
      expect(contadorCarrito.obtenerProductos()).toBe(4)
    })
    expect(gateway.obtenerPedidoVentaEnCurso).toHaveBeenCalledTimes(2)
  })
})
