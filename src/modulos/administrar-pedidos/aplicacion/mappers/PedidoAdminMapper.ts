/**
 * Mapper: DTOs del backend ↔ tipos Ts del módulo Administrar Pedidos
 * Métodos estáticos, como AccesoMapper / LoginMapper
 */

import type { PedidoResumenDTO } from '../dto/PedidoResumenDTO'
import type { PaginaPedidosDTO } from '../dto/PaginaPedidosDTO'
import type {
  DetallePedidoAdminDTO,
  ComprobanteDTO,
  DatosEnvioDTO,
  HistorialEntradaDTO,
  LineaPedidoDTO,
} from '../dto/DetallePedidoAdminDTO'
import type { ResultadoAccionDTO } from '../dto/ResultadoAccionDTO'
import type {
  ActualizarEstadoPeticionDTO,
  BuscarPedidosPeticionDTO,
  RechazarComprobantePeticionDTO,
  RegistrarPagoEfectivoPeticionDTO,
} from '../dto/PeticionesDTO'
import type { PedidoResumenTs } from '../../dominio/PedidoResumenTs'
import type { PaginaPedidosTs } from '../../dominio/PaginaPedidosTs'
import type { DetallePedidoAdminTs } from '../../dominio/DetallePedidoAdminTs'
import type { ResultadoAccionTs } from '../../dominio/ResultadoAccionTs'
import type { CriteriosBusquedaTs } from '../../dominio/CriteriosBusquedaTs'
import type { DatosEnvioTs } from '../../dominio/DatosEnvioTs'
import type { ComprobanteTs } from '../../dominio/ComprobanteTs'
import type { LineaPedidoTs } from '../../dominio/LineaPedidoTs'
import type { HistorialEntradaTs } from '../../dominio/HistorialEntradaTs'
import { esEstadoPedido, type EstadoPedidoTs } from '../../dominio/EstadoPedidoTs'
import { esMetodoPago, type MetodoPagoTs } from '../../dominio/MetodoPagoTs'

export class PedidoAdminMapper {
  // ---------- respuesta (DTO → Ts) ----------

  static aResumenTs(dto: PedidoResumenDTO): PedidoResumenTs {
    return {
      folio: dto.folio,
      fechaCreacion: aFecha(dto.fecha_creacion),
      clienteNombre: dto.cliente_nombre,
      clienteTelefono: dto.cliente_telefono,
      total: dto.total,
      metodoPago: aMetodoPago(dto.metodo_pago),
      estado: aEstado(dto.estado),
      fechaLimite: aFechaOpcional(dto.fecha_limite),
    }
  }

  static aPaginaTs(dto: PaginaPedidosDTO): PaginaPedidosTs {
    return {
      pedidos: dto.pedidos.map((p) => PedidoAdminMapper.aResumenTs(p)),
      totalEncontrado: dto.total_encontrado,
    }
  }

  static aDetalleTs(dto: DetallePedidoAdminDTO): DetallePedidoAdminTs {
    return {
      folio: dto.folio,
      estado: aEstado(dto.estado),
      fechaCreacion: aFecha(dto.fecha_creacion),
      fechaLimite: aFechaOpcional(dto.fecha_limite),
      cliente: { id: dto.cliente.id, nombre: dto.cliente.nombre, telefono: dto.cliente.telefono },
      datosEntrega: dto.datos_entrega,
      lineas: dto.lineas.map(aLineaTs),
      total: dto.total,
      metodoPago: aMetodoPago(dto.metodo_pago),
      comprobante: dto.comprobante ? aComprobanteTs(dto.comprobante) : null,
      envio: dto.envio ? aEnvioTs(dto.envio) : null,
      historial: dto.historial.map(aHistorialTs),
    }
  }

  static aResultadoTs(dto: ResultadoAccionDTO): ResultadoAccionTs {
    return {
      pedido: PedidoAdminMapper.aDetalleTs(dto.pedido),
      notificacionEnviada: dto.notificacion_enviada,
    }
  }

  // ---------- petición (Ts → DTO) ----------

  static aPeticionBusqueda(criterios: CriteriosBusquedaTs): BuscarPedidosPeticionDTO {
    const texto = criterios.texto.trim()
    return {
      ...(texto !== '' && { texto }),
      ...(criterios.estado && { estado: criterios.estado }),
      ...(criterios.metodoPago && { metodo_pago: criterios.metodoPago }),
      ...(criterios.desde && { desde: aFechaISO(criterios.desde) }),
      ...(criterios.hasta && { hasta: aFechaISO(criterios.hasta) }),
      pagina: criterios.pagina,
    }
  }

  static aPeticionPagoEfectivo(montoRecibido: number): RegistrarPagoEfectivoPeticionDTO {
    return { monto_recibido: montoRecibido }
  }

  static aPeticionRechazo(motivo: string, mensaje: string | null): RechazarComprobantePeticionDTO {
    const mensajeLimpio = mensaje?.trim() ?? ''
    return { motivo: motivo.trim(), mensaje: mensajeLimpio === '' ? null : mensajeLimpio }
  }

  static aPeticionEstado(estado: EstadoPedidoTs, envio: DatosEnvioTs | null): ActualizarEstadoPeticionDTO {
    return {
      estado,
      paqueteria: envio && !envio.entregaLocal ? envio.paqueteria.trim() : null,
      guia: envio && !envio.entregaLocal ? envio.guia.trim() : null,
      entrega_local: envio?.entregaLocal ?? false,
    }
  }
}

// ---------- auxiliares ----------

function aFecha(valor: string): Date {
  return new Date(valor)
}

function aFechaOpcional(valor: string | null): Date | null {
  return valor ? new Date(valor) : null
}

/**
 * Solo la fecha (AAAA-MM-DD) para los filtros de rango, con el día local que eligió el usuario.
 * El backend la toma como día completo en la hora de la tienda (America/Hermosillo).
 */
function aFechaISO(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

function aEstado(valor: string): EstadoPedidoTs {
  if (!esEstadoPedido(valor)) {
    throw new Error(`Estado de pedido desconocido: ${valor}`)
  }
  return valor
}

function aMetodoPago(valor: string): MetodoPagoTs {
  if (!esMetodoPago(valor)) {
    throw new Error(`Método de pago desconocido: ${valor}`)
  }
  return valor
}

function aLineaTs(dto: LineaPedidoDTO): LineaPedidoTs {
  return {
    producto: dto.producto,
    talla: dto.talla,
    cantidad: dto.cantidad,
    precioUnitario: dto.precio_unitario,
    subtotal: dto.subtotal,
  }
}

function aComprobanteTs(dto: ComprobanteDTO): ComprobanteTs {
  return {
    url: dto.url,
    nombreArchivo: dto.nombre_archivo,
    monto: dto.monto,
    fecha: aFechaOpcional(dto.fecha),
    concepto: dto.concepto,
    estado: dto.estado,
  }
}

function aEnvioTs(dto: DatosEnvioDTO): DatosEnvioTs {
  return {
    paqueteria: dto.paqueteria ?? '',
    guia: dto.guia ?? '',
    entregaLocal: dto.entrega_local,
  }
}

function aHistorialTs(dto: HistorialEntradaDTO): HistorialEntradaTs {
  return {
    fechaHora: aFecha(dto.fecha_hora),
    usuario: dto.usuario,
    estadoAnterior: dto.estado_anterior && esEstadoPedido(dto.estado_anterior) ? dto.estado_anterior : null,
    estadoNuevo: aEstado(dto.estado_nuevo),
    motivo: dto.motivo,
  }
}
