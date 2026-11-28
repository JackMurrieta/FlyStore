/**
 * «Ver recibo» de Mis pedidos (S6): muestra el recibo del pedido elegido (TicketPedido, el mismo
 * de B7) y permite descargarlo como imagen PNG en cualquier momento, no solo al terminar la compra.
 */

import { Aviso, Boton, Dialogo, Icono } from '@compartido/ui'
import { useSesion } from '@compartido/sesion'
import type { InformacionPedidoTs } from '../../dominio/InformacionPedidoTs'
import { useDescargarRecibo } from '../hooks/useDescargarRecibo'
import { TicketPedido } from './TicketPedido'
import estilos from './venta.module.css'

interface Props {
  readonly pedido: InformacionPedidoTs
  readonly alCerrar: () => void
}

export function DialogoRecibo({ pedido, alCerrar }: Props) {
  const { referencia: reciboRef, descargar: descargarRecibo, descargando, error: errorRecibo } = useDescargarRecibo()
  const { usuario } = useSesion()
  // Los datos de entrega del pedido mandan; si no vienen, el cliente con sesión.
  const cliente = pedido.cliente ?? (usuario ? { nombre: usuario.nombre, telefono: usuario.telefono ?? '' } : null)

  return (
    <Dialogo abierto alCerrar={alCerrar} titulo="Recibo del pedido">
      <div className={estilos.dialogoRecibo}>
        <TicketPedido ref={reciboRef} pedido={pedido} cliente={cliente} />
        {errorRecibo && <Aviso tono="error" titulo="Descarga fallida">{errorRecibo}</Aviso>}
        <div className={estilos.acciones}>
          <Boton variante="primario" icono={<Icono nombre="download" tamano={18} />} cargando={descargando}
            onClick={() => void descargarRecibo(pedido.folio)}>
            Descargar recibo
          </Boton>
          <Boton variante="secundario" onClick={alCerrar}>Cerrar</Boton>
        </div>
      </div>
    </Dialogo>
  )
}
