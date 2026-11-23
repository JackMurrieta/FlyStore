/**
 * Reglas del pedido que el front aplica para la experiencia de uso
 * (siguiente estado, validación de pago, plazo y cambio en efectivo).
 * La autoridad final es el backend (PedidoVentaBO). El personal no cancela pedidos:
 * solo el cliente cancela el suyo, desde «Mis pedidos».
 */

import { ETIQUETA_ESTADO, type EstadoPedidoTs } from './EstadoPedidoTs'
import type { MetodoPagoTs } from './MetodoPagoTs'
import type { DatosEnvioTs } from './DatosEnvioTs'
import type { LineaPedidoTs } from './LineaPedidoTs'
import type { ResultadoValidacionTs } from './ResultadoValidacionTs'
import type { CambioTs } from './CambioTs'

/**
 * Efectivo cobrado en la tienda: Pagado → Entregado.
 * Enviado → Entregado queda para los pedidos en efectivo que se enviaron con la regla anterior.
 */
const SIGUIENTE_EFECTIVO: Partial<Record<EstadoPedidoTs, EstadoPedidoTs>> = {
  PAGADO: 'ENTREGADO',
  ENVIADO: 'ENTREGADO',
}

/**
 * Transferencia: al aprobar el pago entra a En preparación → Enviado → Entregado.
 * Pagado → En preparación queda para las transferencias aprobadas con la regla anterior.
 */
const SIGUIENTE_TRANSFERENCIA: Partial<Record<EstadoPedidoTs, EstadoPedidoTs>> = {
  PAGADO: 'PREPARACION',
  PREPARACION: 'ENVIADO',
  ENVIADO: 'ENTREGADO',
}

const CANCELADOS: readonly EstadoPedidoTs[] = ['CANCELADO', 'CANCELADO_VENCIMIENTO']

/** Motivos que se ofrecen al administrador al rechazar un comprobante */
export const MOTIVOS_RECHAZO: readonly string[] = [
  'El monto no coincide',
  'El comprobante es ilegible',
  'El depósito no se refleja en la cuenta',
  'Otro motivo',
]

export function siguienteEstadoPermitido(actual: EstadoPedidoTs, metodoPago: MetodoPagoTs): EstadoPedidoTs | null {
  const recorrido = metodoPago === 'TRANSFERENCIA' ? SIGUIENTE_TRANSFERENCIA : SIGUIENTE_EFECTIVO
  return recorrido[actual] ?? null
}

/**
 * Pasos que muestra «Actualizar estado» según la forma de pago. Incluye el estado actual
 * cuando el pedido viene de la regla anterior (transferencia en Pagado, efectivo en Enviado).
 */
export function secuenciaEstados(metodoPago: MetodoPagoTs, actual: EstadoPedidoTs): readonly EstadoPedidoTs[] {
  if (metodoPago === 'EFECTIVO') {
    return actual === 'ENVIADO' ? ['PAGADO', 'ENVIADO', 'ENTREGADO'] : ['PAGADO', 'ENTREGADO']
  }
  return actual === 'PAGADO'
    ? ['PAGADO', 'PREPARACION', 'ENVIADO', 'ENTREGADO']
    : ['PREPARACION', 'ENVIADO', 'ENTREGADO']
}

export function requiereDatosEnvio(estado: EstadoPedidoTs): boolean {
  return estado === 'ENVIADO'
}

export function envioCompleto(envio: DatosEnvioTs | null): boolean {
  if (!envio) return false
  if (envio.entregaLocal) return true
  return envio.paqueteria.trim() !== '' && envio.guia.trim() !== ''
}

export function validarTransicion(
  actual: EstadoPedidoTs,
  metodoPago: MetodoPagoTs,
  nuevo: EstadoPedidoTs,
  envio: DatosEnvioTs | null
): ResultadoValidacionTs {
  const errores: string[] = []
  const siguiente = siguienteEstadoPermitido(actual, metodoPago)

  if (siguiente !== nuevo) {
    errores.push(
      siguiente
        ? `Desde «${ETIQUETA_ESTADO[actual]}» solo se puede pasar a «${ETIQUETA_ESTADO[siguiente]}».`
        : `Un pedido en «${ETIQUETA_ESTADO[actual]}» no admite cambio de estado.`
    )
  }

  if (requiereDatosEnvio(nuevo) && !envioCompleto(envio)) {
    errores.push('Para marcar como enviado indica paquetería y guía, o marca entrega local.')
  }

  return { valido: errores.length === 0, errores, siguientePermitido: siguiente }
}

/** El pedido ya terminó en cancelación (manual o por vencimiento) */
export function estaCancelado(estado: EstadoPedidoTs): boolean {
  return CANCELADOS.includes(estado)
}

/** Solo se aprueba o rechaza el comprobante de un pedido en revisión */
export function puedeValidarPago(estado: EstadoPedidoTs): boolean {
  return estado === 'PAGO_EN_REVISION'
}

/** El motivo del rechazo no puede ir en blanco */
export function validarMotivo(motivo: string): boolean {
  return motivo.trim() !== ''
}

/** Total de piezas del pedido (las que se descuentan del inventario al aprobar el pago) */
export function contarPiezas(lineas: readonly LineaPedidoTs[]): number {
  return lineas.reduce((total, linea) => total + linea.cantidad, 0)
}

export function estaVencido(fechaLimite: Date | null, ahora: Date = new Date()): boolean {
  return fechaLimite !== null && fechaLimite.getTime() < ahora.getTime()
}

/** Redondea a centavos para evitar errores de punto flotante */
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

export function calcularCambio(total: number, montoRecibido: number): CambioTs {
  const diferencia = redondear(montoRecibido - total)
  if (diferencia >= 0) {
    return { cambio: diferencia, faltante: 0, suficiente: true }
  }
  return { cambio: 0, faltante: -diferencia, suficiente: false }
}
