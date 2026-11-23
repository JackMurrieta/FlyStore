/**
 * Diálogo «¿Cancelar el pedido?» de Mis pedidos. Solo el cliente cancela su pedido, y solo
 * mientras está apartado o esperando su comprobante. El motivo es opcional.
 * MisPedidosView lo monta al abrirlo, así cada apertura empieza con el motivo vacío.
 */

import { useState } from 'react'
import { Aviso, Boton, Campo, Dialogo, Icono, Texto } from '@compartido/ui'
import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import { MAX_MOTIVO_CANCELACION } from '../../dominio/ReglasVenta'
import estilos from './venta.module.css'

export interface DialogoCancelarPedidoProps {
  readonly folio: string
  /** Pago en efectivo (apartado) o transferencia esperando comprobante: cambia el texto. */
  readonly esperaEfectivo: boolean
  /** false si mientras tanto el pedido dejó de ser cancelable (el backend respondió 409). */
  readonly puedeCancelar: boolean
  readonly cancelando: boolean
  readonly error: ErrorTs | null
  readonly alConfirmar: (motivo: string) => void
  readonly alCerrar: () => void
}

export function DialogoCancelarPedido({
  folio,
  esperaEfectivo,
  puedeCancelar,
  cancelando,
  error,
  alConfirmar,
  alCerrar,
}: DialogoCancelarPedidoProps) {
  const [motivo, setMotivo] = useState('')

  return (
    <Dialogo abierto alCerrar={alCerrar} titulo={`¿Cancelar el pedido ${folio}?`} icono="ban" tonoIcono="peligro"
      alineacion="izquierda">
      <div className={estilos.principal}>
        <Texto variante="cuerpo" como="p" tono="secundario">
          {esperaEfectivo ? 'Ya no tendrás que pasar a pagarlo a la tienda.' : 'Ya no podrás subir tu comprobante para este pedido.'}{' '}
          Si después quieres los productos, tendrás que hacer un nuevo pedido.
        </Texto>
        {puedeCancelar && (
          <Campo
            etiqueta="Motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={MAX_MOTIVO_CANCELACION}
            placeholder="Cuéntanos por qué lo cancelas"
            disabled={cancelando}
          />
        )}
        {error && <Aviso tono="error">{error.mensaje}</Aviso>}
        <div className={estilos.acciones}>
          <span className={estilos.espaciador} />
          <Boton variante="secundario" onClick={alCerrar} disabled={cancelando}>
            {puedeCancelar ? 'Volver' : 'Entendido'}
          </Boton>
          {puedeCancelar && (
            <Boton variante="peligroSolido" icono={<Icono nombre="ban" tamano={18} />} cargando={cancelando}
              onClick={() => alConfirmar(motivo)}>
              {error ? 'Reintentar' : 'Cancelar pedido'}
            </Boton>
          )}
        </div>
      </div>
    </Dialogo>
  )
}
