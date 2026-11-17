/**
 * Textos que las vistas del detalle arman a partir del pedido:
 * la advertencia de cancelación, el aviso de cambio de estado y el mensaje
 * que se manda al cliente por WhatsApp cuando el backend no pudo notificarlo.
 */

import type { DetallePedidoAdminTs } from '../dominio/DetallePedidoAdminTs'
import type { HistorialEntradaTs } from '../dominio/HistorialEntradaTs'
import { ETIQUETA_ESTADO } from '../dominio/EstadoPedidoTs'
import { contarPiezas, requiereDevolucion } from '../dominio/ReglasPedido'
import { formatearFecha, formatearMoneda } from './formato'

/** Lada de México: se antepone a los teléfonos de 10 dígitos */
const LADA_MX = '52'

function textoPiezas(detalle: DetallePedidoAdminTs): string {
  const piezas = contarPiezas(detalle.lineas)
  return piezas === 1 ? 'La pieza' : `Las ${piezas} piezas`
}

/** Entrada más reciente del historial (sin depender del orden en que llegue) */
export function ultimoCambio(detalle: DetallePedidoAdminTs): HistorialEntradaTs | null {
  return detalle.historial.reduce<HistorialEntradaTs | null>(
    (reciente, entrada) =>
      reciente === null || entrada.fechaHora.getTime() > reciente.fechaHora.getTime() ? entrada : reciente,
    null
  )
}

/** Advertencia del diálogo «Cancelar pedido»: se liberan las piezas (y devolución si ya se pagó) */
export function advertenciaCancelacion(detalle: DetallePedidoAdminTs): string {
  const piezas = contarPiezas(detalle.lineas)
  const regreso = `${textoPiezas(detalle)} ${piezas === 1 ? 'regresará' : 'regresarán'} al inventario`
  return requiereDevolucion(detalle.estado)
    ? `${regreso} y deberás devolver ${formatearMoneda(detalle.total)} a ${detalle.cliente.nombre}.`
    : `${regreso}.`
}

/** Quién y cuándo movió el pedido al estado que tiene ahora (para el aviso «cambió de estado») */
export function descripcionCambioDeEstado(detalle: DetallePedidoAdminTs): string {
  const cambio = ultimoCambio(detalle)
  const actual = `«${ETIQUETA_ESTADO[detalle.estado]}»`
  if (!cambio || cambio.estadoNuevo !== detalle.estado) {
    return `Ahora está en ${actual}.`
  }
  return `${cambio.usuario} lo pasó a ${actual} el ${formatearFecha(cambio.fechaHora)}.`
}

/** Mensaje para el cliente según el estado en que quedó el pedido */
export function mensajeParaCliente(detalle: DetallePedidoAdminTs): string {
  const saludo = `Hola ${detalle.cliente.nombre}, te escribimos de FlyStore.`
  const pedido = `tu pedido ${detalle.folio}`
  const cambio = ultimoCambio(detalle)
  const motivo = cambio && cambio.estadoNuevo === detalle.estado && cambio.motivo ? cambio.motivo.trim() : ''

  switch (detalle.estado) {
    case 'PAGADO':
      return `${saludo} Confirmamos el pago de ${pedido}. ¡Gracias por tu compra!`
    case 'PENDIENTE_COMPROBANTE':
      return (
        `${saludo} No pudimos validar el comprobante de ${pedido}` +
        `${motivo ? ` (${motivo})` : ''}. ` +
        (detalle.fechaLimite
          ? `Sube uno nuevo antes del ${formatearFecha(detalle.fechaLimite)} para conservar tu apartado.`
          : 'Sube uno nuevo para conservar tu apartado.')
      )
    case 'ENVIADO':
      if (!detalle.envio || detalle.envio.entregaLocal) {
        return `${saludo} Ya salió ${pedido} y te lo entregaremos de forma local.`
      }
      return `${saludo} Ya enviamos ${pedido} por ${detalle.envio.paqueteria}, guía ${detalle.envio.guia}.`
    case 'ENTREGADO':
      return `${saludo} Registramos la entrega de ${pedido}. ¡Gracias por tu compra!`
    case 'CANCELADO':
    case 'CANCELADO_VENCIMIENTO':
      return `${saludo} Cancelamos ${pedido}${motivo ? `: ${motivo}` : ''}.`
    case 'APARTADO_PENDIENTE_PAGO':
    case 'PAGO_EN_REVISION':
      return `${saludo} Hay novedades de ${pedido}: ${ETIQUETA_ESTADO[detalle.estado]}.`
  }
}

/**
 * Enlace wa.me con el mensaje ya escrito.
 * Devuelve null si el cliente no tiene teléfono registrado.
 */
export function construirEnlaceWhatsApp(telefono: string | null, mensaje: string): string | null {
  const digitos = telefono?.replace(/\D/g, '') ?? ''
  if (digitos === '') return null
  const numero = digitos.length === 10 ? `${LADA_MX}${digitos}` : digitos
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
