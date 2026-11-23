/**
 * Utilidades de formato para las vistas del módulo Administrar Pedidos
 */

import type { TonoInsignia } from '@compartido/ui/Insignia'
import type { EstadoPedidoTs } from '../dominio/EstadoPedidoTs'

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

const fechaHora = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatearMoneda(valor: number): string {
  return moneda.format(valor)
}

export function formatearFecha(fecha: Date | null): string {
  return fecha ? fechaHora.format(fecha) : '—'
}

export function tonoEstado(estado: EstadoPedidoTs): TonoInsignia {
  switch (estado) {
    case 'APARTADO_PENDIENTE_PAGO':
    case 'PENDIENTE_COMPROBANTE':
      return 'advertencia'
    case 'PAGO_EN_REVISION':
    case 'PREPARACION':
    case 'ENVIADO':
      return 'info'
    case 'PAGADO':
    case 'ENTREGADO':
      return 'exito'
    case 'CANCELADO':
    case 'CANCELADO_VENCIMIENTO':
      return 'error'
  }
}
