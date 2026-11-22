import { describe, expect, it, vi } from 'vitest'
import { RespuestaValidacionComprobanteException } from '../dominio/RespuestaValidacionComprobanteException'
import { PedidoVentaMapper } from './mappers/PedidoVentaMapper'
import { crearModelosVenta } from './ModelosVenta'
import { gatewayFalso, pedidoFigma } from '../pruebas/fixturesVenta'

const AHORA = new Date('2026-10-23T18:37:00-07:00')
const png = () => new File(['imagen'], 'comprobante_ana_torres.png', { type: 'image/png' })

describe('PedidoVentaMapper', () => {
  it('arma el carrito de B1 con esquema, rango, progreso y totales del backend', () => {
    const carrito = PedidoVentaMapper.convertirPedidoVentaDTOaCarritoTs(pedidoFigma())
    expect(carrito).toMatchObject({ totalProductos: 4, totalPiezas: 11, subtotalPrecioBase: 4900, ahorroPorEsquema: 690, total: 4210, vacio: false })
    expect(carrito.esquema).toMatchObject({ etiqueta: 'Mayoreo', rango: '6–11 pzas', siguiente: { etiqueta: 'Distribuidor', minPiezas: 12, piezasFaltantes: 1 } })
    expect(carrito.esquema.progreso).toBeCloseTo(11 / 12)
    expect(carrito.lineas[0]?.descripcionVariante).toBe('Talla: Ajustable · Color: Negro')
    expect(carrito.lineas[2]?.descripcionVariante).toBe('Presentación: 100 ml · Caballero')
  })

  it('aplica el código a la línea de su producto, no al carrito (S7)', () => {
    const carrito = PedidoVentaMapper.convertirPedidoVentaDTOaCarritoTs(pedidoFigma(true))
    expect(carrito.lineas[0]).toMatchObject({ precioEsquema: 210, precioFinal: 189, subtotalSinCodigo: 1260, subtotal: 1134, codigoDescuento: { codigo: 'FLY10' } })
    expect(carrito.lineas[1]?.codigoDescuento).toBeNull()
    expect(carrito.descuentosCodigo).toEqual([{ codigo: 'FLY10', producto: '9FORTY LA Dodgers Negro', etiquetaValor: '10%', monto: 126 }])
    expect(carrito.total).toBe(4084)
  })

  it('usa los estados y esquemas del backend: «Cancelado por vencimiento», «Mixto», envío e id nulo del carrito vacío', () => {
    expect(PedidoVentaMapper.convertirEstado('CANCELADO_VENCIMIENTO')).toEqual({ valor: 'CANCELADO_VENCIMIENTO', etiqueta: 'Cancelado por vencimiento', tono: 'error' })
    expect(PedidoVentaMapper.convertirEstado('APARTADO_PENDIENTE_PAGO')).toMatchObject({ etiqueta: 'Pendiente de pago', tono: 'advertencia' })
    expect(PedidoVentaMapper.convertirEstado('PREPARACION')).toMatchObject({ etiqueta: 'En preparación' })

    const mixto = PedidoVentaMapper.convertirPedidoVentaDTOaCarritoTs({
      ...pedidoFigma(), tipoPrecioAplicado: 'MIXTO', siguienteTipoPrecio: null, piezasParaSiguienteNivel: null, nivelesPrecio: [],
    })
    expect(mixto.esquema).toMatchObject({ tipoPrecio: 'MIXTO', etiqueta: 'Mixto', porProducto: true, siguiente: null })
    const unProducto = PedidoVentaMapper.convertirPedidoVentaDTOaCarritoTs({ ...pedidoFigma(), detalles: pedidoFigma().detalles.slice(0, 1) })
    expect(unProducto.esquema.porProducto).toBe(false)
    expect(PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs({ ...pedidoFigma(), costoEnvio: 99 }).costoEnvio).toBe(99)

    const vacio = PedidoVentaMapper.convertirPedidoVentaDTOaCarritoTs({ ...pedidoFigma(), id: null, detalles: [], totalPiezas: 0, total: 0 })
    expect(vacio.vacio).toBe(true)
  })

  it('convierte el método de pago en su estado inicial y plazo de 42 h', () => {
    const efectivo = PedidoVentaMapper.convertirMetodoPagoDTOaMetodoPagoTs({ tipoPago: 'EFECTIVO', folio: 'F' }, AHORA)
    expect(efectivo).toMatchObject({ modalidad: 'EFECTIVO', estadoInicial: { etiqueta: 'Pendiente de pago', tono: 'advertencia' } })
    expect(efectivo.fechaLimiteEstimada?.getTime()).toBe(AHORA.getTime() + 42 * 3_600_000)
    const despues = PedidoVentaMapper.convertirMetodoPagoDTOaMetodoPagoTs({ tipoPago: 'TRANSFERENCIA', folio: 'F' }, AHORA)
    expect(despues).toMatchObject({ modalidad: 'COMPROBANTE_DESPUES', estadoInicial: { etiqueta: 'Pendiente de comprobante' } })
    const conComprobante = PedidoVentaMapper.convertirMetodoPagoDTOaMetodoPagoTs(
      { tipoPago: 'TRANSFERENCIA', folio: 'F', comprobanteRuta: 'r', comprobanteNombre: 'c.png' }, AHORA)
    expect(conComprobante).toMatchObject({ modalidad: 'COMPROBANTE', comprobanteNombre: 'c.png', fechaLimiteEstimada: null, estadoInicial: { etiqueta: 'Pago en revisión' } })
  })

  it('limpia los datos de entrega al registrar y lee el tipo de error sin depender de infraestructura', () => {
    const dto = PedidoVentaMapper.convertirDatosEntregaTsaDatosEntregaDTO({
      nombreCompleto: ' Ana ', telefono: '644 123 4567', ciudad: 'Obregón', estado: 'Sonora', direccion: 'Centro', referencias: '  ', guardarComoPredeterminada: false,
    })
    expect(dto).toMatchObject({ nombreCompleto: 'Ana', telefono: '6441234567', referencias: null })
    const errorRed = Object.assign(new Error('Sin conexión'), { tipo: 'RED' })
    expect(PedidoVentaMapper.convertirErrorAErrorTs(errorRed, 'x')).toEqual({ mensaje: 'Sin conexión', tipo: 'red' })
    expect(PedidoVentaMapper.convertirErrorAErrorTs('raro', 'Por defecto')).toEqual({ mensaje: 'Por defecto', tipo: 'desconocido' })
  })
})

describe('Modelos de gestionar venta', () => {
  it('carga el carrito y notifica a los suscritos (básico 3–9)', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso } = crearModelosVenta(gateway)
    const oyente = vi.fn()
    pedidoEnCurso.suscribir(oyente)
    const carrito = await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    expect(gateway.obtenerPedidoVentaEnCurso).toHaveBeenCalledWith('7')
    expect(carrito?.total).toBe(4210)
    expect(pedidoEnCurso.obtenerEstado()).toMatchObject({ cargando: false, carrito: { total: 4210 }, informacionPedido: { total: 4210 } })
    expect(oyente).toHaveBeenCalledTimes(2)
  })

  it('agregar desde la ficha (CU-01) deja el carrito al día y relanza el error para la ficha', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso } = crearModelosVenta(gateway)
    const carrito = await pedidoEnCurso.agregarAlCarrito(101, 6)
    expect(gateway.agregarAlCarrito).toHaveBeenCalledWith({ varianteProductoId: 101, cantidad: 6 })
    expect(carrito.totalPiezas).toBe(11)
    expect(pedidoEnCurso.obtenerEstado().carrito?.total).toBe(4210)
    vi.mocked(gateway.agregarAlCarrito).mockRejectedValueOnce(new Error('Sin existencia'))
    await expect(pedidoEnCurso.agregarAlCarrito(101, 99)).rejects.toThrow('Sin existencia')
  })

  it('cambia la cantidad (Alt1) y no llama al backend con cantidades inválidas', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso } = crearModelosVenta(gateway)
    await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    expect(await pedidoEnCurso.actualizarCantidad(101, 1.5)).toBeNull()
    expect(gateway.actualizarCantidad).not.toHaveBeenCalled()
    await pedidoEnCurso.actualizarCantidad(101, 7)
    expect(gateway.actualizarCantidad).toHaveBeenCalledWith({ varianteProductoId: 101, cantidad: 7 })
  })

  it('canjea un código (Alt2) y marca el campo si no es válido (A11) sin tocar el carrito', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso } = crearModelosVenta(gateway)
    await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    expect(await pedidoEnCurso.aplicarCodigoDescuento('  fly10 ')).toMatchObject({ total: 4084 })
    expect(gateway.aplicarCodigoDescuento).toHaveBeenCalledWith({ codigo: 'FLY10' })
    vi.mocked(gateway.aplicarCodigoDescuento).mockRejectedValueOnce(new Error('FLY2025 no existe, ya venció o no aplica a ningún producto de tu carrito.'))
    expect(await pedidoEnCurso.aplicarCodigoDescuento('FLY2025')).toBeNull()
    expect(pedidoEnCurso.obtenerEstado()).toMatchObject({ errorCodigo: expect.stringContaining('FLY2025'), carrito: { total: 4084 } })
  })

  it('valida los datos de entrega antes de pagar (A5)', async () => {
    const { datosEntrega } = crearModelosVenta(gatewayFalso())
    await datosEntrega.obtenerDatosEntrega('7')
    expect(datosEntrega.obtenerDatosEntregaTs()?.telefono).toBe('644 123 4567')
    datosEntrega.actualizarDatosEntrega({ telefono: '644 123 45', direccion: ' ' })
    expect(datosEntrega.validarDatosEntrega()).toBe(false)
    expect(datosEntrega.obtenerEstado().erroresCampo).toEqual({
      telefono: 'El teléfono debe tener 10 dígitos.', direccion: 'Este campo es obligatorio.',
    })
    datosEntrega.actualizarDatosEntrega({ telefono: '6441234567', direccion: 'Centro' })
    expect(datosEntrega.validarDatosEntrega()).toBe(true)
  })

  it('valida el comprobante en el backend y guarda la ruta, nunca el archivo (básico 41–46)', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso, datosEntrega } = crearModelosVenta(gateway, () => AHORA)
    await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    await datosEntrega.obtenerDatosEntrega('7')
    const archivo = png()
    const metodo = await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'TRANSFERENCIA', folio: 'FLY-000128', comprobantePagoArchivo: archivo })
    expect(gateway.validarMetodoPagoDTO).toHaveBeenCalledWith(expect.objectContaining({ comprobantePagoArchivo: archivo }))
    expect(metodo).toMatchObject({ modalidad: 'COMPROBANTE', comprobanteNombre: 'comprobante_ana_torres.png' })
    expect(pedidoEnCurso.obtenerInformacionPedidoTs()?.folio).toBe('FLY-000128')

    await pedidoEnCurso.registrarPedidoVenta()
    const enviado = vi.mocked(gateway.registrarPedidoVenta).mock.calls[0]![0]
    expect(enviado.metodoPago).toEqual({ tipoPago: 'TRANSFERENCIA', folio: 'FLY-000128', comprobanteRuta: 'comprobantes/FLY-000128.png', comprobanteNombre: 'comprobante_ana_torres.png' })
    expect(enviado.datosEntrega).toMatchObject({ nombreCompleto: 'Ana Torres', telefono: '6441234567' })
    expect(pedidoEnCurso.obtenerEstado()).toMatchObject({ carrito: null, pedidoRegistrado: { folio: 'FLY-000128', estado: { etiqueta: 'Pago en revisión' } } })

    const ticket = await pedidoEnCurso.generarComprobantePedidoVenta('FLY-000128')
    expect(gateway.generarComprobantePedidoVenta).toHaveBeenCalledWith('FLY-000128')
    expect(ticket).toMatchObject({ folio: 'FLY-000128', total: 4210, cliente: { nombre: 'Ana Torres' } })
    expect(pedidoEnCurso.obtenerEstado().pedidoRegistrado).toBe(ticket)
  })

  it('B7 por URL o recarga: pide el pedido registrado por su folio; si falla deja el mensaje', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso } = crearModelosVenta(gateway)
    expect(await pedidoEnCurso.generarComprobantePedidoVenta('FLY-000131')).toMatchObject({ folio: 'FLY-000131' })
    vi.mocked(gateway.generarComprobantePedidoVenta).mockRejectedValueOnce(new Error('No se encontró el pedido'))
    expect(await pedidoEnCurso.generarComprobantePedidoVenta('FLY-999999')).toBeNull()
    expect(pedidoEnCurso.obtenerEstado()).toMatchObject({ generandoComprobantePedido: false, errorComprobantePedido: 'No se encontró el pedido' })
  })

  it('no sube archivos inválidos (A6) y muestra el rechazo del backend (Alt5) o la falla de red (A7)', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso } = crearModelosVenta(gateway)
    await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    const heic = new File(['x'], 'IMG_4821.heic', { type: 'image/heic' })
    expect(await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'TRANSFERENCIA', folio: 'F', comprobantePagoArchivo: heic })).toBeNull()
    expect(gateway.validarMetodoPagoDTO).not.toHaveBeenCalled()
    expect(pedidoEnCurso.obtenerEstado().errorComprobante?.tipo).toBe('validacion')

    vi.mocked(gateway.validarMetodoPagoDTO).mockRejectedValueOnce(new RespuestaValidacionComprobanteException('El comprobante no es legible.'))
    await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'TRANSFERENCIA', folio: 'F', comprobantePagoArchivo: png() })
    expect(pedidoEnCurso.obtenerEstado()).toMatchObject({ metodoPago: null, errorComprobante: { mensaje: 'El comprobante no es legible.', tipo: 'validacion' } })

    vi.mocked(gateway.validarMetodoPagoDTO).mockRejectedValueOnce(Object.assign(new Error('Error de conexión.'), { tipo: 'RED' }))
    await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'TRANSFERENCIA', folio: 'F', comprobantePagoArchivo: png() })
    expect(pedidoEnCurso.obtenerEstado().errorComprobante?.tipo).toBe('red')
  })

  it.each([
    ['EFECTIVO', 'EFECTIVO'],
    ['TRANSFERENCIA', 'COMPROBANTE_DESPUES'],
  ] as const)('registra %s sin comprobante y sin validar en el backend (Alt3 y Alt4)', async (tipoPago, modalidad) => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso, datosEntrega } = crearModelosVenta(gateway, () => AHORA)
    await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    await datosEntrega.obtenerDatosEntrega('7')
    expect(await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago, folio: 'FLY-000129' })).toMatchObject({ modalidad })
    expect(gateway.validarMetodoPagoDTO).not.toHaveBeenCalled()
    await pedidoEnCurso.registrarPedidoVenta()
    expect(vi.mocked(gateway.registrarPedidoVenta).mock.calls[0]![0].metodoPago).toEqual({ tipoPago, folio: 'FLY-000129' })
  })

  it('conserva todo si falla el registro (A9) y permite reintentar', async () => {
    const gateway = gatewayFalso()
    const { pedidoEnCurso, datosEntrega } = crearModelosVenta(gateway)
    await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    await datosEntrega.obtenerDatosEntrega('7')
    await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'EFECTIVO', folio: 'F' })
    vi.mocked(gateway.registrarPedidoVenta).mockRejectedValueOnce(new Error('No se pudo guardar'))
    await pedidoEnCurso.registrarPedidoVenta()
    expect(pedidoEnCurso.obtenerEstado()).toMatchObject({ registrando: false, error: { mensaje: 'No se pudo guardar' }, pedidoRegistrado: null, metodoPago: { modalidad: 'EFECTIVO' } })
    await pedidoEnCurso.registrarPedidoVenta()
    expect(pedidoEnCurso.obtenerEstado()).toMatchObject({ error: null, pedidoRegistrado: { folio: 'F' } })
  })

  it('descarta el método de pago si el carrito cambia', async () => {
    const { pedidoEnCurso } = crearModelosVenta(gatewayFalso())
    await pedidoEnCurso.obtenerPedidoVentaEnCurso('7')
    await pedidoEnCurso.agregarMetodoPagoDTOaPedidoVentaDTO({ tipoPago: 'EFECTIVO', folio: 'F' })
    await pedidoEnCurso.actualizarCantidad(101, 5)
    expect(pedidoEnCurso.obtenerMetodoPagoTs()).toBeNull()
  })
})
