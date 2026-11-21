/**
 * Gateway en memoria del CU-02 para probar la presentación sin backend (solo desarrollo).
 * Reproduce los datos del Figma: 11 piezas a precio Mayoreo, total $4,210 y el código FLY10.
 * No hace peticiones ni guarda nada en el navegador; una recarga reinicia los datos.
 */

import type { IGestionarVentaGateway } from '@modulos/gestionar-venta'
import type { PedidoVentaDTO } from '@modulos/gestionar-venta/aplicacion/dto/PedidoVentaDTO'
import type { DetallePedidoDTO } from '@modulos/gestionar-venta/aplicacion/dto/DetallePedidoDTO'
import type { DatosEntregaDTO } from '@modulos/gestionar-venta/aplicacion/dto/DatosEntregaDTO'
import type { NivelPrecioDTO } from '@modulos/gestionar-venta/aplicacion/dto/NivelPrecioDTO'
import { RespuestaValidacionComprobanteException } from '@modulos/gestionar-venta/dominio/RespuestaValidacionComprobanteException'
import { validarArchivoComprobante, HORAS_LIMITE_PAGO } from '@modulos/gestionar-venta/dominio/ReglasVenta'

type Esquema = 'BASE' | 'MAYOREO' | 'DISTRIBUIDOR'

const HORA_MS = 3_600_000

interface ProductoDemo {
  readonly varianteProductoId: number
  readonly productoNombre: string
  readonly marca: string
  readonly tipoTalla: string
  readonly talla: string
  readonly color: string | null
  readonly existencia: number
  readonly precios: Record<Esquema, number>
}

const NIVELES: readonly NivelPrecioDTO[] = [
  { tipoPrecio: 'BASE', minPiezas: 1 },
  { tipoPrecio: 'MAYOREO', minPiezas: 6 },
  { tipoPrecio: 'DISTRIBUIDOR', minPiezas: 12 },
]

const PRODUCTOS: readonly ProductoDemo[] = [
  { varianteProductoId: 101, productoNombre: '9FORTY LA Dodgers Negro', marca: 'New Era', tipoTalla: 'Talla', talla: 'Ajustable', color: 'Negro', existencia: 18, precios: { BASE: 250, MAYOREO: 210, DISTRIBUIDOR: 190 } },
  { varianteProductoId: 102, productoNombre: '59FIFTY NY Yankees Negro', marca: 'New Era', tipoTalla: 'Talla', talla: '7 ⅜', color: 'Negro', existencia: 10, precios: { BASE: 300, MAYOREO: 260, DISTRIBUIDOR: 240 } },
  { varianteProductoId: 103, productoNombre: 'Asad Eau de Parfum 100 ml', marca: 'Lattafa', tipoTalla: 'Presentación', talla: '100 ml · Caballero', color: null, existencia: 5, precios: { BASE: 600, MAYOREO: 520, DISTRIBUIDOR: 480 } },
  { varianteProductoId: 104, productoNombre: "Air Force 1 '07 Negro", marca: 'Nike', tipoTalla: 'Talla', talla: '27 MX', color: 'Negro', existencia: 3, precios: { BASE: 1900, MAYOREO: 1650, DISTRIBUIDOR: 1550 } },
]

/** Códigos válidos en la prueba: FLY10 = 10 % en la 9FORTY LA Dodgers. */
const CODIGOS: Readonly<Record<string, { varianteProductoId: number; porcentaje: number }>> = {
  FLY10: { varianteProductoId: 101, porcentaje: 10 },
}

const ENTREGA: DatosEntregaDTO = {
  nombreCompleto: 'Ana Torres',
  telefono: '6441234567',
  ciudad: 'Ciudad Obregón',
  estado: 'Sonora',
  direccion: 'Calle 5 de Febrero 1234, Col. Centro, C.P. 85000',
  referencias: 'Portón negro, frente al parque',
  guardarComoPredeterminada: true,
}

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms))

export function crearGatewayVentaDemo(retardoMs = 350): IGestionarVentaGateway {
  const cantidades = new Map<number, number>([[101, 6], [102, 3], [103, 1], [104, 1]])
  const codigos = new Map<number, string>()
  let folio: string | null = null
  let consecutivo = 132
  // Pedidos ya registrados de la clienta de prueba (S6 «Mis pedidos»), del más reciente al más antiguo.
  const registrados: PedidoVentaDTO[] = []
  let muestrasCreadas = false

  const pedido = (): PedidoVentaDTO => {
    const lineas = PRODUCTOS.filter((p) => (cantidades.get(p.varianteProductoId) ?? 0) > 0)
    const totalPiezas = lineas.reduce((suma, p) => suma + (cantidades.get(p.varianteProductoId) ?? 0), 0)
    const nivel = ([...NIVELES].reverse().find((n) => totalPiezas >= n.minPiezas) ?? NIVELES[0]!) as NivelPrecioDTO & { tipoPrecio: Esquema }
    const siguiente = NIVELES[NIVELES.indexOf(nivel) + 1] ?? null
    const detalles: DetallePedidoDTO[] = lineas.map((p, indice) => {
      const cantidad = cantidades.get(p.varianteProductoId) ?? 0
      const precioUnitario = p.precios[nivel.tipoPrecio]
      const codigo = codigos.get(p.varianteProductoId)
      const porcentaje = codigo ? CODIGOS[codigo]?.porcentaje ?? 0 : 0
      const descuentoUnitario = Math.round(precioUnitario * porcentaje) / 100
      return {
        id: indice + 1,
        varianteProductoId: p.varianteProductoId,
        productoNombre: p.productoNombre,
        marca: p.marca,
        tipoTalla: p.tipoTalla,
        talla: p.talla,
        color: p.color,
        imagenUrl: null,
        cantidad,
        existencia: p.existencia,
        tipoPrecio: nivel.tipoPrecio,
        precioBase: p.precios.BASE,
        precioUnitario,
        descuentoUnitario,
        codigoDescuento: codigo ? { codigo, etiquetaValor: `${porcentaje}%`, montoDescuento: descuentoUnitario * cantidad } : null,
        subtotal: (precioUnitario - descuentoUnitario) * cantidad,
      }
    })
    const subtotalPrecioBase = detalles.reduce((s, d) => s + d.precioBase * d.cantidad, 0)
    const totalEsquema = detalles.reduce((s, d) => s + d.precioUnitario * d.cantidad, 0)
    const totalDescuentos = detalles.reduce((s, d) => s + d.descuentoUnitario * d.cantidad, 0)
    return {
      id: 1,
      folio,
      estadoVenta: 'PENDIENTE',
      detalles,
      totalPiezas,
      tipoPrecioAplicado: nivel.tipoPrecio,
      siguienteTipoPrecio: siguiente?.tipoPrecio ?? null,
      piezasParaSiguienteNivel: siguiente ? siguiente.minPiezas - totalPiezas : null,
      nivelesPrecio: NIVELES,
      subtotalPrecioBase,
      ahorroPorTipoPrecio: subtotalPrecioBase - totalEsquema,
      totalDescuentos,
      costoEnvio: 0,
      total: totalEsquema - totalDescuentos,
      datosEntrega: null,
      metodoPago: null,
      fechaHoraPedido: null,
      fechaLimitePago: null,
      enlaceWhatsapp: null,
    }
  }

  const muestraBase = pedido()

  return {
    async obtenerPedidoVentaEnCurso() { await esperar(retardoMs); return pedido() },

    async actualizarCantidad({ varianteProductoId, cantidad }) {
      await esperar(retardoMs)
      const producto = PRODUCTOS.find((p) => p.varianteProductoId === varianteProductoId)
      if (!producto) throw new Error('El producto ya no está en tu carrito.')
      if (cantidad > producto.existencia) {
        throw new Error(`Solo quedan ${producto.existencia} piezas de ${producto.productoNombre}. Ajusta la cantidad.`)
      }
      cantidades.set(varianteProductoId, cantidad)
      if (cantidad === 0) codigos.delete(varianteProductoId)
      return pedido()
    },

    async aplicarCodigoDescuento({ codigo }) {
      await esperar(retardoMs)
      const regla = CODIGOS[codigo]
      if (!regla || !(cantidades.get(regla.varianteProductoId) ?? 0)) {
        throw new Error(`${codigo} no existe, ya venció o no aplica a ningún producto de tu carrito.`)
      }
      if (codigos.has(regla.varianteProductoId)) throw new Error('Ese producto ya tiene un código aplicado.')
      codigos.set(regla.varianteProductoId, codigo)
      return pedido()
    },

    async obtenerDatosEntrega() { await esperar(retardoMs); return { ...ENTREGA } },

    async obtenerDatosBancarios() {
      await esperar(retardoMs)
      folio ??= `FLY-${String(consecutivo).padStart(6, '0')}`
      return { banco: 'Mercado Pago W', titular: 'FLY Store', numeroCuenta: '1234 5678 9012', clabe: '722 969 0101 2345 6789', folio }
    },

    async validarMetodoPagoDTO(dto) {
      await esperar(retardoMs * 2)
      const archivo = dto.comprobantePagoArchivo
      const error = archivo ? validarArchivoComprobante(archivo) : 'Selecciona un archivo.'
      if (error) throw new RespuestaValidacionComprobanteException(error)
      return { comprobanteRuta: `comprobantes/${dto.folio}/${archivo?.name ?? ''}`, valido: true, mensaje: 'Comprobante recibido' }
    },

    async registrarPedidoVenta(dto) {
      await esperar(retardoMs * 2)
      const ahora = new Date()
      const tipoPago = dto.metodoPago?.tipoPago
      const conComprobante = Boolean(dto.metodoPago?.comprobanteRuta)
      const estadoVenta = tipoPago === 'EFECTIVO' ? 'APARTADO_PENDIENTE_PAGO' : conComprobante ? 'PAGO_EN_REVISION' : 'PENDIENTE_COMPROBANTE'
      const registrado: PedidoVentaDTO = {
        ...pedido(),
        folio: dto.folio,
        estadoVenta,
        datosEntrega: dto.datosEntrega,
        metodoPago: dto.metodoPago,
        fechaHoraPedido: ahora.toISOString(),
        fechaLimitePago: conComprobante ? null : new Date(ahora.getTime() + HORAS_LIMITE_PAGO * HORA_MS).toISOString(),
        enlaceWhatsapp: `https://wa.me/?text=${encodeURIComponent(`Hola, hice el pedido ${dto.folio ?? ''} en FlyStore.`)}`,
      }
      asegurarMuestras()
      registrados.unshift(registrado)
      // El carrito queda vacío y el siguiente pedido tendrá otro folio.
      cantidades.clear()
      codigos.clear()
      folio = null
      consecutivo += 1
      return registrado
    },

    async generarComprobantePedidoVenta(folioPedido) {
      await esperar(retardoMs)
      return buscarRegistrado(folioPedido)
    },

    async listarPedidosVenta() {
      await esperar(retardoMs)
      asegurarMuestras()
      return [...registrados]
    },

    async obtenerDatosBancariosPedidoVenta(folioPedido) {
      await esperar(retardoMs)
      return { banco: 'Mercado Pago W', titular: 'FLY Store', numeroCuenta: '1234 5678 9012', clabe: '722 969 0101 2345 6789', folio: folioPedido }
    },

    async subirComprobantePedidoVenta(folioPedido, archivo) {
      await esperar(retardoMs * 2)
      const error = validarArchivoComprobante(archivo)
      if (error) throw new RespuestaValidacionComprobanteException(error)
      const actual = buscarRegistrado(folioPedido)
      if (actual.estadoVenta !== 'PENDIENTE_COMPROBANTE') {
        throw new RespuestaValidacionComprobanteException('Este pedido ya no espera comprobante.')
      }
      const actualizado: PedidoVentaDTO = {
        ...actual,
        estadoVenta: 'PAGO_EN_REVISION',
        fechaLimitePago: null,
        metodoPago: actual.metodoPago
          ? { ...actual.metodoPago, comprobanteRuta: `comprobantes/${folioPedido}/${archivo.name}`, comprobanteNombre: archivo.name, fechaHoraComprobante: new Date().toISOString() }
          : null,
      }
      registrados.splice(registrados.indexOf(actual), 1, actualizado)
      return actualizado
    },
  }

  /** Los pedidos de muestra se arman una vez, con los productos del carrito inicial. */
  function asegurarMuestras() {
    if (!muestrasCreadas) registrados.push(...pedidosDeMuestra(muestraBase))
    muestrasCreadas = true
  }

  function buscarRegistrado(folioPedido: string): PedidoVentaDTO {
    asegurarMuestras()
    const encontrado = registrados.find((p) => p.folio === folioPedido)
    if (!encontrado) throw new Error(`No se encontró el pedido ${folioPedido}.`)
    return encontrado
  }
}

/** Pedidos registrados de muestra (datos del Figma S6): uno por estado que ve el cliente. */
function pedidosDeMuestra(base: PedidoVentaDTO): PedidoVentaDTO[] {
  const ahora = Date.now()
  const registrado = (numero: number, estadoVenta: string, horasAtras: number, limiteEnHoras: number | null): PedidoVentaDTO => {
    const folioPedido = `FLY-${String(numero).padStart(6, '0')}`
    return {
      ...base,
      id: numero,
      folio: folioPedido,
      estadoVenta,
      nivelesPrecio: [],
      siguienteTipoPrecio: null,
      piezasParaSiguienteNivel: null,
      datosEntrega: ENTREGA,
      metodoPago: { tipoPago: 'TRANSFERENCIA', folio: folioPedido },
      fechaHoraPedido: new Date(ahora - horasAtras * HORA_MS).toISOString(),
      fechaLimitePago: limiteEnHoras === null ? null : new Date(ahora + limiteEnHoras * HORA_MS).toISOString(),
      enlaceWhatsapp: `https://wa.me/?text=${encodeURIComponent(`Hola, te escribo por mi pedido ${folioPedido}`)}`,
    }
  }
  return [
    registrado(131, 'PENDIENTE_COMPROBANTE', 4, 38),
    registrado(128, 'PAGO_EN_REVISION', 6, null),
    registrado(119, 'ENVIADO', 24 * 6, null),
    registrado(102, 'ENTREGADO', 24 * 21, null),
    registrado(97, 'CANCELADO_VENCIMIENTO', 24 * 25, -24 * 23),
  ]
}
