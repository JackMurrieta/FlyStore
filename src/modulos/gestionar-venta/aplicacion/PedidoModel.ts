/**
 * PedidoModel · Experto en información de los pedidos ya registrados del cliente (GRASP).
 * Pantalla S6 «Mis pedidos»: lista los pedidos, muestra el detalle del elegido y, si espera
 * comprobante, los datos para transferir y la carga del comprobante (PENDIENTE_COMPROBANTE →
 * PAGO_EN_REVISION). El carrito sigue en PedidoEnCursoModel: este modelo nunca lo toca.
 *
 * Patrón Observador: los hooks se suscriben con useSyncExternalStore.
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import type { InformacionPedidoTs } from '../dominio/InformacionPedidoTs'
import type { DatosBancariosTs } from '../dominio/DatosBancariosTs'
import type { EstadoPedidoTs } from '../dominio/EstadoVenta'
import { EstadoVenta } from '../dominio/EstadoVenta'
import { plazoPagoVencido, validarArchivoComprobante } from '../dominio/ReglasVenta'
import { RespuestaValidacionComprobanteException } from '../dominio/RespuestaValidacionComprobanteException'
import type { DatosBancariosDTO } from './dto/DatosBancariosDTO'
import { PedidoVentaMapper } from './mappers/PedidoVentaMapper'

export interface EstadoPedidos {
  /** Cargando la lista por primera vez (o al reintentar). */
  readonly cargando: boolean
  /** null mientras no se ha cargado; [] si el cliente aún no tiene pedidos registrados. */
  readonly pedidos: readonly InformacionPedidoTs[] | null
  readonly error: ErrorTs | null
  readonly folioSeleccionado: string | null
  /** Datos para transferir con el folio del pedido elegido como concepto. */
  readonly datosBancarios: DatosBancariosTs | null
  readonly cargandoDatosBancarios: boolean
  readonly errorDatosBancarios: ErrorTs | null
  readonly subiendoComprobante: boolean
  /** Rechazo del archivo o del pedido (tipo «validacion») o falla de conexión (tipo «red»). */
  readonly errorComprobante: ErrorTs | null
  /** Folio cuyo comprobante se acaba de recibir (para el aviso de éxito). */
  readonly comprobanteRecibido: string | null
}

const ESTADO_INICIAL: EstadoPedidos = {
  cargando: false,
  pedidos: null,
  error: null,
  folioSeleccionado: null,
  datosBancarios: null,
  cargandoDatosBancarios: false,
  errorDatosBancarios: null,
  subiendoComprobante: false,
  errorComprobante: null,
  comprobanteRecibido: null,
}

export class PedidoModel extends ModeloObservable<EstadoPedidos> {
  private readonly gateway: IGestionarVentaGateway
  private readonly reloj: () => Date
  /** La cuenta es la misma para todos los pedidos: se pide una vez y solo cambia el concepto. */
  private cuentaBancaria: DatosBancariosDTO | null = null

  constructor(gateway: IGestionarVentaGateway, reloj: () => Date = () => new Date()) {
    super(ESTADO_INICIAL)
    this.gateway = gateway
    this.reloj = reloj
  }

  /**
   * Carga los pedidos registrados del cliente (del más reciente al más antiguo) y elige uno:
   * el folio pedido (enlace desde B7), el que ya estaba elegido o el primero.
   */
  public listarPedidosVenta = async (folioPreferido?: string | null): Promise<readonly InformacionPedidoTs[] | null> => {
    this.actualizar({ cargando: true, error: null })
    try {
      const dtos = await this.gateway.listarPedidosVenta()
      const pedidos = dtos.map(PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs)
      const existe = (folio: string | null | undefined) => Boolean(folio) && pedidos.some((p) => p.folio === folio)
      const anterior = this.obtenerEstado().folioSeleccionado
      const folio = existe(folioPreferido) ? folioPreferido ?? null : existe(anterior) ? anterior : pedidos[0]?.folio ?? null
      this.actualizar({ cargando: false, pedidos })
      this.seleccionarPedido(folio)
      return pedidos
    } catch (error) {
      this.actualizar({
        cargando: false,
        error: PedidoVentaMapper.convertirErrorAErrorTs(error, 'No pudimos cargar tus pedidos. Inténtalo de nuevo.'),
      })
      return null
    }
  }

  /** El cliente elige un pedido de la lista. Si espera comprobante, prepara los datos para transferir. */
  public seleccionarPedido = (folio: string | null): void => {
    const cambio = folio !== this.obtenerEstado().folioSeleccionado
    this.actualizar({
      folioSeleccionado: folio,
      ...(cambio ? { errorComprobante: null, comprobanteRecibido: null } : {}),
    })
    const pedido = this.obtenerPedidoSeleccionado()
    if (pedido && this.puedeSubirComprobante(pedido)) void this.obtenerDatosBancariosPedidoVenta(pedido.folio ?? '')
    else this.actualizar({ datosBancarios: null, errorDatosBancarios: null })
  }

  public obtenerPedidoSeleccionado = (): InformacionPedidoTs | null => {
    const { pedidos, folioSeleccionado } = this.obtenerEstado()
    return pedidos?.find((pedido) => pedido.folio === folioSeleccionado) ?? null
  }

  /** Solo un pedido «Pendiente de comprobante» con el plazo vigente admite subir el comprobante. */
  public puedeSubirComprobante = (pedido: InformacionPedidoTs): boolean =>
    pedido.estado?.valor === EstadoVenta.PENDIENTE_COMPROBANTE && !this.plazoVencido(pedido)

  public plazoVencido = (pedido: InformacionPedidoTs): boolean =>
    plazoPagoVencido(pedido.estado?.valor ?? '', pedido.fechaLimitePago, this.reloj())

  /**
   * Estado para pintar. Si el plazo ya pasó pero el proceso que cancela los pedidos vencidos
   * aún no corre, se muestra como «Cancelado por vencimiento» (el backend ya no acepta el pago).
   */
  public estadoMostrado = (pedido: InformacionPedidoTs): EstadoPedidoTs | null =>
    this.plazoVencido(pedido) ? PedidoVentaMapper.convertirEstado(EstadoVenta.CANCELADO_VENCIMIENTO) : pedido.estado

  /** Horas completas que le quedan para pagar o subir el comprobante; null si no tiene plazo. */
  public horasRestantesPago = (pedido: InformacionPedidoTs): number | null =>
    pedido.fechaLimitePago
      ? Math.max(0, Math.floor((pedido.fechaLimitePago.getTime() - this.reloj().getTime()) / 3_600_000))
      : null

  /** Datos para transferir con el folio del pedido como concepto (no genera folio nuevo). */
  public obtenerDatosBancariosPedidoVenta = async (folio: string): Promise<DatosBancariosTs | null> => {
    if (this.cuentaBancaria) {
      const datosBancarios = PedidoVentaMapper.convertirDatosBancariosDTOaDatosBancariosTs({ ...this.cuentaBancaria, folio })
      this.actualizar({ datosBancarios, errorDatosBancarios: null })
      return datosBancarios
    }
    this.actualizar({ cargandoDatosBancarios: true, datosBancarios: null, errorDatosBancarios: null })
    try {
      const dto = await this.gateway.obtenerDatosBancariosPedidoVenta(folio)
      this.cuentaBancaria = dto
      // Si mientras tanto eligió otro pedido, el concepto debe ser el folio de ese otro.
      const actual = this.obtenerEstado().folioSeleccionado ?? folio
      const datosBancarios = PedidoVentaMapper.convertirDatosBancariosDTOaDatosBancariosTs({ ...dto, folio: actual })
      this.actualizar({ cargandoDatosBancarios: false, datosBancarios })
      return datosBancarios
    } catch (error) {
      this.actualizar({
        cargandoDatosBancarios: false,
        errorDatosBancarios: PedidoVentaMapper.convertirErrorAErrorTs(
          error,
          'No pudimos cargar los datos para transferir. Inténtalo de nuevo.'
        ),
      })
      return null
    }
  }

  /** Validación de formato y tamaño antes de subir. El backend vuelve a validar. */
  public validarArchivoComprobante = (archivo: File): string | null => validarArchivoComprobante(archivo)

  /** El cliente cambia de archivo: se descarta el error anterior. */
  public limpiarErrorComprobante = (): void => {
    if (this.obtenerEstado().errorComprobante) this.actualizar({ errorComprobante: null })
  }

  /**
   * S6: sube el comprobante del pedido elegido. Si el backend lo recibe, el pedido pasa a
   * «Pago en revisión» y se reemplaza en la lista. Si lo rechaza (archivo ilegible, plazo
   * vencido o sin existencia) deja el mensaje del backend; si falla la red, el archivo sigue elegido.
   */
  public subirComprobantePedidoVenta = async (folio: string, archivo: File): Promise<InformacionPedidoTs | null> => {
    const errorLocal = validarArchivoComprobante(archivo)
    if (errorLocal) {
      this.actualizar({ errorComprobante: { mensaje: errorLocal, tipo: 'validacion' } })
      return null
    }
    this.actualizar({ subiendoComprobante: true, errorComprobante: null, comprobanteRecibido: null })
    try {
      const dto = await this.gateway.subirComprobantePedidoVenta(folio, archivo)
      const actualizado = PedidoVentaMapper.convertirPedidoVentaDTOaInformacionPedidoTs(dto)
      const pedidos = (this.obtenerEstado().pedidos ?? []).map((pedido) => (pedido.folio === folio ? actualizado : pedido))
      this.actualizar({ subiendoComprobante: false, pedidos, comprobanteRecibido: folio, datosBancarios: null })
      return actualizado
    } catch (error) {
      const errorTs = PedidoVentaMapper.convertirErrorAErrorTs(
        error,
        'Hubo un problema al subir tu comprobante; inténtalo de nuevo.'
      )
      this.actualizar({
        subiendoComprobante: false,
        errorComprobante: error instanceof RespuestaValidacionComprobanteException
          ? { mensaje: errorTs.mensaje, tipo: 'validacion' }
          : errorTs,
      })
      return null
    }
  }

  /** Al cerrar sesión: no deja pedidos del cliente anterior en memoria. */
  public reiniciar = (): void => {
    this.cuentaBancaria = null
    this.establecer(ESTADO_INICIAL)
  }
}
