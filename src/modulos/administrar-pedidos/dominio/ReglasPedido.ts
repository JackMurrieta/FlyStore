/**
 * Reglas del pedido que el front aplica para la experiencia de uso
 * (siguiente estado, validación de pago, cancelación, plazo y cambio en efectivo).
 * La autoridad final es el backend (PoliticaEstadosPedido / PoliticaPlazos).
 */

import { ETIQUETA_ESTADO, type EstadoPedidoTs } from './EstadoPedidoTs'
import type { DatosEnvioTs } from './DatosEnvioTs'
import type { LineaPedidoTs } from './LineaPedidoTs'
import type { ResultadoValidacionTs } from './ResultadoValidacionTs'
import type { CambioTs } from './CambioTs'

/** Secuencia de estados que el administrador avanza a mano */
const SIGUIENTE_ESTADO: Partial<Record<EstadoPedidoTs, EstadoPedidoTs>> = {
  PAGADO: 'ENVIADO',
  ENVIADO: 'ENTREGADO',
}

/** Recorrido completo de un pedido ya pagado (para mostrar los pasos en «Actualizar estado») */
export const SECUENCIA_ESTADOS: readonly EstadoPedidoTs[] = ['PAGADO', 'ENVIADO', 'ENTREGADO']

const NO_CANCELABLES: readonly EstadoPedidoTs[] = [
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
  'CANCELADO_VENCIMIENTO',
]

const CANCELADOS: readonly EstadoPedidoTs[] = ['CANCELADO', 'CANCELADO_VENCIMIENTO']

/** Motivos que se ofrecen al administrador al rechazar un comprobante */
export const MOTIVOS_RECHAZO: readonly string[] = [
  'El monto no coincide',
  'El comprobante es ilegible',
  'El depósito no se refleja en la cuenta',
  'Otro motivo',
]

export function siguienteEstadoPermitido(actual: EstadoPedidoTs): EstadoPedidoTs | null {
  return SIGUIENTE_ESTADO[actual] ?? null
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
  nuevo: EstadoPedidoTs,
  envio: DatosEnvioTs | null
): ResultadoValidacionTs {
  const errores: string[] = []
  const siguiente = siguienteEstadoPermitido(actual)

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

export function puedeCancelar(estado: EstadoPedidoTs): boolean {
  return !NO_CANCELABLES.includes(estado)
}

/** El pedido ya terminó en cancelación (manual o por vencimiento) */
export function estaCancelado(estado: EstadoPedidoTs): boolean {
  return CANCELADOS.includes(estado)
}

/** Solo se aprueba o rechaza el comprobante de un pedido en revisión */
export function puedeValidarPago(estado: EstadoPedidoTs): boolean {
  return estado === 'PAGO_EN_REVISION'
}

/** Cancelar un pedido ya pagado obliga a devolver el dinero al cliente */
export function requiereDevolucion(estado: EstadoPedidoTs): boolean {
  return estado === 'PAGADO'
}

/** El motivo (de rechazo o de cancelación) no puede ir en blanco */
export function validarMotivo(motivo: string): boolean {
  return motivo.trim() !== ''
}

/** Total de piezas del pedido (las que se descuentan o regresan al inventario) */
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
