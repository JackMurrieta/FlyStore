/**
 * Diálogo «Actualizar estado del pedido» (Front 4 del diseño)
 * Muestra el recorrido de su forma de pago (efectivo: pagado → entregado; transferencia:
 * en preparación → enviado → entregado), propone el siguiente estado permitido y, para
 * «Enviado», pide paquetería y guía o entrega local. El modelo valida la transición antes de
 * llamar al backend.
 * DetallePedidoVista lo monta al abrirlo, así cada apertura empieza limpia.
 */

import { useId, useState } from 'react'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { Dialogo } from '@compartido/ui/Dialogo'
import { Texto } from '@compartido/ui/Texto'
import { Campo } from '@compartido/ui/Campo'
import { Radio } from '@compartido/ui/Radio'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { DetallePedidoAdminTs } from '../../dominio/DetallePedidoAdminTs'
import { ETIQUETA_ESTADO, type EstadoPedidoTs } from '../../dominio/EstadoPedidoTs'
import { ENVIO_VACIO, type DatosEnvioTs } from '../../dominio/DatosEnvioTs'
import type { ResultadoValidacionTs } from '../../dominio/ResultadoValidacionTs'
import { requiereDatosEnvio, secuenciaEstados } from '../../dominio/ReglasPedido'
import estilos from './DialogosPedido.module.css'

/** Sugerencias para el campo «Paquetería» (se puede escribir cualquier otra) */
const PAQUETERIAS_SUGERIDAS = ['Estafeta', 'DHL', 'FedEx', 'Paquetexpress', 'Redpack', 'Correos de México']

export interface DialogoActualizarEstadoProps {
  readonly detalle: DetallePedidoAdminTs
  readonly estadoActual: EstadoPedidoTs
  /** Siguiente estado permitido: es el que viene elegido al abrir */
  readonly siguiente: EstadoPedidoTs
  readonly cargando: boolean
  readonly error: ErrorTs | null
  readonly validarTransicion: (nuevo: EstadoPedidoTs, envio: DatosEnvioTs | null) => ResultadoValidacionTs | null
  /** useDetallePedido.actualizarEstado: true si el backend aplicó el cambio */
  readonly actualizarEstado: (nuevo: EstadoPedidoTs, envio: DatosEnvioTs | null) => Promise<boolean>
  readonly alCerrar: () => void
}

export function DialogoActualizarEstado({
  detalle,
  estadoActual,
  siguiente,
  cargando,
  error,
  validarTransicion,
  actualizarEstado,
  alCerrar,
}: DialogoActualizarEstadoProps) {
  const [estado, setEstado] = useState<EstadoPedidoTs>(siguiente)
  const [envio, setEnvio] = useState<DatosEnvioTs>(ENVIO_VACIO)
  const [intentado, setIntentado] = useState(false)
  // Solo mostramos el error de una petición hecha desde este diálogo
  const [enviado, setEnviado] = useState(false)
  const errorDeAccion = enviado ? error : null
  const entregaId = useId()
  const paqueteriasId = useId()

  const pideEnvio = requiereDatosEnvio(estado)
  const envioCapturado = pideEnvio ? envio : null
  const pasos = secuenciaEstados(detalle.metodoPago, estadoActual)
  const indiceActual = pasos.indexOf(estadoActual)
  const cliente = detalle.cliente.nombre

  // Tras el primer intento la validación se recalcula mientras el administrador corrige
  const validacion = intentado ? validarTransicion(estado, envioCapturado) : null
  const errores = validacion && !validacion.valido ? validacion.errores : []
  const faltaPaqueteria = errores.length > 0 && pideEnvio && !envio.entregaLocal && envio.paqueteria.trim() === ''
  const faltaGuia = errores.length > 0 && pideEnvio && !envio.entregaLocal && envio.guia.trim() === ''

  const elegirEstado = (nuevo: EstadoPedidoTs) => {
    setEstado(nuevo)
    // Otro estado es otro intento: no se arrastran los errores del anterior
    setIntentado(false)
  }

  const capturarEnvio = (cambios: Partial<DatosEnvioTs>) => {
    setEnvio((anterior) => ({ ...anterior, ...cambios }))
  }

  const confirmar = async () => {
    setIntentado(true)
    if (validarTransicion(estado, envioCapturado)?.valido) setEnviado(true)
    const exitoso = await actualizarEstado(estado, envioCapturado)
    if (exitoso) alCerrar()
  }

  const avisoCliente = !pideEnvio
    ? `Avisaremos a ${cliente} por WhatsApp que su pedido quedó como «${ETIQUETA_ESTADO[estado]}».`
    : envio.entregaLocal
      ? `Avisaremos a ${cliente} por WhatsApp que su pedido va en camino por entrega local.`
      : `Avisaremos a ${cliente} por WhatsApp con la paquetería y el número de guía.`

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      titulo="Actualizar estado del pedido"
      icono="truck"
      alineacion="izquierda"
    >
      <div className={estilos.contenido}>
        <Texto variante="cuerpo" tono="secundario" como="p">
          {detalle.folio} · Estado actual: {ETIQUETA_ESTADO[estadoActual]}
        </Texto>

        <ol className={estilos.pasos} aria-label="Estados del pedido">
          {pasos.map((paso, indice) => (
            <li key={paso} className={estilos.paso}>
              {indice > 0 && <span className={estilos.conector} aria-hidden="true" />}
              {indice <= indiceActual ? (
                <span className={estilos.pasoFijo}>
                  <span className={`${estilos.marca} ${estilos.marcaCompleta}`}>
                    <Icono nombre="check" tamano={14} />
                  </span>
                  {ETIQUETA_ESTADO[paso]}
                </span>
              ) : (
                <button
                  type="button"
                  className={`${estilos.pasoBoton} ${paso === estado ? estilos.pasoElegido : ''}`}
                  aria-pressed={paso === estado}
                  onClick={() => elegirEstado(paso)}
                  disabled={cargando}
                >
                  <span className={estilos.marca}>{indice + 1}</span>
                  {ETIQUETA_ESTADO[paso]}
                </button>
              )}
            </li>
          ))}
        </ol>

        <Texto variante="etiqueta-fuerte" como="p">
          Siguiente estado permitido: {ETIQUETA_ESTADO[siguiente]}
        </Texto>

        {pideEnvio && (
          <div className={estilos.grupo} role="radiogroup" aria-label="Forma de entrega">
            <Radio
              name={entregaId}
              etiqueta="Envío por paquetería"
              checked={!envio.entregaLocal}
              onChange={() => capturarEnvio({ entregaLocal: false })}
              disabled={cargando}
            />
            {!envio.entregaLocal && (
              <div className={estilos.envio}>
                <Campo
                  etiqueta="Paquetería"
                  list={paqueteriasId}
                  value={envio.paqueteria}
                  onChange={(e) => capturarEnvio({ paqueteria: e.target.value })}
                  error={faltaPaqueteria ? 'Indica la paquetería.' : undefined}
                  maxLength={60}
                  disabled={cargando}
                />
                <datalist id={paqueteriasId}>
                  {PAQUETERIAS_SUGERIDAS.map((nombre) => (
                    <option key={nombre} value={nombre} />
                  ))}
                </datalist>
                <Campo
                  etiqueta="Número de guía"
                  value={envio.guia}
                  onChange={(e) => capturarEnvio({ guia: e.target.value })}
                  error={faltaGuia ? 'Indica el número de guía.' : undefined}
                  maxLength={60}
                  disabled={cargando}
                />
              </div>
            )}
            <Radio
              name={entregaId}
              etiqueta="Entrega local (sin guía)"
              checked={envio.entregaLocal}
              onChange={() => capturarEnvio({ entregaLocal: true })}
              disabled={cargando}
            />
          </div>
        )}

        {errores.length > 0 && (
          <Aviso tono="error">
            {errores.map((texto) => (
              <p key={texto}>{texto}</p>
            ))}
          </Aviso>
        )}

        {errores.length === 0 && <Aviso tono="info">{avisoCliente}</Aviso>}

        {errorDeAccion && <Aviso tono="error">{errorDeAccion.mensaje}</Aviso>}

        <div className={estilos.acciones}>
          <Boton variante="secundario" onClick={alCerrar} disabled={cargando}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            icono={<Icono nombre={pideEnvio ? 'truck' : 'check'} tamano={18} />}
            onClick={confirmar}
            cargando={cargando}
          >
            {errorDeAccion ? 'Reintentar' : `Marcar como ${ETIQUETA_ESTADO[estado].toLowerCase()}`}
          </Boton>
        </div>
      </div>
    </Dialogo>
  )
}
