/**
 * Modelo del CU04 Administrar Pedidos
 * Patrón Observable (los hooks se suscriben con useSyncExternalStore)
 *
 * Responsabilidades:
 * - Mantener la lista de pedidos, los criterios de búsqueda y el detalle abierto
 * - Ejecutar las acciones del administrador a través del puerto IPedidosAdminService
 * - Aplicar las reglas de UX (cambio en efectivo, siguiente estado según la forma de pago)
 * - Convertir ErrorApi en ErrorTs para las vistas y, ante un 409, recargar el pedido
 *   (otra persona ya lo cambió) para que las acciones correspondan a su estado real
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import type { IPedidosAdminService } from '../dominio/puertos/IPedidosAdminService'
import {
  ESTADO_INICIAL_PEDIDOS_ADMIN,
  type EstadoPedidosAdminTs,
} from '../dominio/EstadoPedidosAdminTs'
import { CRITERIOS_VACIOS, TAMANO_PAGINA, type CriteriosBusquedaTs } from '../dominio/CriteriosBusquedaTs'
import type { EstadoPedidoTs } from '../dominio/EstadoPedidoTs'
import type { MetodoPagoTs } from '../dominio/MetodoPagoTs'
import type { DatosEnvioTs } from '../dominio/DatosEnvioTs'
import type { CambioTs } from '../dominio/CambioTs'
import type { ResultadoValidacionTs } from '../dominio/ResultadoValidacionTs'
import type { ResultadoAccionTs } from '../dominio/ResultadoAccionTs'
import type { DetallePedidoAdminTs } from '../dominio/DetallePedidoAdminTs'
import type { PedidoResumenTs } from '../dominio/PedidoResumenTs'
import * as reglas from '../dominio/ReglasPedido'

export class PedidosAdminModel extends ModeloObservable<EstadoPedidosAdminTs> {
  private readonly service: IPedidosAdminService

  constructor(service: IPedidosAdminService) {
    super(ESTADO_INICIAL_PEDIDOS_ADMIN)
    this.service = service
  }

  // ---------- consulta ----------

  public async cargarPedidos(): Promise<void> {
    await this.listar(CRITERIOS_VACIOS)
  }

  public async buscarPedidos(criterios: CriteriosBusquedaTs): Promise<void> {
    await this.listar({ ...criterios, pagina: 1 })
  }

  public async limpiarFiltros(): Promise<void> {
    await this.listar(CRITERIOS_VACIOS)
  }

  /** Otra página con los mismos filtros (el backend devuelve TAMANO_PAGINA pedidos por página) */
  public async irAPagina(pagina: number): Promise<void> {
    const ultima = totalPaginas(this.obtenerEstado().totalEncontrado)
    await this.listar({ ...this.obtenerEstado().criterios, pagina: Math.min(Math.max(1, pagina), ultima) })
  }

  public async cargarDetalle(folio: string): Promise<void> {
    this.actualizar({ cargando: true, error: null, mensaje: null })
    try {
      const detalle = await this.service.obtenerDetalle(folio)
      this.actualizar({ detalle, cargando: false })
    } catch (error) {
      this.registrarError(error)
    }
  }

  // ---------- reglas de UX (la autoridad es el backend) ----------

  public calcularCambio(total: number, montoRecibido: number): CambioTs {
    return reglas.calcularCambio(total, montoRecibido)
  }

  public siguienteEstadoPermitido(actual: EstadoPedidoTs, metodoPago: MetodoPagoTs): EstadoPedidoTs | null {
    return reglas.siguienteEstadoPermitido(actual, metodoPago)
  }

  public validarTransicion(
    actual: EstadoPedidoTs,
    metodoPago: MetodoPagoTs,
    nuevo: EstadoPedidoTs,
    envio: DatosEnvioTs | null
  ): ResultadoValidacionTs {
    return reglas.validarTransicion(actual, metodoPago, nuevo, envio)
  }

  // ---------- acciones ----------

  public registrarPagoEfectivo(folio: string, montoRecibido: number): Promise<boolean> {
    return this.ejecutarAccion(
      folio,
      () => this.service.registrarPagoEfectivo(folio, montoRecibido),
      'Pago en efectivo registrado. El pedido quedó como pagado.'
    )
  }

  public aprobarPago(folio: string): Promise<boolean> {
    return this.ejecutarAccion(
      folio,
      () => this.service.aprobarPago(folio),
      'Pago aprobado. El pedido pasó a «En preparación».'
    )
  }

  public rechazarComprobante(folio: string, motivo: string, mensaje: string | null): Promise<boolean> {
    return this.ejecutarAccion(
      folio,
      () => this.service.rechazarComprobante(folio, motivo, mensaje),
      'Comprobante rechazado. El cliente tiene 42 horas para subir uno nuevo.'
    )
  }

  /**
   * Antes de llamar al backend valida la transición contra el detalle abierto:
   * si el estado está fuera de secuencia o faltan datos de envío regresa false
   * sin enviar nada (el detalle de los errores se consulta con validarTransicion).
   */
  public actualizarEstado(folio: string, estado: EstadoPedidoTs, envio: DatosEnvioTs | null): Promise<boolean> {
    const detalle = this.obtenerEstado().detalle
    if (detalle?.folio === folio && !this.validarTransicion(detalle.estado, detalle.metodoPago, estado, envio).valido) {
      return Promise.resolve(false)
    }
    return this.ejecutarAccion(
      folio,
      () => this.service.actualizarEstado(folio, estado, envio),
      'Estado actualizado.'
    )
  }

  public limpiarAvisos(): void {
    this.actualizar({ error: null, mensaje: null, notificacionPendiente: false })
  }

  // ---------- privados ----------

  private async listar(criterios: CriteriosBusquedaTs): Promise<void> {
    this.actualizar({ cargando: true, error: null, criterios })
    try {
      const pagina = await this.service.listar(criterios)
      this.actualizar({
        pedidos: pagina.pedidos,
        totalEncontrado: pagina.totalEncontrado,
        cargando: false,
      })
    } catch (error) {
      this.registrarError(error)
    }
  }

  /**
   * Ejecuta una acción que modifica el pedido.
   * Devuelve true si el backend la aplicó; false si hubo error (queda en estado.error).
   * Con 409 (otra persona ya cambió el pedido) vuelve a pedir el detalle para mostrar su estado real.
   */
  private async ejecutarAccion(
    folio: string,
    accion: () => Promise<ResultadoAccionTs>,
    mensajeExito: string
  ): Promise<boolean> {
    this.actualizar({ cargando: true, error: null, mensaje: null, notificacionPendiente: false })
    try {
      const resultado = await accion()
      this.aplicarResultado(resultado, mensajeExito)
      return true
    } catch (error) {
      if (error instanceof ErrorApi && error.statusHTTP === 409) {
        await this.recargarTrasConflicto(folio, error)
      } else {
        this.registrarError(error)
      }
      return false
    }
  }

  /** Muestra el motivo del 409 y, si se puede, el pedido como está ahora en el backend (detalle y lista) */
  private async recargarTrasConflicto(folio: string, error: ErrorApi): Promise<void> {
    try {
      const detalle = await this.service.obtenerDetalle(folio)
      this.actualizar({ detalle, pedidos: this.reflejarEnLista(detalle), cargando: false, error: aErrorTs(error) })
    } catch {
      this.registrarError(error)
    }
  }

  /** Refleja el pedido devuelto por el backend en el detalle y en la lista */
  private aplicarResultado(resultado: ResultadoAccionTs, mensajeExito: string): void {
    const actualizado = resultado.pedido
    this.actualizar({
      detalle: actualizado,
      pedidos: this.reflejarEnLista(actualizado),
      cargando: false,
      mensaje: mensajeExito,
      notificacionPendiente: !resultado.notificacionEnviada,
    })
  }

  /** La lista con el renglón de ese pedido al día (estado y vencimiento) */
  private reflejarEnLista(actualizado: DetallePedidoAdminTs): readonly PedidoResumenTs[] {
    return this.obtenerEstado().pedidos.map((p) =>
      p.folio === actualizado.folio ? { ...p, estado: actualizado.estado, fechaLimite: actualizado.fechaLimite } : p
    )
  }

  private registrarError(error: unknown): void {
    this.actualizar({ cargando: false, error: aErrorTs(error) })
  }
}

/** Páginas que ocupa un total de pedidos (al menos 1) */
export function totalPaginas(totalEncontrado: number): number {
  return Math.max(1, Math.ceil(totalEncontrado / TAMANO_PAGINA))
}

function aErrorTs(error: unknown): ErrorTs {
  if (error instanceof ErrorApi) {
    const tipo = error.tipo.toLowerCase()
    return {
      mensaje: error.message,
      tipo: tipo === 'validacion' || tipo === 'negocio' || tipo === 'red' ? tipo : 'desconocido',
    }
  }
  return { mensaje: 'Ocurrió un error inesperado. Intenta de nuevo.', tipo: 'desconocido' }
}
