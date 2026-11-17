import { Texto } from '@compartido/ui'
import type { InformacionPedidoTs } from '../../dominio/InformacionPedidoTs'
import { TipoPago } from '../../dominio/TipoPago'
import { formatearDescuento, formatearFechaTicket, formatearMonto, formatearTelefono, formatearTotal, piezas } from '../formato'
import estilos from './venta.module.css'

interface Props {
  readonly pedido: InformacionPedidoTs
  readonly cliente: { readonly nombre: string; readonly telefono: string } | null
}

/** «Comprobante de pedido» de B7: versión en pantalla del ticket PDF. */
export function TicketPedido({ pedido, cliente }: Props) {
  return (
    <aside className={estilos.ticket} aria-labelledby="titulo-ticket">
      <div className={estilos.ticketEncabezado}>
        <img src="/flyBlanco.svg" alt="FLY" />
        <Texto variante="sobretitulo" id="titulo-ticket">Comprobante de pedido</Texto>
      </div>
      <div className={estilos.ticketPapel}>
        <Fila etiqueta="No. de pedido" valor={pedido.folio ?? '—'} fuerte />
        {pedido.fechaHoraPedido && <Fila etiqueta="Fecha" valor={formatearFechaTicket(pedido.fechaHoraPedido)} fuerte />}
        {cliente && <Fila etiqueta="Cliente" valor={cliente.nombre} fuerte />}
        {cliente && <Fila etiqueta="Teléfono" valor={formatearTelefono(cliente.telefono)} fuerte />}
        <hr />
        <div className={estilos.fila}>
          <Texto variante="sobretitulo">Producto</Texto>
          <Texto variante="sobretitulo">Cant. · Importe</Texto>
        </div>
        {pedido.articulos.map((articulo) => (
          <Fila key={articulo.idDetalle} etiqueta={articulo.nombre}
            valor={`${piezas(articulo.cantidad, true)} · ${formatearMonto(articulo.subtotal)}`} />
        ))}
        <hr />
        <Fila etiqueta="Subtotal a precio Base" valor={formatearMonto(pedido.subtotalPrecioBase)} />
        {pedido.ahorroPorEsquema > 0 && (
          <Fila etiqueta={`Ahorro ${pedido.etiquetaEsquema}`} valor={formatearDescuento(pedido.ahorroPorEsquema)} />
        )}
        {pedido.descuentosCodigo.map((descuento) => (
          <Fila key={descuento.codigo} etiqueta={`Código ${descuento.codigo}`} valor={formatearDescuento(descuento.monto)} />
        ))}
        <Fila etiqueta="Método de pago" valor={pedido.tipoPago === TipoPago.EFECTIVO ? 'Efectivo' : 'Transferencia'} />
        {pedido.estado && <Fila etiqueta="Estado" valor={pedido.estado.etiqueta} />}
        <div className={estilos.filaTotal}>
          <Texto variante="h3">Total</Texto>
          <Texto variante="precio-l">{formatearTotal(pedido.total)}</Texto>
        </div>
        <Texto variante="etiqueta-fuerte" como="p" className={estilos.ticketGracias}>
          ¡Gracias por tu compra!
        </Texto>
      </div>
    </aside>
  )
}

function Fila({ etiqueta, valor, fuerte = false }: { readonly etiqueta: string; readonly valor: string; readonly fuerte?: boolean }) {
  return (
    <div className={estilos.fila}>
      <span className="fly-cuerpo-s">{etiqueta}</span>
      <span className={fuerte ? 'fly-etiqueta-fuerte' : 'fly-cuerpo-s'}>{valor}</span>
    </div>
  )
}
