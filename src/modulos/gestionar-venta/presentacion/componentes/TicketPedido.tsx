import { useId, type Ref } from 'react'
import { Icono, type NombreIcono } from '@compartido/ui'
import type { InformacionPedidoTs } from '../../dominio/InformacionPedidoTs'
import { EstadoVenta } from '../../dominio/EstadoVenta'
import { TipoPago } from '../../dominio/TipoPago'
import { formatearDescuento, formatearFechaTicket, formatearMonto, formatearTelefono } from '../formato'
import estilos from './ticket.module.css'

interface Props {
  readonly pedido: InformacionPedidoTs
  readonly cliente: { readonly nombre: string; readonly telefono: string } | null
  /** Nodo que se copia al descargar el recibo como PNG (useDescargarRecibo). */
  readonly ref?: Ref<HTMLElement>
}

/** Ícono de la pastilla del estado y mensaje del pie según el estado del pedido. */
const SEGUN_ESTADO: Record<string, { readonly icono: NombreIcono; readonly titulo: string; readonly texto: string }> = {
  [EstadoVenta.PENDIENTE_COMPROBANTE]: { icono: 'clock', titulo: 'Pedido recibido', texto: 'Transfiere y sube tu comprobante para confirmar tu pedido.' },
  [EstadoVenta.APARTADO_PENDIENTE_PAGO]: { icono: 'clock', titulo: 'Pedido apartado', texto: 'Paga en efectivo al recoger o al recibir tu pedido.' },
  [EstadoVenta.PAGO_EN_REVISION]: { icono: 'clock', titulo: 'Pedido recibido', texto: 'Te avisaremos cuando se confirme tu pago.' },
  [EstadoVenta.PAGADO]: { icono: 'check-circle', titulo: 'Pago confirmado', texto: 'Te avisaremos por WhatsApp para coordinar la entrega.' },
  [EstadoVenta.PREPARACION]: { icono: 'package', titulo: 'Pago confirmado', texto: 'Estamos preparando tu pedido.' },
  [EstadoVenta.ENVIADO]: { icono: 'truck', titulo: 'Pedido enviado', texto: 'Tu pedido va en camino.' },
  [EstadoVenta.ENTREGADO]: { icono: 'check-circle', titulo: 'Pedido entregado', texto: '¡Gracias por tu compra!' },
  [EstadoVenta.CANCELADO]: { icono: 'ban', titulo: 'Pedido cancelado', texto: 'Este pedido se canceló antes del pago.' },
  [EstadoVenta.CANCELADO_VENCIMIENTO]: { icono: 'ban', titulo: 'Pedido cancelado', texto: 'El plazo para pagar terminó.' },
}
const POR_DEFECTO = { icono: 'clock', titulo: 'Pedido recibido', texto: '¡Gracias por tu compra!' } as const

/** «Descuento por mayoreo»; con productos en esquemas distintos, «Descuento por volumen». */
const etiquetaDescuento = (etiquetaEsquema: string) =>
  `Descuento por ${etiquetaEsquema === 'Mixto' ? 'volumen' : etiquetaEsquema.toLowerCase()}`

/**
 * Recibo «Resumen de pedido» (B7 y «Mis pedidos › Ver recibo»). Se arma con los datos del pedido
 * registrado y se descarga como imagen PNG. Encabezado negro con logo y folio; cliente y fecha;
 * productos con foto, cantidad e importe; desglose; total; método de pago con su estado y un
 * mensaje según el estado.
 */
export function TicketPedido({ pedido, cliente, ref }: Props) {
  const segunEstado = (pedido.estado && SEGUN_ESTADO[pedido.estado.valor]) || POR_DEFECTO
  const telefono = cliente?.telefono ? formatearTelefono(cliente.telefono) : ''
  const tituloId = useId()

  return (
    <article ref={ref} className={estilos.recibo} aria-labelledby={tituloId}>
      <header className={estilos.encabezado}>
        <div className={estilos.marca}>
          <img src="/flyBlanco.svg" alt="FLY" className={estilos.logo} />
          <h2 id={tituloId} className={estilos.etiquetaClara}>Resumen de pedido</h2>
        </div>
        <div className={estilos.folio}>
          <span className={estilos.etiquetaClara}>Folio</span>
          <strong className={estilos.mono}>{pedido.folio ?? '—'}</strong>
        </div>
      </header>

      <div className={estilos.cuerpo}>
        <div className={estilos.datos}>
          <div>
            <span className={estilos.etiqueta}>Cliente</span>
            <strong className={estilos.nombreCliente}>{cliente?.nombre ?? '—'}</strong>
            {telefono && <span className={estilos.secundario}>{telefono}</span>}
          </div>
          {pedido.fechaHoraPedido && (
            <div className={estilos.alDerecha}>
              <span className={estilos.etiqueta}>Fecha del pedido</span>
              <strong className={estilos.fecha}>{formatearFechaTicket(pedido.fechaHoraPedido)}</strong>
            </div>
          )}
        </div>

        <table className={estilos.productos}>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col" className={estilos.centro}>Cant.</th>
              <th scope="col" className={estilos.alDerecha}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {pedido.articulos.map((articulo) => (
              <tr key={articulo.idDetalle} className={estilos.articulo}>
                <td>
                  <div className={estilos.producto}>
                    <span className={estilos.foto}>
                      {articulo.imagenUrl
                        ? <img src={articulo.imagenUrl} alt="" />
                        : <Icono nombre="package" tamano={22} />}
                    </span>
                    <span className={estilos.nombreProducto}>{articulo.nombre}</span>
                  </div>
                </td>
                <td className={estilos.centro}>{articulo.cantidad}</td>
                <td className={`${estilos.alDerecha} ${estilos.importe}`}>{formatearMonto(articulo.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className={estilos.desglose}>
          <div><dt>Subtotal a precio base</dt><dd>{formatearMonto(pedido.subtotalPrecioBase)}</dd></div>
          {pedido.ahorroPorEsquema > 0 && (
            <div><dt>{etiquetaDescuento(pedido.etiquetaEsquema)}</dt><dd>{formatearDescuento(pedido.ahorroPorEsquema)}</dd></div>
          )}
          {pedido.descuentosCodigo.map((descuento, indice) => (
            <div key={`${descuento.codigo}-${indice}`}><dt>Código {descuento.codigo}</dt><dd>{formatearDescuento(descuento.monto)}</dd></div>
          ))}
          {pedido.costoEnvio > 0 && <div><dt>Envío</dt><dd>{formatearMonto(pedido.costoEnvio)}</dd></div>}
        </dl>

        <div className={estilos.total}>
          <span className={estilos.etiquetaTotal}>Total</span>
          <div className={estilos.alDerecha}>
            <strong className={`${estilos.mono} ${estilos.cifraTotal}`}>{formatearMonto(pedido.total)}</strong>
            <span className={estilos.moneda}>MXN</span>
          </div>
        </div>

        {(pedido.tipoPago || pedido.estado) && (
          <div className={estilos.pago}>
            {pedido.tipoPago && (
              <div>
                <span className={estilos.etiqueta}>Método de pago</span>
                <strong className={estilos.metodo}>{pedido.tipoPago === TipoPago.EFECTIVO ? 'Efectivo' : 'Transferencia'}</strong>
              </div>
            )}
            {pedido.estado && (
              <span className={estilos.pastilla}>
                <Icono nombre={segunEstado.icono} tamano={18} /> {pedido.estado.etiqueta}
              </span>
            )}
          </div>
        )}

        <footer className={estilos.pie}>
          <strong>{segunEstado.titulo}</strong>
          <span>{segunEstado.texto}</span>
        </footer>
      </div>
    </article>
  )
}
