/**
 * Gateway en memoria del CU-02 para probar la presentación sin backend (solo desarrollo).
 * Reproduce los datos del Figma: 11 piezas a precio Mayoreo, total $4,210 y el código FLY10.
 * No hace peticiones ni guarda nada en el navegador; una recarga reinicia los datos.
 */

import type { IGestionarVentaGateway } from '@modulos/gestionar-venta'
import type { PedidoVentaDTO } from '@modulos/gestionar-venta/aplicacion/dto/PedidoVentaDTO'
import type { DetallePedidoDTO } from '@modulos/gestionar-venta/aplicacion/dto/DetallePedidoDTO'
import type { DatosEntregaDTO } from '@modulos/gestionar-venta/aplicacion/dto/DatosEntregaDTO'
import type { NivelPrecioDTO } from '@modulos/gestionar-venta/aplicacion/dto/NivelPrecioDTO'
import type { ComprobantePedidoDTO } from '@modulos/gestionar-venta/aplicacion/dto/ComprobantePedidoDTO'
import { RespuestaValidacionComprobanteException } from '@modulos/gestionar-venta/dominio/RespuestaValidacionComprobanteException'
import { validarArchivoComprobante, HORAS_LIMITE_PAGO } from '@modulos/gestionar-venta/dominio/ReglasVenta'

type Esquema = 'BASE' | 'MAYOREO' | 'DISTRIBUIDOR'

interface ProductoDemo {
  readonly varianteProductoId: number
  readonly productoNombre: string
  readonly marca: string
  readonly tipoTalla: string
  readonly talla: string
  readonly color: string | null
  readonly existencia: number
  readonly precios: Record<Esquema, number>
}

const NIVELES: readonly NivelPrecioDTO[] = [
  { tipoPrecio: 'BASE', minPiezas: 1 },
  { tipoPrecio: 'MAYOREO', minPiezas: 6 },
  { tipoPrecio: 'DISTRIBUIDOR', minPiezas: 12 },
]

const PRODUCTOS: readonly ProductoDemo[] = [
  { varianteProductoId: 101, productoNombre: '9FORTY LA Dodgers Negro', marca: 'New Era', tipoTalla: 'Talla', talla: 'Ajustable', color: 'Negro', existencia: 18, precios: { BASE: 250, MAYOREO: 210, DISTRIBUIDOR: 190 } },
  { varianteProductoId: 102, productoNombre: '59FIFTY NY Yankees Negro', marca: 'New Era', tipoTalla: 'Talla', talla: '7 ⅜', color: 'Negro', existencia: 10, precios: { BASE: 300, MAYOREO: 260, DISTRIBUIDOR: 240 } },
  { varianteProductoId: 103, productoNombre: 'Asad Eau de Parfum 100 ml', marca: 'Lattafa', tipoTalla: 'Presentación', talla: '100 ml · Caballero', color: null, existencia: 5, precios: { BASE: 600, MAYOREO: 520, DISTRIBUIDOR: 480 } },
  { varianteProductoId: 104, productoNombre: "Air Force 1 '07 Negro", marca: 'Nike', tipoTalla: 'Talla', talla: '27 MX', color: 'Negro', existencia: 3, precios: { BASE: 1900, MAYOREO: 1650, DISTRIBUIDOR: 1550 } },
]

/** Códigos válidos en la prueba: FLY10 = 10 % en la 9FORTY LA Dodgers. */
const CODIGOS: Readonly<Record<string, { varianteProductoId: number; porcentaje: number }>> = {
  FLY10: { varianteProductoId: 101, porcentaje: 10 },
}

const ENTREGA: DatosEntregaDTO = {
  nombreCompleto: 'Ana Torres',
  telefono: '6441234567',
  ciudad: 'Ciudad Obregón',
  estado: 'Sonora',
  direccion: 'Calle 5 de Febrero 1234, Col. Centro, C.P. 85000',
  referencias: 'Portón negro, frente al parque',
  guardarComoPredeterminada: true,
}

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms))

export function crearGatewayVentaDemo(retardoMs = 350): IGestionarVentaGateway {
  const cantidades = new Map<number, number>([[101, 6], [102, 3], [103, 1], [104, 1]])
  const codigos = new Map<number, string>()
  let folio: string | null = null
  let consecutivo = 128

  const pedido = (): PedidoVentaDTO => {
    const lineas = PRODUCTOS.filter((p) => (cantidades.get(p.varianteProductoId) ?? 0) > 0)
    const totalPiezas = lineas.reduce((suma, p) => suma + (cantidades.get(p.varianteProductoId) ?? 0), 0)
    const nivel = [...NIVELES].reverse().find((n) => totalPiezas >= n.minPiezas) ?? NIVELES[0]!
    const siguiente = NIVELES[NIVELES.indexOf(nivel) + 1] ?? null
    const detalles: DetallePedidoDTO[] = lineas.map((p, indice) => {
      const cantidad = cantidades.get(p.varianteProductoId) ?? 0
      const precioUnitario = p.precios[nivel.tipoPrecio]
      const codigo = codigos.get(p.varianteProductoId)
      const porcentaje = codigo ? CODIGOS[codigo]?.porcentaje ?? 0 : 0
      const descuentoUnitario = Math.round(precioUnitario * porcentaje) / 100
      return {
        id: indice + 1,
        varianteProductoId: p.varianteProductoId,
        productoNombre: p.productoNombre,
        marca: p.marca,
        tipoTalla: p.tipoTalla,
        talla: p.talla,
        color: p.color,
        imagenUrl: null,
        cantidad,
        existencia: p.existencia,
        tipoPrecio: nivel.tipoPrecio,
        precioBase: p.precios.BASE,
        precioUnitario,
        descuentoUnitario,
        codigoDescuento: codigo ? { codigo, etiquetaValor: `${porcentaje}%`, montoDescuento: descuentoUnitario * cantidad } : null,
        subtotal: (precioUnitario - descuentoUnitario) * cantidad,
      }
    })
    const subtotalPrecioBase = detalles.reduce((s, d) => s + d.precioBase * d.cantidad, 0)
    const totalEsquema = detalles.reduce((s, d) => s + d.precioUnitario * d.cantidad, 0)
    const totalDescuentos = detalles.reduce((s, d) => s + d.descuentoUnitario * d.cantidad, 0)
    return {
      id: 1,
      folio,
      estadoVenta: 'PENDIENTE',
      detalles,
      totalPiezas,
      tipoPrecioAplicado: nivel.tipoPrecio,
      siguienteTipoPrecio: siguiente?.tipoPrecio ?? null,
      piezasParaSiguienteNivel: siguiente ? siguiente.minPiezas - totalPiezas : null,
      nivelesPrecio: NIVELES,
      subtotalPrecioBase,
      ahorroPorTipoPrecio: subtotalPrecioBase - totalEsquema,
      totalDescuentos,
      total: totalEsquema - totalDescuentos,
      datosEntrega: null,
      metodoPago: null,
      fechaHoraPedido: null,
      fechaLimitePago: null,
      enlaceWhatsapp: null,
    }
  }

  return {
    async obtenerPedidoVentaEnCurso() { await esperar(retardoMs); return pedido() },

    async actualizarCantidad({ varianteProductoId, cantidad }) {
      await esperar(retardoMs)
      const producto = PRODUCTOS.find((p) => p.varianteProductoId === varianteProductoId)
      if (!producto) throw new Error('El producto ya no está en tu carrito.')
      if (cantidad > producto.existencia) {
        throw new Error(`Solo quedan ${producto.existencia} piezas de ${producto.productoNombre}. Ajusta la cantidad.`)
      }
      cantidades.set(varianteProductoId, cantidad)
      if (cantidad === 0) codigos.delete(varianteProductoId)
      return pedido()
    },

    async aplicarCodigoDescuento({ codigo }) {
      await esperar(retardoMs)
      const regla = CODIGOS[codigo]
      if (!regla || !(cantidades.get(regla.varianteProductoId) ?? 0)) {
        throw new Error(`${codigo} no existe, ya venció o no aplica a ningún producto de tu carrito.`)
      }
      if (codigos.has(regla.varianteProductoId)) throw new Error('Ese producto ya tiene un código aplicado.')
      codigos.set(regla.varianteProductoId, codigo)
      return pedido()
    },

    async obtenerDatosEntrega() { await esperar(retardoMs); return { ...ENTREGA } },

    async obtenerDatosBancarios() {
      await esperar(retardoMs)
      folio ??= `FLY-${String(consecutivo).padStart(6, '0')}`
      return { banco: 'Mercado Pago W', titular: 'FLY Store', numeroCuenta: '1234 5678 9012', clabe: '722 969 0101 2345 6789', folio }
    },

    async validarMetodoPagoDTO(dto) {
      await esperar(retardoMs * 2)
      const archivo = dto.comprobantePagoArchivo
      const error = archivo ? validarArchivoComprobante(archivo) : 'Selecciona un archivo.'
      if (error) throw new RespuestaValidacionComprobanteException(error)
      return { comprobanteRuta: `comprobantes/${dto.folio}/${archivo?.name ?? ''}`, valido: true, mensaje: 'Comprobante recibido' }
    },

    async registrarPedidoVenta(dto) {
      await esperar(retardoMs * 2)
      const ahora = new Date()
      const tipoPago = dto.metodoPago?.tipoPago
      const conComprobante = Boolean(dto.metodoPago?.comprobanteRuta)
      const estadoVenta = tipoPago === 'EFECTIVO' ? 'PENDIENTE_PAGO' : conComprobante ? 'PAGO_EN_REVISION' : 'PENDIENTE_COMPROBANTE'
      const registrado: PedidoVentaDTO = {
        ...pedido(),
        folio: dto.folio,
        estadoVenta,
        datosEntrega: dto.datosEntrega,
        metodoPago: dto.metodoPago,
        fechaHoraPedido: ahora.toISOString(),
        fechaLimitePago: conComprobante ? null : new Date(ahora.getTime() + HORAS_LIMITE_PAGO * 3_600_000).toISOString(),
        enlaceWhatsapp: `https://wa.me/?text=${encodeURIComponent(`Hola, hice el pedido ${dto.folio ?? ''} en FlyStore.`)}`,
      }
      // El carrito queda vacío y el siguiente pedido tendrá otro folio.
      cantidades.clear()
      codigos.clear()
      folio = null
      consecutivo += 1
      return registrado
    },

    async generarComprobantePedidoVenta(folioPedido) {
      await esperar(retardoMs)
      return crearComprobanteHTML(folioPedido, pedido())
    },
  }
}

/** Genera comprobante HTML+CSS para el ticket del pedido. */
function crearComprobanteHTML(folio: string, pedido: PedidoVentaDTO): ComprobantePedidoDTO {
  const fechaActual = new Date().toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  const html = `
    <div class="comprobante">
      <header class="comprobante-header">
        <h1 class="comprobante-titulo">FLY Store</h1>
        <p class="comprobante-subtitulo">Comprobante de Pedido</p>
      </header>

      <section class="comprobante-info">
        <div class="info-item">
          <span class="info-label">Folio:</span>
          <span class="info-valor">${folio}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fecha:</span>
          <span class="info-valor">${fechaActual}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado:</span>
          <span class="info-valor">${pedido.estadoVenta}</span>
        </div>
      </section>

      ${pedido.datosEntrega ? `
      <section class="comprobante-seccion">
        <h2 class="seccion-titulo">Datos de Entrega</h2>
        <p class="seccion-texto"><strong>${pedido.datosEntrega.nombreCompleto}</strong></p>
        <p class="seccion-texto">${pedido.datosEntrega.direccion}</p>
        <p class="seccion-texto">${pedido.datosEntrega.ciudad}, ${pedido.datosEntrega.estado}</p>
        <p class="seccion-texto">Tel: ${pedido.datosEntrega.telefono}</p>
        ${pedido.datosEntrega.referencias ? `<p class="seccion-texto"><em>${pedido.datosEntrega.referencias}</em></p>` : ''}
      </section>
      ` : ''}

      <section class="comprobante-seccion">
        <h2 class="seccion-titulo">Productos</h2>
        <table class="comprobante-tabla">
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Producto</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${pedido.detalles.map(detalle => `
              <tr>
                <td>${detalle.cantidad}</td>
                <td>
                  <div class="producto-nombre">${detalle.productoNombre}</div>
                  <div class="producto-detalle">${detalle.marca} · ${detalle.talla}${detalle.color ? ' · ' + detalle.color : ''}</div>
                  ${detalle.codigoDescuento ? `<div class="producto-codigo">Código: ${detalle.codigoDescuento.codigo} (${detalle.codigoDescuento.etiquetaValor})</div>` : ''}
                </td>
                <td class="tabla-numero">$${detalle.precioUnitario.toFixed(2)}</td>
                <td class="tabla-numero">$${detalle.subtotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section class="comprobante-totales">
        <div class="total-linea">
          <span class="total-label">Total de piezas:</span>
          <span class="total-valor">${pedido.totalPiezas}</span>
        </div>
        ${pedido.ahorroPorTipoPrecio > 0 ? `
        <div class="total-linea total-ahorro">
          <span class="total-label">Ahorro por ${pedido.tipoPrecioAplicado}:</span>
          <span class="total-valor">-$${pedido.ahorroPorTipoPrecio.toFixed(2)}</span>
        </div>
        ` : ''}
        ${pedido.totalDescuentos > 0 ? `
        <div class="total-linea total-ahorro">
          <span class="total-label">Descuentos:</span>
          <span class="total-valor">-$${pedido.totalDescuentos.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-linea total-final">
          <span class="total-label">TOTAL:</span>
          <span class="total-valor">$${pedido.total.toFixed(2)} MXN</span>
        </div>
      </section>

      ${pedido.metodoPago ? `
      <section class="comprobante-seccion">
        <h2 class="seccion-titulo">Método de Pago</h2>
        <p class="seccion-texto"><strong>${pedido.metodoPago.tipoPago}</strong></p>
        ${pedido.metodoPago.comprobanteNombre ? `<p class="seccion-texto">Comprobante: ${pedido.metodoPago.comprobanteNombre}</p>` : ''}
      </section>
      ` : ''}

      <footer class="comprobante-footer">
        <p>Gracias por tu compra en FLY Store</p>
        <p class="footer-nota">Este es un comprobante de prueba generado sin backend</p>
      </footer>
    </div>
  `

  const css = `
    .comprobante {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: white;
      color: #1a1a1a;
      line-height: 1.6;
    }

    .comprobante-header {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .comprobante-titulo {
      font-family: 'Oswald', sans-serif;
      font-size: 42px;
      font-weight: 600;
      margin: 0 0 8px 0;
      letter-spacing: 2px;
    }

    .comprobante-subtitulo {
      font-size: 18px;
      color: #666;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .comprobante-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .info-valor {
      font-size: 16px;
      font-weight: 600;
      color: #000;
    }

    .comprobante-seccion {
      margin-bottom: 30px;
    }

    .seccion-titulo {
      font-family: 'Oswald', sans-serif;
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }

    .seccion-texto {
      margin: 8px 0;
      font-size: 14px;
      line-height: 1.6;
    }

    .comprobante-tabla {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .comprobante-tabla thead {
      background: #f5f5f5;
    }

    .comprobante-tabla th {
      text-align: left;
      padding: 12px 8px;
      font-weight: 600;
      border-bottom: 2px solid #000;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    .comprobante-tabla td {
      padding: 12px 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .tabla-numero {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .producto-nombre {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .producto-detalle {
      font-size: 12px;
      color: #666;
    }

    .producto-codigo {
      font-size: 12px;
      color: #22c55e;
      font-weight: 500;
      margin-top: 4px;
    }

    .comprobante-totales {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
    }

    .total-linea {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .total-ahorro {
      color: #22c55e;
    }

    .total-final {
      font-size: 20px;
      font-weight: 700;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid #000;
    }

    .total-label {
      font-weight: 500;
    }

    .total-valor {
      font-variant-numeric: tabular-nums;
    }

    .comprobante-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    .footer-nota {
      font-size: 12px;
      font-style: italic;
      margin-top: 8px;
    }

    @media print {
      .comprobante {
        padding: 20px;
      }

      .comprobante-tabla {
        page-break-inside: avoid;
      }
    }
  `

  return {
    folio,
    fechaEmision: new Date().toISOString(),
    html,
    css,
  }
}
