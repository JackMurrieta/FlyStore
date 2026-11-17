/**
 * Diálogo «Rechazar comprobante» (Front 3 del diseño)
 * El motivo es obligatorio; el mensaje para el cliente es opcional.
 * DetallePedidoVista lo monta al abrirlo, así cada apertura empieza limpia.
 */

import { useId, useState } from 'react'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { Dialogo } from '@compartido/ui/Dialogo'
import { Texto } from '@compartido/ui/Texto'
import { Radio } from '@compartido/ui/Radio'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { DetallePedidoAdminTs } from '../../dominio/DetallePedidoAdminTs'
import estilos from './DialogosPedido.module.css'

export interface DialogoRechazarComprobanteProps {
  readonly detalle: DetallePedidoAdminTs
  /** Motivos de rechazo que se ofrecen */
  readonly motivos: readonly string[]
  readonly cargando: boolean
  readonly error: ErrorTs | null
  readonly validarMotivo: (motivo: string) => boolean
  /** useDetallePedido.rechazarComprobante: true si el backend registró el rechazo */
  readonly rechazarComprobante: (motivo: string, mensaje: string | null) => Promise<boolean>
  readonly alCerrar: () => void
}

export function DialogoRechazarComprobante({
  detalle,
  motivos,
  cargando,
  error,
  validarMotivo,
  rechazarComprobante,
  alCerrar,
}: DialogoRechazarComprobanteProps) {
  const [motivo, setMotivo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [intentado, setIntentado] = useState(false)
  // Solo mostramos el error de una petición hecha desde este diálogo
  const [enviado, setEnviado] = useState(false)
  const errorDeAccion = enviado ? error : null
  const grupoId = useId()
  const mensajeId = useId()
  const errorMotivoId = useId()

  // El error aparece tras el primer intento y se quita en cuanto se elige un motivo
  const motivoFaltante = intentado && !validarMotivo(motivo)

  const elegirMotivo = (valor: string) => {
    setMotivo(valor)
  }

  const confirmarRechazo = async () => {
    setIntentado(true)
    if (validarMotivo(motivo)) setEnviado(true)
    const exitoso = await rechazarComprobante(motivo, mensaje)
    if (exitoso) alCerrar()
  }

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      titulo="Rechazar comprobante"
      icono="x"
      alineacion="izquierda"
      tonoIcono="peligro"
    >
      <div className={estilos.contenido}>
        <Texto variante="cuerpo" tono="secundario" como="p">
          Indica el motivo. El pedido regresará a «Pendiente de comprobante» con un nuevo plazo de 42 horas.
        </Texto>

        <div className={estilos.campoConError}>
          <div
            className={`${estilos.grupo} ${motivoFaltante ? estilos.grupoError : ''}`}
            role="radiogroup"
            aria-label="Motivo del rechazo"
            aria-invalid={motivoFaltante}
            aria-describedby={motivoFaltante ? errorMotivoId : undefined}
          >
            {motivos.map((opcion) => (
              <Radio
                key={opcion}
                name={grupoId}
                value={opcion}
                etiqueta={opcion}
                checked={motivo === opcion}
                onChange={() => elegirMotivo(opcion)}
                disabled={cargando}
              />
            ))}
          </div>
          {motivoFaltante && (
            <span id={errorMotivoId} className={estilos.errorCampo} role="alert">
              <Icono nombre="alert-circle" tamano={14} />
              Indica el motivo del rechazo.
            </span>
          )}
        </div>

        <div className={estilos.area}>
          <label htmlFor={mensajeId} className={estilos.areaEtiqueta}>
            Mensaje para el cliente (opcional)
          </label>
          <textarea
            id={mensajeId}
            className={estilos.areaEntrada}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={2}
            maxLength={300}
            disabled={cargando}
          />
        </div>

        <Aviso tono="info">
          Conservaremos el comprobante rechazado en el historial y avisaremos a {detalle.cliente.nombre} con el
          motivo y la nueva fecha límite.
        </Aviso>

        {errorDeAccion && <Aviso tono="error">{errorDeAccion.mensaje}</Aviso>}

        <div className={estilos.acciones}>
          <Boton variante="secundario" onClick={alCerrar} disabled={cargando}>
            Cancelar
          </Boton>
          <Boton
            variante="peligroSolido"
            icono={<Icono nombre="x" tamano={18} />}
            onClick={confirmarRechazo}
            cargando={cargando}
          >
            {errorDeAccion ? 'Reintentar' : 'Rechazar comprobante'}
          </Boton>
        </div>
      </div>
    </Dialogo>
  )
}
