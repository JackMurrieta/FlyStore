/**
 * Diálogo «Registrar pago en efectivo» (Front 2 del diseño)
 * Se monta con key={folio} desde la lista para reiniciar el monto en cada pedido.
 */

import type { PedidosAdminModel } from '../../aplicacion/PedidosAdminModel'
import type { PedidoResumenTs } from '../../dominio/PedidoResumenTs'
import { useRegistrarPagoEfectivo } from '../hooks/useRegistrarPagoEfectivo'
import { formatearFecha, formatearMoneda } from '../formato'
import { Dialogo } from '@compartido/ui/Dialogo'
import { Texto } from '@compartido/ui/Texto'
import { Campo } from '@compartido/ui/Campo'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import styles from './DialogoRegistrarPagoEfectivo.module.css'

export interface DialogoRegistrarPagoEfectivoProps {
  readonly pedido: PedidoResumenTs | null
  readonly model: PedidosAdminModel
  readonly alCerrar: () => void
}

export function DialogoRegistrarPagoEfectivo({ pedido, model, alCerrar }: DialogoRegistrarPagoEfectivoProps) {
  const { monto, cambio, vencido, cargando, error, capturarMonto, registrar } = useRegistrarPagoEfectivo(
    model,
    pedido
  )

  const manejarRegistrar = async () => {
    const exitoso = await registrar()
    if (exitoso) alCerrar()
  }

  return (
    <Dialogo abierto={pedido !== null} alCerrar={alCerrar} titulo="Registrar pago en efectivo" icono="cash">
      {pedido && (
        <div className={styles.contenido}>
          <div className={styles.resumen}>
            <Texto variante="sobretitulo" tono="secundario">
              Pedido {pedido.folio}
            </Texto>
            <Texto variante="precio-l">{formatearMoneda(pedido.total)}</Texto>
            <Texto variante="cuerpo-s" tono="secundario">
              {pedido.clienteNombre} · límite del apartado: {formatearFecha(pedido.fechaLimite)}
            </Texto>
          </div>

          {vencido ? (
            <>
              <Aviso tono="advertencia" titulo="El apartado venció">
                El plazo de pago ya se cumplió. El pedido se cancelará automáticamente y el cliente debe
                hacer un nuevo pedido.
              </Aviso>
              <Boton variante="secundario" anchoCompleto onClick={alCerrar}>
                Entendido
              </Boton>
            </>
          ) : (
            <>
              {error && <Aviso tono="error">{error.mensaje}</Aviso>}

              <Campo
                etiqueta="Monto recibido"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={monto === 0 ? '' : monto}
                onChange={(e) => capturarMonto(e.target.valueAsNumber)}
                placeholder="0.00"
                autoFocus
              />

              {cambio && monto > 0 && (
                <Aviso tono={cambio.suficiente ? 'exito' : 'advertencia'}>
                  {cambio.suficiente
                    ? `Cambio a entregar: ${formatearMoneda(cambio.cambio)}`
                    : `Falta: ${formatearMoneda(cambio.faltante)}`}
                </Aviso>
              )}

              <div className={styles.acciones}>
                <Boton variante="fantasma" onClick={alCerrar} disabled={cargando}>
                  Cancelar
                </Boton>
                <Boton
                  variante="primario"
                  onClick={manejarRegistrar}
                  cargando={cargando}
                  disabled={!cambio?.suficiente}
                >
                  Registrar pago
                </Boton>
              </div>
            </>
          )}
        </div>
      )}
    </Dialogo>
  )
}
