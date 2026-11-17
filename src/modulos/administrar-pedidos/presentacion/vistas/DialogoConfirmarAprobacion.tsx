/**
 * Diálogo «¿Aprobar el pago?» (Front 3 del diseño)
 * Confirma el efecto en inventario y el aviso al cliente antes de aprobar.
 * DetallePedidoVista lo monta al abrirlo, así cada apertura empieza limpia.
 */

import { useState } from 'react'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { Dialogo } from '@compartido/ui/Dialogo'
import { Texto } from '@compartido/ui/Texto'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { DetallePedidoAdminTs } from '../../dominio/DetallePedidoAdminTs'
import { ETIQUETA_METODO_PAGO } from '../../dominio/MetodoPagoTs'
import { contarPiezas } from '../../dominio/ReglasPedido'
import { formatearMoneda } from '../formato'
import estilos from './DialogosPedido.module.css'

export interface DialogoConfirmarAprobacionProps {
  readonly detalle: DetallePedidoAdminTs
  readonly cargando: boolean
  readonly error: ErrorTs | null
  /** useDetallePedido.aprobarPago: true si el backend aprobó el pago */
  readonly aprobarPago: () => Promise<boolean>
  readonly alCerrar: () => void
}

export function DialogoConfirmarAprobacion({
  detalle,
  cargando,
  error,
  aprobarPago,
  alCerrar,
}: DialogoConfirmarAprobacionProps) {
  // Solo mostramos el error de una petición hecha desde este diálogo
  const [enviado, setEnviado] = useState(false)
  const errorDeAccion = enviado ? error : null

  const piezas = contarPiezas(detalle.lineas)
  const montoComprobante = detalle.comprobante?.monto ?? null

  const confirmar = async () => {
    setEnviado(true)
    const exitoso = await aprobarPago()
    if (exitoso) alCerrar()
  }

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      titulo={`¿Aprobar el pago de ${detalle.folio}?`}
      icono="check-circle"
      alineacion="izquierda"
    >
      <div className={estilos.contenido}>
        <Texto variante="cuerpo" tono="secundario" como="p">
          El pedido pasará a «Pagado», se {piezas === 1 ? 'descontará' : 'descontarán'} de forma definitiva{' '}
          {piezas === 1 ? 'la pieza reservada' : `las ${piezas} piezas reservadas`} y avisaremos a{' '}
          {detalle.cliente.nombre} por WhatsApp.
        </Texto>

        <div className={estilos.resumen}>
          <div className={estilos.dato}>
            <Texto variante="cuerpo-s" tono="secundario">
              Total del pedido
            </Texto>
            <Texto variante="etiqueta">{formatearMoneda(detalle.total)}</Texto>
          </div>
          <div className={estilos.dato}>
            <Texto variante="cuerpo-s" tono="secundario">
              Monto del comprobante
            </Texto>
            <Texto variante="etiqueta">{montoComprobante !== null ? formatearMoneda(montoComprobante) : '—'}</Texto>
          </div>
          <div className={estilos.dato}>
            <Texto variante="cuerpo-s" tono="secundario">
              Método
            </Texto>
            <Texto variante="etiqueta">{ETIQUETA_METODO_PAGO[detalle.metodoPago]}</Texto>
          </div>
        </div>

        {errorDeAccion && <Aviso tono="error">{errorDeAccion.mensaje}</Aviso>}

        <div className={estilos.acciones}>
          <Boton variante="secundario" onClick={alCerrar} disabled={cargando}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            icono={<Icono nombre="check" tamano={18} />}
            onClick={confirmar}
            cargando={cargando}
          >
            {errorDeAccion ? 'Reintentar' : 'Aprobar pago'}
          </Boton>
        </div>
      </div>
    </Dialogo>
  )
}
