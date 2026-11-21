/**
 * PedidoEnCursoModel · Experto en información del pedido en curso (GRASP).
 *
 * Única fuente de verdad del carrito: guarda el último PedidoVentaDTO que respondió el backend
 * y de ahí mapea todo lo que pintan las vistas. Patrón Observador: los hooks se suscriben con
 * useSyncExternalStore; cada cambio crea un estado nuevo y los notifica.
 *
 * Diagramas que implementa: básico (mensajes 3, 21, 41, 49, 53, 60, 64), Alt1 (cambiar cantidad),
 * Alt2 (código de descuento), Alt3 (efectivo), Alt4 (comprobante después) y Alt5 (comprobante rechazado).
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import type { CarritoTs } from '../dominio/CarritoTs'
import type { InformacionPedidoTs } from '../dominio/InformacionPedidoTs'
import type { MetodoPagoTs } from '../dominio/MetodoPagoTs'
import type { DatosEntregaTs } from '../dominio/DatosEntregaTs'
import { validarArchivoComprobante } from '../dominio/ReglasVenta'
import { RespuestaValidacionComprobanteException } from '../dominio/RespuestaValidacionComprobanteException'
import type { PedidoVentaDTO } from './dto/PedidoVentaDTO'
import type { MetodoPagoDTO } from './dto/MetodoPagoDTO'
import type { RespuestaValidacionComprobanteDTO } from './dto/RespuestaValidacionComprobanteDTO'
import { PedidoVentaMapper } from './mappers/PedidoVentaMapper'

export interface EstadoPedidoEnCurso {
  /** Cargando el carrito por primera vez. */
  readonly cargando: boolean
  /** Cambiando cantidad o aplicando un código. */
  readonly actualizando: boolean
  readonly carrito: CarritoTs | null
  readonly informacionPedido: InformacionPedidoTs | null
  readonly errorCodigo: string | null
  readonly metodoPago: MetodoPagoTs | null
  readonly validandoComprobante: boolean
  readonly respuestaValidacion: RespuestaValidacionComprobanteDTO | null
  /** Rechazo del comprobante (A6/Alt5, tipo «validacion») o falla al subirlo (A7, tipo «red»). */
  readonly errorComprobante: ErrorTs | null
  readonly registrando: boolean
  /** Pedido registrado que pinta B7 y su ticket. Llega al registrar o al pedirlo por folio (recarga de B7). */
  readonly pedidoRegistrado: InformacionPedidoTs | null
  readonly generandoComprobantePedido: boolean
  readonly errorComprobantePedido: string | null
  readonly error: ErrorTs | null
}

/** Lo único que este modelo necesita de los datos de entrega (bajo acoplamiento). */
export interface FuenteDatosEntrega {
  obtenerDatosEntregaTs(): DatosEntregaTs | null
}

const ESTADO_INICIAL: EstadoPedidoEnCurso = {
  cargando: false,
  actualizando: false,
  carrito: null,
  informacionPedido: null,
  errorCodigo: null,
  metodoPago: null,
  validandoComprobante: false,
  respuestaValidacion: null,
  errorComprobante: null,
  registrando: false,
  pedidoRegistrado: null,
  generandoComprobantePedido: false,
  errorComprobantePedido: null,
  error: null,
}

/** Al cambiar el carrito se descarta el método de pago elegido: el monto ya no es el mismo. */
const SIN_METODO_PAGO = {
  metodoPago: null,
  respuestaValidacion: null,
  errorComprobante: null,
} as const

export class PedidoEnCursoModel extends ModeloObservable<EstadoPedidoEnCurso> {
  private readonly gateway: IGestionarVentaGateway
  private readonly fuenteDatosEntrega: FuenteDatosEntrega
  private readonly reloj: () => Date
  private pedidoVentaDTO: PedidoVentaDTO | null = null

  constructor(
    gateway: IGestionarVentaGateway,
    fuenteDatosEntrega: FuenteDatosEntrega,
    reloj: () => Date = () => new Date()
  ) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
    this.fuenteDatosEntrega = fuenteDatosEntrega
    this.reloj = reloj
  }

  // ───────────────────────── Carrito (B1, Alt1, Alt2) ─────────────────────────

  /** Básico, mensaje 3. Devuelve null si el backend falla (el error queda en el estado). */
  public obtenerPedidoVentaEnCurso = async (clienteId: string): Promise<CarritoTs | null> => {
    this.actualizar({ cargando: true, error: null, errorCodigo: null })
    try {
      const dto = await this.gateway.obtenerPedidoVentaEnCurso(clienteId)
      return this.aplicarPedido(dto, { cargando: false })
    } catch (error) {
      this.actualizar({
        cargando: false,
        error: PedidoVentaMapper.convertirErrorAErrorTs(error, 'No pudimos cargar tu carrito. Inténtalo de nuevo.'),
      })
      return null
    }
  }

  /** Alt1, mensaje 3. Cantidad 0 quita la línea (S1). */
  public actualizarCantidad = async (varianteProductoId: number, cantidad: number): Promise<CarritoTs | null> => {
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      this.actualizar({ error: { mensaje: 'La cantidad debe ser un número entero de piezas.', tipo: 'validacion' } })
      return null
    }
    this.actualizar({ actualizando: true, error: null })
    try {
      const dto = await this.gateway.actualizarCantidad({ varianteProductoId, cantidad })
      return this.aplicarPedido(dto, { actualizando: false })
    } catch (error) {
      this.actualizar({
        actualizando: false,
        error: PedidoVentaMapper.convertirErrorAErrorTs(error, 'No pudimos actualizar la cantidad. Inténtalo de nuevo.'),
      })
      return null
    }
  }

  /** Alt2, mensaje 3. Si el código no es válido (A11) el carrito no cambia y se marca el campo. */
  public aplicarCodigoDescuento = async (codigo: string): Promise<CarritoTs | null> => {
    const limpio = codigo.trim().toUpperCase()
    if (limpio === '') {
      this.actualizar({ errorCodigo: 'Escribe un código de descuento.' })
      return null
    }
    this.actualizar({ actualizando: true, errorCodigo: null, error: null })
    try {
      const dto = await this.gateway.aplicarCodigoDescuento({ codigo: limpio })
      return this.aplicarPedido(dto, { actualizando: false })
    } catch (error) {
      this.actualizar({
        actualizando: false,
        errorCodigo: PedidoVentaMapper.convertirErrorAErrorTs(
          error,
          `${limpio} no existe, ya venció o no aplica a ningún producto de tu carrito.`
        ).mensaje,
      })
      return null
    }
  }

  public limpiarErrorCodigo = (): void => {
    if (this.obtenerEstado().errorCodigo) this.actualizar({ errorCodigo: null })
  }

  // ───────────────────────── Resumen del pedido ─────────────────────────

  /** Básico, mensajes 21, 35 y 49. Notifica a los hooks suscritos y devuelve el resumen. */
  public obtenerInformacionPedidoTs = (): InformacionPedidoTs | null => {
    if (!this.pedidoVentaDTO) return null
    const informacionPedido = PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs(this.pedidoVentaDTO)
    this.actualizar({ informacionPedido })
    return informacionPedido
  }

  // ───────────────────────── Método de pago (B3, B4, B5, S3) ─────────────────────────

  /** Validación de formato y tamaño antes de subir (A6). El backend vuelve a validar. */
  public validarArchivoComprobante = (archivo: File): string | null => validarArchivoComprobante(archivo)

  /**
   * Básico, mensaje 41 · Alt3 y Alt4, mensaje 3.
   * - Con archivo: valida en el front, lo envía al backend (mensaje 42) y, si es válido,
   *   guarda la ruta en el pedido. Si se rechaza (Alt5) deja el mensaje para la vista.
   * - Sin archivo (efectivo o transferir después): no llama al backend.
   */
  public agregarMetodoPagoDTOaPedidoVentaDTO = async (dto: MetodoPagoDTO): Promise<MetodoPagoTs | null> => {
    if (!this.pedidoVentaDTO) {
      this.actualizar({ error: { mensaje: 'Tu carrito ya no está disponible. Vuelve a cargarlo.', tipo: 'negocio' } })
      return null
    }
    const archivo = dto.comprobantePagoArchivo ?? null
    if (!archivo) {
      return this.guardarMetodoPago({ tipoPago: dto.tipoPago, folio: dto.folio }, null)
    }

    const errorLocal = validarArchivoComprobante(archivo)
    if (errorLocal) {
      this.actualizar({ ...SIN_METODO_PAGO, errorComprobante: { mensaje: errorLocal, tipo: 'validacion' } })
      return null
    }

    this.actualizar({ ...SIN_METODO_PAGO, validandoComprobante: true })
    try {
      const respuesta = await this.gateway.validarMetodoPagoDTO(dto)
      if (!respuesta.valido) {
        this.actualizar({ validandoComprobante: false, errorComprobante: { mensaje: respuesta.mensaje, tipo: 'validacion' } })
        return null
      }
      return this.guardarMetodoPago(
        { tipoPago: dto.tipoPago, folio: dto.folio, comprobanteRuta: respuesta.comprobanteRuta, comprobanteNombre: archivo.name },
        respuesta
      )
    } catch (error) {
      // Alt5 (RespuestaValidacionComprobanteException) y A7 (error de conexión): el archivo sigue elegido.
      const errorTs = PedidoVentaMapper.convertirErrorAErrorTs(
        error,
        'Hubo un problema al subir tu comprobante; inténtalo de nuevo.'
      )
      this.actualizar({
        validandoComprobante: false,
        errorComprobante: error instanceof RespuestaValidacionComprobanteException
          ? { mensaje: errorTs.mensaje, tipo: 'validacion' }
          : errorTs,
      })
      return null
    }
  }

  /** Básico, mensaje 53. */
  public obtenerMetodoPagoTs = (): MetodoPagoTs | null => this.obtenerEstado().metodoPago

  /** El cliente cambia de opción: se descarta lo elegido antes. */
  public descartarMetodoPago = (): void => {
    if (this.pedidoVentaDTO) this.pedidoVentaDTO = { ...this.pedidoVentaDTO, metodoPago: null }
    this.actualizar({ ...SIN_METODO_PAGO, validandoComprobante: false })
  }

  // ───────────────────────── Confirmar y registrar (B6, B7) ─────────────────────────

  /**
   * Básico, mensaje 60 · Alt3 y Alt4, mensaje 19. Arma el PedidoVentaDTO con los datos de entrega
   * y el método de pago, y lo registra. Si falla (A9) se conserva todo para reintentar.
   */
  public registrarPedidoVenta = async (): Promise<void> => {
    const pedido = this.pedidoVentaDTO
    const datosEntrega = this.fuenteDatosEntrega.obtenerDatosEntregaTs()
    if (!pedido || !pedido.metodoPago || !datosEntrega) {
      this.actualizar({
        error: { mensaje: 'Faltan datos de entrega o de pago. Revisa los pasos anteriores.', tipo: 'validacion' },
      })
      return
    }
    this.actualizar({ registrando: true, error: null, pedidoRegistrado: null })
    try {
      const registrado = await this.gateway.registrarPedidoVenta({
        ...pedido,
        datosEntrega: PedidoVentaMapper.convertirDatosEntregaTsaDatosEntregaDTO(datosEntrega),
      })
      this.pedidoVentaDTO = null
      this.actualizar({
        ...SIN_METODO_PAGO,
        registrando: false,
        carrito: null,
        informacionPedido: null,
        pedidoRegistrado: PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs(registrado),
        errorComprobantePedido: null,
      })
    } catch (error) {
      this.actualizar({
        registrando: false,
        error: PedidoVentaMapper.convertirErrorAErrorTs(
          error,
          'No pudimos registrar tu pedido. Tu carrito, tus datos de entrega y tu comprobante se conservaron.'
        ),
      })
    }
  }

  /**
   * Básico, mensaje 64. Pide al backend el pedido registrado con ese folio; con esos datos
   * TicketPedido arma el ticket y el cliente lo imprime o lo guarda como PDF (window.print).
   * También sirve cuando B7 se abre por URL o se recarga: no depende de lo que haya en memoria.
   */
  public generarComprobantePedidoVenta = async (folio: string): Promise<InformacionPedidoTs | null> => {
    this.actualizar({ generandoComprobantePedido: true, errorComprobantePedido: null })
    try {
      const dto = await this.gateway.generarComprobantePedidoVenta(folio)
      const pedidoRegistrado = PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs(dto)
      this.actualizar({ generandoComprobantePedido: false, pedidoRegistrado })
      return pedidoRegistrado
    } catch (error) {
      this.actualizar({
        generandoComprobantePedido: false,
        errorComprobantePedido: PedidoVentaMapper.convertirErrorAErrorTs(
          error,
          'No pudimos cargar tu pedido. Inténtalo de nuevo.'
        ).mensaje,
      })
      return null
    }
  }

  /** Al cerrar sesión: no deja datos del cliente anterior en memoria. */
  public reiniciar = (): void => {
    this.pedidoVentaDTO = null
    this.establecer(ESTADO_INICIAL)
  }

  // ───────────────────────── Privados ─────────────────────────

  private aplicarPedido(dto: PedidoVentaDTO, cambios: Partial<EstadoPedidoEnCurso>): CarritoTs {
    this.pedidoVentaDTO = { ...dto, metodoPago: null }
    const carrito = PedidoVentaMapper.convertirPedidoVentaDTOaCarritoTs(dto)
    this.actualizar({
      ...cambios,
      ...SIN_METODO_PAGO,
      carrito,
      informacionPedido: PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs(this.pedidoVentaDTO),
    })
    return carrito
  }

  private guardarMetodoPago(dto: MetodoPagoDTO, respuesta: RespuestaValidacionComprobanteDTO | null): MetodoPagoTs | null {
    if (!this.pedidoVentaDTO) return null
    // El archivo ya se subió (o no hay): el pedido solo guarda la ruta, nunca el File.
    this.pedidoVentaDTO = { ...this.pedidoVentaDTO, folio: dto.folio, metodoPago: dto }
    const metodoPago = PedidoVentaMapper.convertirMetodoPagoDTOaMetodoPagoTs(dto, this.reloj())
    this.actualizar({
      validandoComprobante: false,
      errorComprobante: null,
      respuestaValidacion: respuesta,
      metodoPago,
      informacionPedido: PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs(this.pedidoVentaDTO),
    })
    return metodoPago
  }
}
