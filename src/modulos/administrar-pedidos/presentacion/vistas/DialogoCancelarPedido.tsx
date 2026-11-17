/**
 * Diálogo «Cancelar pedido» (Front 4 del diseño)
 * Solo se abre si el pedido es cancelable; advierte que se liberan las piezas
 * (y que hay que devolver el dinero si ya estaba pagado) y exige el motivo.
 * DetallePedidoVista lo monta al abrirlo, así cada apertura empieza limpia.
 */

import { useState } from 'react'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { Dialogo } from '@compartido/ui/Dialogo'
import { Texto } from '@compartido/ui/Texto'
import { Campo } from '@compartido/ui/Campo'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { DetallePedidoAdminTs } from '../../dominio/DetallePedidoAdminTs'
import { ETIQUETA_ESTADO } from '../../dominio/EstadoPedidoTs'
import { requiereDevolucion } from '../../dominio/ReglasPedido'
import estilos from './DialogosPedido.module.css'

export interface DialogoCancelarPedidoProps {
  readonly detalle: DetallePedidoAdminTs
  /** Efecto de la cancelación: piezas que regresan al inventario y, si aplica, la devolución */
  readonly advertencia: string
  readonly cargando: boolean
  readonly error: ErrorTs | null
  readonly validarMotivo: (motivo: string) => boolean
  /** useDetallePedido.cancelarPedido: true si el backend canceló el pedido */
  readonly cancelarPedido: (motivo: string) => Promise<boolean>
  readonly alCerrar: () => void
}

export function DialogoCancelarPedido({
  detalle,
  advertencia,
  cargando,
  error,
  validarMotivo,
  cancelarPedido,
  alCerrar,
}: DialogoCancelarPedidoProps) {
  const [motivo, setMotivo] = useState('')
  const [intentado, setIntentado] = useState(false)
  // Solo mostramos el error de una petición hecha desde este diálogo
  const [enviado, setEnviado] = useState(false)
  const errorDeAccion = enviado ? error : null

  // El error aparece tras el primer intento y se quita en cuanto se escribe el motivo
  const motivoFaltante = intentado && !validarMotivo(motivo)

  const capturarMotivo = (valor: string) => {
    setMotivo(valor)
  }

  const confirmar = async () => {
    setIntentado(true)
    if (validarMotivo(motivo)) setEnviado(true)
    const exitoso = await cancelarPedido(motivo)
    if (exitoso) alCerrar()
  }

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      titulo={`Cancelar pedido ${detalle.folio}`}
      icono="ban"
      alineacion="izquierda"
      tonoIcono="peligro"
    >
      <div className={estilos.contenido}>
        <Texto variante="cuerpo" tono="secundario" como="p">
          Esta acción no se puede deshacer. El pedido quedará como «Cancelado» en el historial.
        </Texto>

        <Campo
          etiqueta="Motivo de la cancelación *"
          value={motivo}
          onChange={(e) => capturarMotivo(e.target.value)}
          error={motivoFaltante ? 'Indica el motivo de la cancelación.' : undefined}
          maxLength={300}
          required
          disabled={cargando}
        />

        <Aviso
          tono="advertencia"
          titulo={
            requiereDevolucion(detalle.estado) ? `El pedido ya estaba «${ETIQUETA_ESTADO[detalle.estado]}»` : undefined
          }
        >
          {advertencia}
        </Aviso>

        {errorDeAccion && <Aviso tono="error">{errorDeAccion.mensaje}</Aviso>}

        <div className={estilos.acciones}>
          <Boton variante="secundario" onClick={alCerrar} disabled={cargando}>
            Volver
          </Boton>
          <Boton
            variante="peligroSolido"
            icono={<Icono nombre="ban" tamano={18} />}
            onClick={confirmar}
            cargando={cargando}
          >
            {errorDeAccion ? 'Reintentar' : 'Cancelar pedido'}
          </Boton>
        </div>
      </div>
    </Dialogo>
  )
}
