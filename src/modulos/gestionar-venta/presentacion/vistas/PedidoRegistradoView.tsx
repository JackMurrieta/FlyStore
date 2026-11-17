/**
 * PedidoRegistradoView «ViewComponent» · B7 Pedido registrado · Folio.
 * Recibe el ticket en PDF (básico 69) y lo ofrece para descargar.
 */

import { Navigate, useParams } from 'react-router-dom'
import { Aviso, Boton, Icono, Texto } from '@compartido/ui'
import { EstadoVenta } from '../../dominio/EstadoVenta'
import { usePedidoRegistrado } from '../hooks/usePedidoRegistrado'
import { useModelosVenta } from '../ModelosVentaContext'
import { PaginaVenta } from '../componentes/PaginaVenta'
import { PasosCompra } from '../componentes/PasosCompra'
import { InsigniaEstado } from '../componentes/Elementos'
import { TicketPedido } from '../componentes/TicketPedido'
import { formatearFechaLimite } from '../formato'
import estilos from '../componentes/venta.module.css'

/** Texto y pasos siguientes según el estado con que quedó el pedido. */
function mensajes(estado: string, fechaLimite: string | null): { texto: string; pasos: readonly string[] } {
  const plazo = fechaLimite ? ` antes del ${fechaLimite.charAt(0).toLowerCase()}${fechaLimite.slice(1)}` : ''
  if (estado === EstadoVenta.PENDIENTE_COMPROBANTE) {
    return {
      texto: `Recibimos tu pedido. Transfiere y sube tu comprobante${plazo}; si no, tu pedido se elimina.`,
      pasos: ['Transfiere el total con tu folio como concepto.', 'Sube tu comprobante desde «Mis pedidos».', 'Validamos tu pago y coordinamos la entrega por WhatsApp.'],
    }
  }
  if (estado === EstadoVenta.PENDIENTE_PAGO || estado === 'APARTADO_PENDIENTE_PAGO') {
    return {
      texto: `Recibimos tu pedido. Paga en efectivo${plazo}; si no, tu pedido se elimina.`,
      pasos: ['Te escribimos por WhatsApp para acordar la entrega.', 'Pagas en efectivo al recoger o al recibir tu pedido.', 'Registramos tu pago y te entregamos tu pedido.'],
    }
  }
  return {
    texto: 'Recibimos tu pedido y tu comprobante. Validaremos el depósito y te avisaremos por WhatsApp cuando cambie el estado.',
    pasos: ['Validamos tu transferencia (monto, fecha y concepto).', 'Preparamos tu pedido y te avisamos.', 'Coordinamos la entrega o el envío por WhatsApp.'],
  }
}

export default function PedidoRegistradoView() {
  const { folio = '' } = useParams()
  const { rutaBase } = useModelosVenta()
  const registro = usePedidoRegistrado(folio)
  const pedido = registro.pedidoRegistrado

  // Sin pedido en memoria (recarga directa): se regresa al carrito.
  if (!pedido) return <Navigate to={rutaBase} replace />

  const fechaLimite = pedido.fechaLimitePago ? formatearFechaLimite(pedido.fechaLimitePago) : null
  const { texto, pasos } = mensajes(pedido.estado?.valor ?? '', fechaLimite)

  return (
    <PaginaVenta conPie>
      <div className={estilos.registrado}>
        <div>
          <PasosCompra actual={5} />
          <span className={estilos.checkGrande} aria-hidden="true"><Icono nombre="check" tamano={24} /></span>
          <Texto variante="sobretitulo" tono="secundario">Pedido registrado</Texto>
          <Texto variante="display" como="h1">Folio {pedido.folio ?? folio}</Texto>
          {pedido.estado && (
            <div className={estilos.estadoInicial}>
              <Texto variante="cuerpo-s" tono="secundario">Estado:</Texto>
              <InsigniaEstado estado={pedido.estado} />
            </div>
          )}
          <Texto variante="cuerpo" como="p" tono="secundario">{texto}</Texto>
          <section className={`${estilos.tarjetaResumen} ${estilos.queSigue}`} aria-labelledby="titulo-que-sigue">
            <Texto variante="h3" como="h2" id="titulo-que-sigue">Qué sigue</Texto>
            <ol className={estilos.siguientes}>
              {pasos.map((paso) => <li key={paso}><Texto variante="cuerpo">{paso}</Texto></li>)}
            </ol>
          </section>
          {registro.errorTicket && <Aviso tono="error" titulo="No pudimos generar tu ticket">{registro.errorTicket}</Aviso>}
          <div className={estilos.acciones}>
            {pedido.enlaceWhatsapp && (
              <a href={pedido.enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className={estilos.enlaceWhatsapp}>
                <Icono nombre="whatsapp" tamano={18} /> Enviar resumen por WhatsApp
              </a>
            )}
            {registro.comprobante ? (
              <Boton variante="fantasma" icono={<Icono nombre="file" tamano={18} />}
                onClick={() => window.print()}>
                Ver / Imprimir ticket
              </Boton>
            ) : (
              <Boton variante="fantasma" icono={<Icono nombre={registro.errorTicket ? 'refresh' : 'file'} tamano={18} />}
                cargando={registro.generandoTicket} onClick={() => void registro.reintentarTicket()}>
                {registro.errorTicket ? 'Reintentar ticket' : 'Generando ticket…'}
              </Boton>
            )}
          </div>
        </div>
        <TicketPedido pedido={pedido} cliente={registro.cliente} />
      </div>
    </PaginaVenta>
  )
}
