/**
 * PedidoRegistradoView «ViewComponent» · B7 Pedido registrado · Folio.
 * Muestra el pedido registrado y su ticket (TicketPedido, armado con los datos del backend).
 * «Ver / Imprimir ticket» abre la impresión del navegador: solo se imprime el ticket y el
 * cliente puede imprimirlo o guardarlo como PDF. Si la página se abre por URL o se recarga,
 * el pedido se pide al backend por su folio.
 */

import { useNavigate, useParams } from 'react-router-dom'
import { Aviso, Boton, Icono, Texto } from '@compartido/ui'
import { EstadoVenta } from '../../dominio/EstadoVenta'
import { usePedidoRegistrado } from '../hooks/usePedidoRegistrado'
import { useModelosVenta } from '../ModelosVentaContext'
import { EstadoCarga, PaginaVenta } from '../componentes/PaginaVenta'
import { PasosCompra } from '../componentes/PasosCompra'
import { InsigniaEstado } from '../componentes/Elementos'
import { TicketPedido } from '../componentes/TicketPedido'
import { formatearFechaLimite } from '../formato'
import estilos from '../componentes/venta.module.css'

/** Texto y pasos siguientes según el estado del pedido. */
function mensajes(estado: string, fechaLimite: string | null): { texto: string; pasos: readonly string[] } {
  const plazo = fechaLimite ? ` antes del ${fechaLimite.charAt(0).toLowerCase()}${fechaLimite.slice(1)}` : ''
  switch (estado) {
    case EstadoVenta.PENDIENTE_COMPROBANTE:
      return {
        texto: `Recibimos tu pedido. Transfiere y sube tu comprobante${plazo}; si no, tu pedido se cancela.`,
        pasos: ['Transfiere el total con tu folio como concepto.', 'Sube tu comprobante desde «Mis pedidos».', 'Validamos tu pago y coordinamos la entrega por WhatsApp.'],
      }
    case EstadoVenta.APARTADO_PENDIENTE_PAGO:
      return {
        texto: `Recibimos tu pedido. Paga en efectivo${plazo}; si no, tu pedido se cancela.`,
        pasos: ['Te escribimos por WhatsApp para acordar la entrega.', 'Pagas en efectivo al recoger o al recibir tu pedido.', 'Registramos tu pago y te entregamos tu pedido.'],
      }
    case EstadoVenta.PAGO_EN_REVISION:
      return {
        texto: 'Recibimos tu pedido y tu comprobante. Validaremos el depósito y te avisaremos por WhatsApp cuando cambie el estado.',
        pasos: ['Validamos tu transferencia (monto, fecha y concepto).', 'Preparamos tu pedido y te avisamos.', 'Coordinamos la entrega o el envío por WhatsApp.'],
      }
    case EstadoVenta.CANCELADO_VENCIMIENTO:
      return { texto: 'Este pedido se canceló porque el plazo para pagar terminó. Para comprar, haz un nuevo pedido.', pasos: [] }
    case EstadoVenta.CANCELADO:
      return { texto: 'Cancelaste este pedido. Si quieres los productos, haz un nuevo pedido.', pasos: [] }
    default:
      return { texto: 'Tu pago está confirmado. Te avisaremos por WhatsApp cada vez que cambie el estado de tu pedido.', pasos: [] }
  }
}

export default function PedidoRegistradoView() {
  const { folio = '' } = useParams()
  const { rutaBase, rutaMisPedidos } = useModelosVenta()
  const navegar = useNavigate()
  const registro = usePedidoRegistrado(folio)
  const pedido = registro.pedidoRegistrado

  if (!pedido) {
    return (
      <PaginaVenta conPie>
        {registro.error ? (
          <div className={estilos.estadoError}>
            <Aviso tono="error" titulo="No pudimos cargar tu pedido">{registro.error}</Aviso>
            <div className={estilos.acciones}>
              <Boton variante="primario" icono={<Icono nombre="refresh" tamano={18} />} onClick={() => void registro.reintentar()}>
                Reintentar
              </Boton>
              <Boton variante="secundario" icono={<Icono nombre="package" tamano={18} />} onClick={() => navegar(rutaMisPedidos)}>
                Ver mis pedidos
              </Boton>
              <Boton variante="fantasma" onClick={() => navegar(rutaBase)}>Ir al carrito</Boton>
            </div>
          </div>
        ) : (
          <EstadoCarga texto="Cargando tu pedido…" diseno="ticket" />
        )}
      </PaginaVenta>
    )
  }

  const estado = pedido.estado?.valor ?? ''
  const fechaLimite = pedido.fechaLimitePago ? formatearFechaLimite(pedido.fechaLimitePago) : null
  const { texto, pasos } = mensajes(estado, fechaLimite)
  const cancelado = estado === EstadoVenta.CANCELADO || estado === EstadoVenta.CANCELADO_VENCIMIENTO
  const folioPedido = pedido.folio ?? folio

  return (
    <PaginaVenta conPie>
      <div className={estilos.registrado}>
        <div>
          <PasosCompra actual={5} />
          {!cancelado && <span className={estilos.checkGrande} aria-hidden="true"><Icono nombre="check" tamano={24} /></span>}
          <Texto variante="sobretitulo" tono="secundario">Pedido registrado</Texto>
          <Texto variante="display" como="h1">Folio {folioPedido}</Texto>
          {pedido.estado && (
            <div className={estilos.estadoInicial}>
              <Texto variante="cuerpo-s" tono="secundario">Estado:</Texto>
              <InsigniaEstado estado={pedido.estado} />
            </div>
          )}
          <Texto variante="cuerpo" como="p" tono="secundario">{texto}</Texto>
          {pasos.length > 0 && (
            <section className={`${estilos.tarjetaResumen} ${estilos.queSigue}`} aria-labelledby="titulo-que-sigue">
              <Texto variante="h3" como="h2" id="titulo-que-sigue">Qué sigue</Texto>
              <ol className={estilos.siguientes}>
                {pasos.map((paso) => <li key={paso}><Texto variante="cuerpo">{paso}</Texto></li>)}
              </ol>
            </section>
          )}
          <div className={estilos.acciones}>
            {estado === EstadoVenta.PENDIENTE_COMPROBANTE && (
              <Boton variante="primario" icono={<Icono nombre="upload" tamano={18} />}
                onClick={() => navegar(`${rutaMisPedidos}?folio=${encodeURIComponent(folioPedido)}`)}>
                Subir comprobante en Mis pedidos
              </Boton>
            )}
            {pedido.enlaceWhatsapp && (
              <a href={pedido.enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className={estilos.enlaceWhatsapp}>
                <Icono nombre="whatsapp" tamano={18} /> Enviar resumen por WhatsApp
              </a>
            )}
            <Boton variante="fantasma" icono={<Icono nombre="file" tamano={18} />} onClick={registro.imprimirTicket}>
              Ver / Imprimir ticket
            </Boton>
          </div>
        </div>
        <TicketPedido pedido={pedido} cliente={registro.cliente} />
      </div>
    </PaginaVenta>
  )
}
