/**
 * Modelo del CU04 Administrar Pedidos
 * Patrón Observable (los hooks se suscriben con useSyncExternalStore)
 *
 * Responsabilidades:
 * - Mantener la lista de pedidos, los criterios de búsqueda y el detalle abierto
 * - Ejecutar las acciones del administrador a través del puerto IPedidosAdminService
 * - Aplicar las reglas de UX (cambio en efectivo, siguiente estado, cancelable)
 * - Convertir ErrorApi en ErrorTs para las vistas
 */

import { ModeloObservable } from '@compartido/modelo/ModeloObservable'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import type { IPedidosAdminService } from '../dominio/puertos/IPedidosAdminService'
import {
  ESTADO_INICIAL_PEDIDOS_ADMIN,
  type EstadoPedidosAdminTs,
} from '../dominio/EstadoPedidosAdminTs'
import { CRITERIOS_VACIOS, type CriteriosBusquedaTs } from '../dominio/CriteriosBusquedaTs'
import type { EstadoPedidoTs } from '../dominio/EstadoPedidoTs'
import type { DatosEnvioTs } from '../dominio/DatosEnvioTs'
import type { CambioTs } from '../dominio/CambioTs'
import type { ResultadoValidacionTs } from '../dominio/ResultadoValidacionTs'
import type { ResultadoAccionTs } from '../dominio/ResultadoAccionTs'
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

  public siguienteEstadoPermitido(actual: EstadoPedidoTs): EstadoPedidoTs | null {
    return reglas.siguienteEstadoPermitido(actual)
  }

  public validarTransicion(
    actual: EstadoPedidoTs,
    nuevo: EstadoPedidoTs,
    envio: DatosEnvioTs | null
  ): ResultadoValidacionTs {
    return reglas.validarTransicion(actual, nuevo, envio)
  }

  public puedeCancelar(estado: EstadoPedidoTs): boolean {
    return reglas.puedeCancelar(estado)
  }

  // ---------- acciones ----------

  public registrarPagoEfectivo(folio: string, montoRecibido: number): Promise<boolean> {
    return this.ejecutarAccion(
      () => this.service.registrarPagoEfectivo(folio, montoRecibido),
      'Pago en efectivo registrado. El pedido quedó como pagado.'
    )
  }

  public aprobarPago(folio: string): Promise<boolean> {
    return this.ejecutarAccion(
      () => this.service.aprobarPago(folio),
      'Pago aprobado. El pedido quedó como pagado.'
    )
  }

  public rechazarComprobante(folio: string, motivo: string, mensaje: string | null): Promise<boolean> {
    return this.ejecutarAccion(
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
    if (detalle?.folio === folio && !this.validarTransicion(detalle.estado, estado, envio).valido) {
      return Promise.resolve(false)
    }
    return this.ejecutarAccion(
      () => this.service.actualizarEstado(folio, estado, envio),
      'Estado actualizado.'
    )
  }

  public cancelarPedido(folio: string, motivo: string): Promise<boolean> {
    return this.ejecutarAccion(
      () => this.service.cancelarPedido(folio, motivo),
      'Pedido cancelado. Las piezas regresaron al inventario.'
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
   */
  private async ejecutarAccion(
    accion: () => Promise<ResultadoAccionTs>,
    mensajeExito: string
  ): Promise<boolean> {
    this.actualizar({ cargando: true, error: null, mensaje: null, notificacionPendiente: false })
    try {
      const resultado = await accion()
      this.aplicarResultado(resultado, mensajeExito)
      return true
    } catch (error) {
      this.registrarError(error)
      return false
    }
  }

  /** Refleja el pedido devuelto por el backend en el detalle y en la lista */
  private aplicarResultado(resultado: ResultadoAccionTs, mensajeExito: string): void {
    const actualizado = resultado.pedido
    const pedidos = this.obtenerEstado().pedidos.map((p) =>
      p.folio === actualizado.folio
        ? { ...p, estado: actualizado.estado, fechaLimite: actualizado.fechaLimite }
        : p
    )
    this.actualizar({
      detalle: actualizado,
      pedidos,
      cargando: false,
      mensaje: mensajeExito,
      notificacionPendiente: !resultado.notificacionEnviada,
    })
  }

  private registrarError(error: unknown): void {
    this.actualizar({ cargando: false, error: aErrorTs(error) })
  }
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
