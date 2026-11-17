/**
 * PedidoVentaMapper · Fabricación pura (GRASP)
 * Convierte los DTO del backend en los TsInterfaces que pintan las vistas, y al revés.
 * «Mapper en la misma clase, solo se usa uno» (diagrama de secuencia, mensaje 17).
 * Sin I/O, sin React y sin reloj: todo lo que depende de la hora llega por parámetro.
 */

import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { PedidoVentaDTO } from '../dto/PedidoVentaDTO'
import type { DetallePedidoDTO } from '../dto/DetallePedidoDTO'
import type { DatosEntregaDTO } from '../dto/DatosEntregaDTO'
import type { DatosBancariosDTO } from '../dto/DatosBancariosDTO'
import type { MetodoPagoDTO } from '../dto/MetodoPagoDTO'
import type { CarritoTs, DescuentoCodigoTs, EsquemaPrecioTs, LineaCarritoTs } from '../../dominio/CarritoTs'
import type { InformacionPedidoTs } from '../../dominio/InformacionPedidoTs'
import type { DatosEntregaTs } from '../../dominio/DatosEntregaTs'
import type { DatosBancariosTs } from '../../dominio/DatosBancariosTs'
import type { MetodoPagoTs } from '../../dominio/MetodoPagoTs'
import type { EstadoPedidoTs } from '../../dominio/EstadoVenta'
import { EstadoVenta } from '../../dominio/EstadoVenta'
import { TipoPago } from '../../dominio/TipoPago'
import { TipoPrecio } from '../../dominio/TipoPrecio'
import { HORAS_LIMITE_PAGO, soloDigitos } from '../../dominio/ReglasVenta'

const ETIQUETAS_ESQUEMA: Record<TipoPrecio, string> = {
  [TipoPrecio.BASE]: 'Base',
  [TipoPrecio.MAYOREO]: 'Mayoreo',
  [TipoPrecio.DISTRIBUIDOR]: 'Distribuidor',
}

const ESTADOS: Record<string, Omit<EstadoPedidoTs, 'valor'>> = {
  [EstadoVenta.PENDIENTE]: { etiqueta: 'En carrito', tono: 'neutro' },
  [EstadoVenta.PAGO_EN_REVISION]: { etiqueta: 'Pago en revisión', tono: 'info' },
  [EstadoVenta.PENDIENTE_COMPROBANTE]: { etiqueta: 'Pendiente de comprobante', tono: 'advertencia' },
  [EstadoVenta.PENDIENTE_PAGO]: { etiqueta: 'Pendiente de pago', tono: 'advertencia' },
  // Nombre anterior del mismo estado en la propuesta del backend (3-nov).
  APARTADO_PENDIENTE_PAGO: { etiqueta: 'Pendiente de pago', tono: 'advertencia' },
  [EstadoVenta.PAGADO]: { etiqueta: 'Pagado', tono: 'exito' },
  [EstadoVenta.ENVIADO]: { etiqueta: 'Enviado', tono: 'info' },
  [EstadoVenta.ENTREGADO]: { etiqueta: 'Entregado', tono: 'exito' },
  [EstadoVenta.ELIMINADO_POR_VENCIMIENTO]: { etiqueta: 'Eliminado por vencimiento', tono: 'error' },
}

const MS_POR_HORA = 60 * 60 * 1000

export class PedidoVentaMapper {
  /** Básico, mensaje 7 · Alt1 y Alt2, mensaje 7. */
  static convertirPedidoVentaDTOaCarritoTs(dto: PedidoVentaDTO): CarritoTs {
    const lineas = dto.detalles.map(PedidoVentaMapper.convertirDetalleALineaCarritoTs)
    return {
      lineas,
      totalProductos: lineas.length,
      totalPiezas: dto.totalPiezas,
      esquema: PedidoVentaMapper.convertirEsquema(dto),
      subtotalPrecioBase: dto.subtotalPrecioBase,
      ahorroPorEsquema: dto.ahorroPorTipoPrecio,
      descuentosCodigo: PedidoVentaMapper.convertirDescuentosCodigo(dto.detalles),
      total: dto.total,
      vacio: lineas.length === 0,
    }
  }

  /** Básico, mensaje 22. */
  static convertirPedidoVentaDTOaInformacionPedidoTs(dto: PedidoVentaDTO): InformacionPedidoTs {
    const entrega = dto.datosEntrega
    return {
      folio: dto.folio ?? dto.metodoPago?.folio ?? null,
      articulos: dto.detalles.map((detalle) => ({
        idDetalle: detalle.id,
        nombre: detalle.productoNombre,
        imagenUrl: detalle.imagenUrl,
        cantidad: detalle.cantidad,
        precioFinal: detalle.precioUnitario - detalle.descuentoUnitario,
        subtotal: detalle.subtotal,
      })),
      totalProductos: dto.detalles.length,
      totalPiezas: dto.totalPiezas,
      etiquetaEsquema: ETIQUETAS_ESQUEMA[dto.tipoPrecioAplicado] ?? dto.tipoPrecioAplicado,
      subtotalPrecioBase: dto.subtotalPrecioBase,
      ahorroPorEsquema: dto.ahorroPorTipoPrecio,
      descuentosCodigo: PedidoVentaMapper.convertirDescuentosCodigo(dto.detalles),
      total: dto.total,
      estado: dto.estadoVenta ? PedidoVentaMapper.convertirEstado(dto.estadoVenta) : null,
      tipoPago: dto.metodoPago?.tipoPago ?? null,
      fechaHoraPedido: PedidoVentaMapper.convertirFecha(dto.fechaHoraPedido),
      fechaLimitePago: PedidoVentaMapper.convertirFecha(dto.fechaLimitePago),
      cliente: entrega?.nombreCompleto
        ? { nombre: entrega.nombreCompleto, telefono: entrega.telefono ?? '' }
        : null,
      enlaceWhatsapp: dto.enlaceWhatsapp,
    }
  }

  /** Básico, mensaje 17. */
  static convertirDatosEntregaDTOaDatosEntregaTs(dto: DatosEntregaDTO | null): DatosEntregaTs {
    return {
      nombreCompleto: dto?.nombreCompleto ?? '',
      telefono: PedidoVentaMapper.formatearTelefono(dto?.telefono ?? ''),
      ciudad: dto?.ciudad ?? '',
      estado: dto?.estado ?? '',
      direccion: dto?.direccion ?? '',
      referencias: dto?.referencias ?? '',
      guardarComoPredeterminada: dto?.guardarComoPredeterminada ?? true,
    }
  }

  /** Para registrar el pedido: recorta espacios y deja el teléfono solo con dígitos. */
  static convertirDatosEntregaTsaDatosEntregaDTO(ts: DatosEntregaTs): DatosEntregaDTO {
    const referencias = ts.referencias.trim()
    return {
      nombreCompleto: ts.nombreCompleto.trim(),
      telefono: soloDigitos(ts.telefono),
      ciudad: ts.ciudad.trim(),
      estado: ts.estado.trim(),
      direccion: ts.direccion.trim(),
      referencias: referencias === '' ? null : referencias,
      guardarComoPredeterminada: ts.guardarComoPredeterminada,
    }
  }

  /** Básico, mensaje 32. */
  static convertirDatosBancariosDTOaDatosBancariosTs(dto: DatosBancariosDTO): DatosBancariosTs {
    return {
      banco: dto.banco,
      titular: dto.titular,
      numeroCuenta: dto.numeroCuenta,
      clabe: dto.clabe,
      folio: dto.folio,
      concepto: dto.folio,
    }
  }

  /** Alt3 y Alt4, mensaje 4. La fecha límite es una estimación hasta que el backend registre el pedido. */
  static convertirMetodoPagoDTOaMetodoPagoTs(dto: MetodoPagoDTO, ahora: Date): MetodoPagoTs {
    const conComprobante = Boolean(dto.comprobanteRuta)
    const fechaLimiteEstimada = new Date(ahora.getTime() + HORAS_LIMITE_PAGO * MS_POR_HORA)
    if (dto.tipoPago === TipoPago.EFECTIVO) {
      return {
        tipoPago: dto.tipoPago,
        modalidad: 'EFECTIVO',
        etiqueta: 'Efectivo',
        comprobanteNombre: null,
        estadoInicial: PedidoVentaMapper.convertirEstado(EstadoVenta.PENDIENTE_PAGO),
        fechaLimiteEstimada,
      }
    }
    return {
      tipoPago: dto.tipoPago,
      modalidad: conComprobante ? 'COMPROBANTE' : 'COMPROBANTE_DESPUES',
      etiqueta: 'Transferencia bancaria',
      comprobanteNombre: conComprobante ? dto.comprobanteNombre ?? 'Comprobante' : null,
      estadoInicial: PedidoVentaMapper.convertirEstado(
        conComprobante ? EstadoVenta.PAGO_EN_REVISION : EstadoVenta.PENDIENTE_COMPROBANTE
      ),
      fechaLimiteEstimada: conComprobante ? null : fechaLimiteEstimada,
    }
  }

  static convertirEstado(valor: string): EstadoPedidoTs {
    const conocido = ESTADOS[valor]
    if (conocido) return { valor, ...conocido }
    const etiqueta = valor.charAt(0) + valor.slice(1).toLowerCase().replaceAll('_', ' ')
    return { valor, etiqueta, tono: 'neutro' }
  }

  /**
   * Convierte cualquier error (ErrorApi del HttpClient, excepción del gateway o Error) en ErrorTs.
   * Lee el tipo por forma, sin importar infraestructura.
   */
  static convertirErrorAErrorTs(error: unknown, mensajePorDefecto: string): ErrorTs {
    if (error instanceof Error && error.message) {
      const tipo = 'tipo' in error && typeof error.tipo === 'string' ? error.tipo.toLowerCase() : undefined
      const tiposConocidos: readonly NonNullable<ErrorTs['tipo']>[] = ['validacion', 'negocio', 'red', 'desconocido']
      const tipoTs = tiposConocidos.find((t) => t === tipo)
      return tipoTs ? { mensaje: error.message, tipo: tipoTs } : { mensaje: error.message }
    }
    return { mensaje: mensajePorDefecto, tipo: 'desconocido' }
  }

  private static convertirDetalleALineaCarritoTs(detalle: DetallePedidoDTO): LineaCarritoTs {
    const precioFinal = detalle.precioUnitario - detalle.descuentoUnitario
    const variante = [`${detalle.tipoTalla || 'Talla'}: ${detalle.talla}`]
    if (detalle.color) variante.push(`Color: ${detalle.color}`)
    return {
      idDetalle: detalle.id,
      varianteProductoId: detalle.varianteProductoId,
      marca: detalle.marca,
      nombre: detalle.productoNombre,
      descripcionVariante: variante.join(' · '),
      imagenUrl: detalle.imagenUrl,
      cantidad: detalle.cantidad,
      existencia: detalle.existencia,
      tipoPrecio: detalle.tipoPrecio,
      etiquetaEsquema: ETIQUETAS_ESQUEMA[detalle.tipoPrecio] ?? detalle.tipoPrecio,
      precioEsquema: detalle.precioUnitario,
      precioFinal,
      subtotalSinCodigo: detalle.precioUnitario * detalle.cantidad,
      subtotal: detalle.subtotal,
      codigoDescuento: detalle.codigoDescuento
        ? {
            codigo: detalle.codigoDescuento.codigo,
            etiquetaValor: detalle.codigoDescuento.etiquetaValor,
            montoDescuento: detalle.codigoDescuento.montoDescuento,
          }
        : null,
    }
  }

  private static convertirEsquema(dto: PedidoVentaDTO): EsquemaPrecioTs {
    const niveles = [...dto.nivelesPrecio].sort((a, b) => a.minPiezas - b.minPiezas)
    const indice = niveles.findIndex((nivel) => nivel.tipoPrecio === dto.tipoPrecioAplicado)
    const actual = indice >= 0 ? niveles[indice] : undefined
    const nivelSiguiente = indice >= 0 ? niveles[indice + 1] : undefined
    const rango = !actual
      ? `${dto.totalPiezas} pzas`
      : nivelSiguiente
        ? `${actual.minPiezas}–${nivelSiguiente.minPiezas - 1} pzas`
        : `${actual.minPiezas}+ pzas`
    const siguienteTipo = dto.siguienteTipoPrecio
    const minSiguiente = siguienteTipo
      ? niveles.find((nivel) => nivel.tipoPrecio === siguienteTipo)?.minPiezas ?? null
      : null
    return {
      tipoPrecio: dto.tipoPrecioAplicado,
      etiqueta: ETIQUETAS_ESQUEMA[dto.tipoPrecioAplicado] ?? dto.tipoPrecioAplicado,
      rango,
      siguiente: siguienteTipo
        ? {
            etiqueta: ETIQUETAS_ESQUEMA[siguienteTipo] ?? siguienteTipo,
            minPiezas: minSiguiente,
            piezasFaltantes: Math.max(0, dto.piezasParaSiguienteNivel ?? 0),
          }
        : null,
      progreso: siguienteTipo && minSiguiente
        ? Math.min(1, Math.max(0, dto.totalPiezas / minSiguiente))
        : 1,
    }
  }

  private static convertirDescuentosCodigo(detalles: readonly DetallePedidoDTO[]): DescuentoCodigoTs[] {
    return detalles.flatMap((detalle) =>
      detalle.codigoDescuento
        ? [{
            codigo: detalle.codigoDescuento.codigo,
            producto: detalle.productoNombre,
            etiquetaValor: detalle.codigoDescuento.etiquetaValor,
            monto: detalle.codigoDescuento.montoDescuento,
          }]
        : []
    )
  }

  private static convertirFecha(valor: string | null): Date | null {
    if (!valor) return null
    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime()) ? null : fecha
  }

  /** 6441234567 → «644 123 4567» */
  private static formatearTelefono(valor: string): string {
    const digitos = soloDigitos(valor)
    return digitos.length === 10 ? `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}` : valor
  }
}
