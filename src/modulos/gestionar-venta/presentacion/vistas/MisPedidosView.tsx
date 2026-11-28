/**
 * MisPedidosView «ViewComponent» · S6 Mis pedidos · Subir comprobante, A10 Pedido con plazo vencido.
 * Fuente: Figma CU02 · S6 (155:3576) y CU02 · A10 (156:4441).
 * Lista los pedidos registrados del cliente; el detalle del elegido muestra artículos y, si espera
 * comprobante, la fecha límite, los datos para transferir y la carga del comprobante. Mientras no
 * ha pagado (apartado o esperando comprobante) el cliente puede cancelar su pedido.
 * «Ver recibo» abre el recibo del pedido (el mismo de B7) para descargarlo como imagen.
 */

import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Aviso, Boton, Icono, Texto } from '@compartido/ui'
import type { DatosBancariosTs } from '../../dominio/DatosBancariosTs'
import type { InformacionPedidoTs } from '../../dominio/InformacionPedidoTs'
import type { EstadoPedidoTs } from '../../dominio/EstadoVenta'
import { EstadoVenta } from '../../dominio/EstadoVenta'
import { HORAS_LIMITE_PAGO } from '../../dominio/ReglasVenta'
import { useMisPedidos } from '../hooks/useMisPedidos'
import { useCopiar } from '../hooks/useCopiar'
import { EstadoCarga, PaginaVenta } from '../componentes/PaginaVenta'
import { ComprobantePago } from '../componentes/ComprobantePago'
import { DialogoCancelarPedido } from '../componentes/DialogoCancelarPedido'
import { DialogoRecibo } from '../componentes/DialogoRecibo'
import { Divisor, FilaResumen, FotoProducto, InsigniaEstado } from '../componentes/Elementos'
import {
  formatearFechaCorta, formatearFechaLimite, formatearMonto, formatearMontoExacto, formatearTotal, piezas, productos,
} from '../formato'
import estilos from '../componentes/venta.module.css'

export default function MisPedidosView() {
  const vm = useMisPedidos()
  const navegar = useNavigate()

  return (
    <PaginaVenta conPie>
      <div className={estilos.titulos}>
        <Texto variante="sobretitulo" tono="secundario">Mi cuenta</Texto>
        <Texto variante="h1" como="h1">Mis pedidos</Texto>
      </div>

      {vm.cargando && <EstadoCarga texto="Cargando tus pedidos…" diseno="pedidos" />}

      {vm.error && !vm.cargando && (
        <div className={estilos.estadoError}>
          <Aviso tono="error" titulo="No pudimos cargar tus pedidos">{vm.error.mensaje}</Aviso>
          <Boton variante="secundario" icono={<Icono nombre="refresh" tamano={18} />} onClick={vm.reintentar}>
            Reintentar
          </Boton>
        </div>
      )}

      {vm.cargado && vm.pedidos.length === 0 && (
        <div className={estilos.vacio}>
          <span className={estilos.iconoCirculo} aria-hidden="true"><Icono nombre="package" tamano={28} /></span>
          <Texto variante="h3" como="h2">Aún no tienes pedidos</Texto>
          <Texto variante="cuerpo-s" como="p" tono="secundario">Cuando registres un pedido, aquí verás su estado y podrás subir tu comprobante.</Texto>
          <Boton variante="primario" icono={<Icono nombre="cart" tamano={18} />} onClick={() => navegar('/')}>
            Ir a la tienda
          </Boton>
        </div>
      )}

      {vm.pedidos.length > 0 && (
        <div className={estilos.misPedidos}>
          <ul className={estilos.listaPedidos} aria-label="Tus pedidos">
            {vm.pedidos.map((pedido) => (
              <li key={pedido.folio ?? pedido.total}>
                <TarjetaPedido pedido={pedido} estado={vm.estadoMostrado(pedido)} seleccionado={pedido.folio === vm.seleccionado?.folio}
                  alElegir={() => pedido.folio && vm.seleccionarPedido(pedido.folio)} />
              </li>
            ))}
          </ul>
          {vm.seleccionado && <DetallePedido vm={vm} pedido={vm.seleccionado} />}
        </div>
      )}
    </PaginaVenta>
  )
}

/** Tarjeta de la lista: folio, total, fecha · productos e insignia de estado. */
function TarjetaPedido({ pedido, estado, seleccionado, alElegir }: {
  readonly pedido: InformacionPedidoTs
  readonly estado: EstadoPedidoTs | null
  readonly seleccionado: boolean
  readonly alElegir: () => void
}) {
  const fecha = pedido.fechaHoraPedido ? `${formatearFechaCorta(pedido.fechaHoraPedido)} · ` : ''
  return (
    <button type="button" className={estilos.tarjetaPedido} aria-current={seleccionado ? 'true' : undefined} onClick={alElegir}>
      <span className={estilos.fila}>
        <Texto variante="etiqueta-fuerte">{pedido.folio ?? '—'}</Texto>
        <Texto variante="etiqueta-fuerte">{formatearMonto(pedido.total)}</Texto>
      </span>
      <Texto variante="mini" tono="secundario">{fecha}{productos(pedido.totalProductos)}</Texto>
      {estado && <InsigniaEstado estado={estado} />}
    </button>
  )
}

type VistaModelo = ReturnType<typeof useMisPedidos>

/** Panel «Detalle» del pedido elegido (S6 y A10). */
function DetallePedido({ vm, pedido }: { readonly vm: VistaModelo; readonly pedido: InformacionPedidoTs }) {
  const navegar = useNavigate()
  const estado = pedido.estado?.valor
  const fechaLimite = pedido.fechaLimitePago ? formatearFechaLimite(pedido.fechaLimitePago) : null
  const vencido = vm.vencido
  const estadoVisible = vm.estadoMostrado(pedido)
  const [reciboAbierto, setReciboAbierto] = useState(false)
  const cerrarRecibo = useCallback(() => setReciboAbierto(false), [])

  return (
    <section className={estilos.tarjeta} aria-labelledby="titulo-detalle-pedido">
      <div className={estilos.encabezadoDetalle}>
        <div>
          <Texto variante="sobretitulo" tono="secundario">Pedido</Texto>
          <Texto variante="h1" como="h2" id="titulo-detalle-pedido">{pedido.folio ?? '—'}</Texto>
        </div>
        {estadoVisible && <InsigniaEstado estado={estadoVisible} />}
      </div>

      {fechaLimite && (vm.puedeSubir || vm.esperaEfectivo || vencido) && (
        <div className={estilos.cajaPlazo}>
          <Icono nombre="clock" tamano={24} />
          <div>
            <Texto variante="cuerpo-s" tono="secundario">
              {vencido ? 'El plazo venció el' : vm.esperaEfectivo ? 'Paga en efectivo antes de' : 'Sube tu comprobante antes de'}
            </Texto>
            <Texto variante="h3">{fechaLimite}</Texto>
          </div>
          <Texto variante="etiqueta-fuerte">{vencido ? 'Vencido' : `Quedan ${vm.horasRestantes ?? 0} h`}</Texto>
        </div>
      )}

      <ul className={estilos.articulosDetalle}>
        {pedido.articulos.map((articulo) => (
          <li key={articulo.idDetalle} className={estilos.articulo}>
            <FotoProducto url={articulo.imagenUrl} alt="" tamano={48} />
            <div>
              <Texto variante="etiqueta">{articulo.nombre}</Texto>
              <Texto variante="mini" tono="secundario">
                {piezas(articulo.cantidad, true)} · {formatearMonto(articulo.precioFinal)} c/u
              </Texto>
            </div>
            <Texto variante="etiqueta-fuerte">{formatearMonto(articulo.subtotal)}</Texto>
          </li>
        ))}
      </ul>

      <div className={estilos.acciones}>
        <Boton data-fly-ticket-button variante="fantasma" icono={<Icono nombre="file" tamano={18} />}
          onClick={() => setReciboAbierto(true)}>
          Ver recibo
        </Boton>
      </div>

      {vm.puedeSubir ? (
        <>
          {vm.errorDatosBancarios && (
            <div className={estilos.estadoError}>
              <Aviso tono="error" titulo="No pudimos cargar los datos para transferir">{vm.errorDatosBancarios.mensaje}</Aviso>
              <Boton variante="secundario" icono={<Icono nombre="refresh" tamano={18} />} onClick={vm.reintentarDatosBancarios}>
                Reintentar
              </Boton>
            </div>
          )}
          {vm.cargandoDatosBancarios && <EstadoCarga texto="Cargando los datos para transferir…" diseno="filas" />}
          {vm.datosBancarios && <DatosBancariosPedido datos={vm.datosBancarios} total={pedido.total} />}
          <ComprobantePago variante="panel" archivo={vm.archivo} vistaPreviaUrl={vm.vistaPreviaUrl} esPdf={vm.esPdf}
            mensajeError={vm.mensajeError} errorDeConexion={vm.errorDeConexion} comprobanteValido={false}
            archivoValidoLocal={vm.archivoValidoLocal} validando={vm.subiendo} seleccionarArchivo={vm.seleccionarArchivo} />
          {vm.archivo && vm.archivoValidoLocal && (
            <div className={estilos.acciones}>
              <Boton variante="primario" icono={<Icono nombre={vm.errorDeConexion ? 'refresh' : 'upload'} tamano={18} />}
                cargando={vm.subiendo} onClick={() => void vm.enviarComprobante()}>
                {vm.errorDeConexion ? 'Reintentar envío' : 'Enviar comprobante'}
              </Boton>
            </div>
          )}
        </>
      ) : (
        <>
          {!vencido && (
            <>
              <Divisor />
              <FilaResumen etiqueta="Total" valor={formatearTotal(pedido.total)} tipo="total" />
            </>
          )}
          <AvisoEstado estado={estado} vencido={vencido} recibido={vm.comprobanteRecibido} cancelado={vm.pedidoCancelado} />
          {(vencido || estado === EstadoVenta.CANCELADO) && (
            <div className={estilos.acciones}>
              <Boton variante="primario" icono={<Icono nombre="cart" tamano={18} />} onClick={() => navegar('/')}>
                Hacer un nuevo pedido
              </Boton>
              {pedido.enlaceWhatsapp && (
                <a href={pedido.enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className={estilos.enlaceSecundario}>
                  <Icono nombre="whatsapp" tamano={18} /> Escribir por WhatsApp
                </a>
              )}
            </div>
          )}
        </>
      )}

      {vm.puedeCancelar && (
        <div className={estilos.acciones}>
          <Boton variante="peligro" icono={<Icono nombre="ban" tamano={18} />} onClick={vm.abrirCancelar}
            disabled={vm.subiendo || vm.cancelando}>
            Cancelar pedido
          </Boton>
        </div>
      )}

      {reciboAbierto && <DialogoRecibo pedido={pedido} alCerrar={cerrarRecibo} />}

      {vm.dialogoCancelarAbierto && pedido.folio && (
        <DialogoCancelarPedido folio={pedido.folio} esperaEfectivo={estado === EstadoVenta.APARTADO_PENDIENTE_PAGO}
          puedeCancelar={vm.puedeCancelar} cancelando={vm.cancelando} error={vm.errorCancelacion}
          alConfirmar={(motivo) => void vm.cancelarPedido(motivo)} alCerrar={vm.cerrarCancelar} />
      )}
    </section>
  )
}

/** Aviso del estado del pedido cuando ya no admite comprobante. */
function AvisoEstado({ estado, vencido, recibido, cancelado }: {
  readonly estado: string | undefined
  readonly vencido: boolean
  readonly recibido: boolean
  /** El cliente lo acaba de cancelar en esta pantalla. */
  readonly cancelado: boolean
}) {
  if (vencido) {
    return (
      <Aviso tono="error" titulo="Este pedido se canceló por vencimiento">
        El plazo de {HORAS_LIMITE_PAGO} horas terminó sin que se registrara el pago. Para comprar, haz un nuevo pedido.
      </Aviso>
    )
  }
  if (cancelado) {
    return (
      <Aviso tono="exito" titulo="Cancelaste tu pedido">
        Ya no tienes que pagarlo. Si quieres los productos, haz un nuevo pedido.
      </Aviso>
    )
  }
  if (recibido) {
    return (
      <Aviso tono="exito" titulo="Recibimos tu comprobante">
        Tu pedido pasó a «Pago en revisión». Validaremos tu transferencia y te avisaremos por WhatsApp.
      </Aviso>
    )
  }
  switch (estado) {
    case EstadoVenta.PAGO_EN_REVISION:
      return <Aviso tono="info" titulo="Estamos revisando tu pago">Validamos los comprobantes en orden de llegada y te avisamos por WhatsApp.</Aviso>
    case EstadoVenta.APARTADO_PENDIENTE_PAGO:
      return <Aviso tono="info" titulo="Pago en efectivo">Te escribimos por WhatsApp para acordar la entrega y el pago.</Aviso>
    case EstadoVenta.CANCELADO:
      return <Aviso tono="error" titulo="Cancelaste este pedido">Si quieres los productos, haz un nuevo pedido.</Aviso>
    default:
      return null
  }
}

/** «Datos bancarios» del S6: banco, titular, CLABE y concepto con Copiar, y el monto exacto. */
function DatosBancariosPedido({ datos, total }: { readonly datos: DatosBancariosTs; readonly total: number }) {
  const { copiado, copiar } = useCopiar()
  const filas: readonly { clave: string; etiqueta: string; valor: string; copiable: boolean }[] = [
    { clave: 'banco', etiqueta: 'Banco', valor: datos.banco, copiable: false },
    { clave: 'titular', etiqueta: 'Titular', valor: datos.titular, copiable: false },
    { clave: 'clabe', etiqueta: 'CLABE interbancaria', valor: datos.clabe, copiable: true },
    { clave: 'concepto', etiqueta: 'Concepto', valor: datos.concepto, copiable: true },
    { clave: 'monto', etiqueta: 'Monto', valor: formatearMontoExacto(total), copiable: false },
  ]
  return (
    <dl className={`${estilos.datos} ${estilos.datosCompactos}`} aria-label="Datos para transferir">
      {filas.map((fila) => (
        <div key={fila.clave} className={estilos.dato}>
          <dt className="fly-cuerpo-s fly-tono-secundario">{fila.etiqueta}</dt>
          <dd className="fly-etiqueta-fuerte">{fila.valor}</dd>
          {fila.copiable && (
            <button type="button" className={estilos.copiar} onClick={() => void copiar(fila.clave, fila.valor.replace(/\s/g, ''))}
              aria-label={`Copiar ${fila.etiqueta.toLowerCase()}`}>
              <Icono nombre={copiado === fila.clave ? 'check' : 'copy'} tamano={14} />
              <Texto variante="mini">{copiado === fila.clave ? 'Copiado' : 'Copiar'}</Texto>
            </button>
          )}
        </div>
      ))}
    </dl>
  )
}
