/**
 * Vista del detalle de un pedido para el administrador (Front 1, 3 y 4 del diseño)
 * Ruta: /admin/pedidos/:folio
 *
 * Muestra el detalle y el historial, y según el estado del pedido ofrece:
 * - Front 3: aprobar el pago o rechazar el comprobante (pago en revisión)
 * - Front 4: actualizar el estado (pagado → enviado → entregado) y cancelar
 */

import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { contenedor } from '@app/contenedor'
import { Header } from '@compartido/layout/Header'
import { Texto } from '@compartido/ui/Texto'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Insignia } from '@compartido/ui/Insignia'
import { Icono } from '@compartido/ui/iconos/Icono'
import { useDetallePedido } from '../hooks/useDetallePedido'
import { useNavegacionPedidos } from '../hooks/useNavegacionPedidos'
import { ETIQUETA_ESTADO, type EstadoPedidoTs } from '../../dominio/EstadoPedidoTs'
import { ETIQUETA_METODO_PAGO } from '../../dominio/MetodoPagoTs'
import { MOTIVOS_RECHAZO, estaCancelado, puedeValidarPago } from '../../dominio/ReglasPedido'
import { formatearFecha, formatearMoneda, tonoEstado } from '../formato'
import { advertenciaCancelacion, descripcionCambioDeEstado } from '../mensajes'
import { DialogoConfirmarAprobacion } from './DialogoConfirmarAprobacion'
import { DialogoRechazarComprobante } from './DialogoRechazarComprobante'
import { DialogoActualizarEstado } from './DialogoActualizarEstado'
import { DialogoCancelarPedido } from './DialogoCancelarPedido'
import styles from './DetallePedidoVista.module.css'

/** Diálogo abierto y los datos con los que se abrió */
type DialogoAbierto =
  | { readonly tipo: 'aprobar' }
  | { readonly tipo: 'rechazar'; readonly motivos: readonly string[] }
  | { readonly tipo: 'estado'; readonly estadoActual: EstadoPedidoTs; readonly siguiente: EstadoPedidoTs }
  | { readonly tipo: 'cancelar'; readonly advertencia: string }

export default function DetallePedidoVista() {
  const { folio = '' } = useParams<{ folio: string }>()
  const { volverALista } = useNavegacionPedidos()
  const {
    detalle,
    cargando,
    error,
    mensaje,
    notificacionPendiente,
    estadoAnterior,
    cargar,
    siguienteEstadoPermitido,
    puedeCancelar,
    validarMotivo,
    validarTransicion,
    enlaceWhatsApp,
    aprobarPago,
    rechazarComprobante,
    actualizarEstado,
    cancelarPedido,
    limpiarAvisos,
  } = useDetallePedido(contenedor.pedidosAdminModel, folio)

  const [dialogo, setDialogo] = useState<DialogoAbierto | null>(null)
  const [avisoNoCancelable, setAvisoNoCancelable] = useState(false)

  // Referencia estable: Dialogo vuelve a tomar el foco cada vez que cambia alCerrar
  const cerrarDialogo = useCallback(() => setDialogo(null), [])

  const siguiente = siguienteEstadoPermitido()
  const validable = detalle !== null && puedeValidarPago(detalle.estado)
  const cancelado = detalle !== null && estaCancelado(detalle.estado)
  const enlaceNotificacion = notificacionPendiente ? enlaceWhatsApp() : null

  // ---------- Front 3 · validar pago ----------

  const abrirAprobarPago = () => {
    setDialogo({ tipo: 'aprobar' })
  }

  const abrirRechazarComprobante = () => {
    setDialogo({ tipo: 'rechazar', motivos: MOTIVOS_RECHAZO })
  }

  // ---------- Front 4 · estado y cancelación ----------

  const abrirActualizarEstado = () => {
    if (!detalle || !siguiente) return
    setDialogo({ tipo: 'estado', estadoActual: detalle.estado, siguiente })
  }

  const abrirCancelarPedido = () => {
    if (!detalle) return
    if (!puedeCancelar()) {
      // Enviado o entregado: se avisa y no se abre el diálogo
      setAvisoNoCancelable(true)
      return
    }
    setAvisoNoCancelable(false)
    setDialogo({ tipo: 'cancelar', advertencia: advertenciaCancelacion(detalle) })
  }

  /** Abre WhatsApp con el mensaje ya escrito cuando el backend no pudo notificar al cliente */
  const notificarPorWhatsApp = () => {
    if (enlaceNotificacion) {
      window.open(enlaceNotificacion, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div>
          <Boton variante="fantasma" icono={<Icono nombre="chevron-left" tamano={18} />} onClick={volverALista}>
            Pedidos
          </Boton>
        </div>

        {error && (
          <div className={styles.avisoConAcciones}>
            <Aviso tono="error">{error.mensaje}</Aviso>
            <Boton
              variante="secundario"
              icono={<Icono nombre="refresh" tamano={16} />}
              onClick={() => void cargar()}
              disabled={cargando}
            >
              Reintentar
            </Boton>
          </div>
        )}

        {mensaje && !notificacionPendiente && (
          <div className={styles.avisoConAcciones}>
            <Aviso tono="exito">{mensaje}</Aviso>
            <Boton variante="fantasma" onClick={limpiarAvisos} aria-label="Cerrar aviso">
              <Icono nombre="x" tamano={16} />
            </Boton>
          </div>
        )}

        {detalle && mensaje && notificacionPendiente && (
          <div className={styles.avisoConAcciones}>
            <Aviso tono="advertencia" titulo={mensaje}>
              {enlaceNotificacion
                ? `No pudimos avisar a ${detalle.cliente.nombre}. Envíale el aviso por WhatsApp.`
                : `No pudimos avisar a ${detalle.cliente.nombre} y no tiene teléfono registrado: avísale por otro medio.`}
            </Aviso>
            {enlaceNotificacion && (
              <Boton
                variante="whatsapp"
                icono={<Icono nombre="whatsapp" tamano={16} />}
                onClick={notificarPorWhatsApp}
              >
                Notificar por WhatsApp
              </Boton>
            )}
            <Boton variante="fantasma" onClick={limpiarAvisos} aria-label="Cerrar aviso">
              <Icono nombre="x" tamano={16} />
            </Boton>
          </div>
        )}

        {detalle && estadoAnterior && (
          <Aviso tono="info" titulo={`Este pedido ya no está en «${ETIQUETA_ESTADO[estadoAnterior]}»`}>
            {descripcionCambioDeEstado(detalle)} Las acciones disponibles corresponden al estado actual.
          </Aviso>
        )}

        {!detalle && cargando && (
          <Texto variante="cuerpo" tono="secundario" como="p">
            Cargando pedido {folio}...
          </Texto>
        )}

        {detalle && (
          <>
            <header className={styles.encabezado}>
              <div>
                <Texto variante="sobretitulo" tono="secundario">
                  Pedido
                </Texto>
                <Texto variante="h1" como="h1">
                  {detalle.folio}
                </Texto>
                <Texto variante="cuerpo-s" tono="secundario">
                  Creado el {formatearFecha(detalle.fechaCreacion)}
                  {detalle.fechaLimite && ` · límite ${formatearFecha(detalle.fechaLimite)}`}
                </Texto>
              </div>
              <Insignia tono={tonoEstado(detalle.estado)}>{ETIQUETA_ESTADO[detalle.estado]}</Insignia>
            </header>

            <div className={styles.columnas}>
              <section className={styles.tarjeta} aria-labelledby="titulo-productos">
                <Texto variante="h3" como="h2" id="titulo-productos">
                  Productos
                </Texto>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Talla</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.lineas.map((linea, indice) => (
                      <tr key={`${linea.producto}-${indice}`}>
                        <td>{linea.producto}</td>
                        <td>{linea.talla ?? '—'}</td>
                        <td>{linea.cantidad}</td>
                        <td>{formatearMoneda(linea.precioUnitario)}</td>
                        <td>{formatearMoneda(linea.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.total}>
                  <Texto variante="etiqueta" tono="secundario">
                    Total · {ETIQUETA_METODO_PAGO[detalle.metodoPago]}
                  </Texto>
                  <Texto variante="precio-l">{formatearMoneda(detalle.total)}</Texto>
                </div>
              </section>

              <div className={styles.lateral}>
                <section className={styles.tarjeta} aria-labelledby="titulo-cliente">
                  <Texto variante="h3" como="h2" id="titulo-cliente">
                    Cliente y entrega
                  </Texto>
                  <Texto variante="etiqueta-fuerte">{detalle.cliente.nombre}</Texto>
                  <Texto variante="cuerpo-s" tono="secundario">
                    {detalle.cliente.telefono ?? 'Sin teléfono'}
                  </Texto>
                  <Texto variante="cuerpo-s" como="p">
                    {detalle.datosEntrega}
                  </Texto>
                  {detalle.envio && (
                    <Texto variante="cuerpo-s" tono="secundario" como="p">
                      {detalle.envio.entregaLocal
                        ? 'Entrega local'
                        : `${detalle.envio.paqueteria} · guía ${detalle.envio.guia}`}
                    </Texto>
                  )}
                </section>

                {detalle.comprobante && (
                  <section className={styles.tarjeta} aria-labelledby="titulo-comprobante">
                    <Texto variante="h3" como="h2" id="titulo-comprobante">
                      Comprobante
                    </Texto>
                    <Texto variante="cuerpo-s" tono="secundario" como="p">
                      {detalle.comprobante.monto !== null && `${formatearMoneda(detalle.comprobante.monto)} · `}
                      {formatearFecha(detalle.comprobante.fecha)}
                      {detalle.comprobante.concepto && ` · ${detalle.comprobante.concepto}`}
                    </Texto>
                    {detalle.comprobante.url ? (
                      <a
                        className={styles.enlace}
                        href={detalle.comprobante.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icono nombre="file" tamano={16} />
                        {detalle.comprobante.nombreArchivo}
                      </a>
                    ) : (
                      // El backend manda el enlace vacío cuando no pudo generarlo (dura 5 minutos).
                      <Texto variante="cuerpo-s" tono="secundario" como="p">
                        No se pudo cargar el archivo. Recarga el pedido para intentarlo de nuevo.
                      </Texto>
                    )}
                  </section>
                )}

                <section className={styles.tarjeta} aria-labelledby="titulo-acciones">
                  <Texto variante="h3" como="h2" id="titulo-acciones">
                    Acciones
                  </Texto>
                  <div className={styles.acciones}>
                    {/* Si el pedido salió de revisión mientras se consultaba, se muestran deshabilitadas */}
                    {(validable || estadoAnterior === 'PAGO_EN_REVISION') && (
                      <>
                        <Boton
                          variante="primario"
                          anchoCompleto
                          icono={<Icono nombre="check" tamano={18} />}
                          onClick={abrirAprobarPago}
                          disabled={!validable || cargando}
                        >
                          Aprobar pago
                        </Boton>
                        <Boton
                          variante="peligro"
                          anchoCompleto
                          icono={<Icono nombre="x" tamano={18} />}
                          onClick={abrirRechazarComprobante}
                          disabled={!validable || cargando}
                        >
                          Rechazar comprobante
                        </Boton>
                      </>
                    )}

                    {siguiente && (
                      <>
                        <div className={styles.siguienteEstado}>
                          <Texto variante="cuerpo-s" tono="secundario">
                            Siguiente estado:
                          </Texto>
                          <Insignia tono={tonoEstado(siguiente)}>{ETIQUETA_ESTADO[siguiente]}</Insignia>
                        </div>
                        <Boton
                          variante="primario"
                          anchoCompleto
                          icono={<Icono nombre="truck" tamano={18} />}
                          onClick={abrirActualizarEstado}
                          disabled={cargando}
                        >
                          Actualizar estado
                        </Boton>
                      </>
                    )}

                    {cancelado ? (
                      <Texto variante="cuerpo-s" tono="secundario" como="p">
                        El pedido está cancelado y ya no admite acciones.
                      </Texto>
                    ) : (
                      <Boton
                        variante="fantasma"
                        anchoCompleto
                        icono={<Icono nombre="ban" tamano={18} />}
                        onClick={abrirCancelarPedido}
                        disabled={cargando}
                      >
                        Cancelar pedido
                      </Boton>
                    )}

                    {avisoNoCancelable && !cancelado && (
                      <Aviso tono="advertencia">El pedido ya salió de la tienda y no se puede cancelar.</Aviso>
                    )}

                    {estadoAnterior && (
                      <Boton
                        variante="secundario"
                        anchoCompleto
                        icono={<Icono nombre="chevron-left" tamano={18} />}
                        onClick={volverALista}
                      >
                        Volver a pedidos
                      </Boton>
                    )}
                  </div>
                </section>

                <section className={styles.tarjeta} aria-labelledby="titulo-historial">
                  <Texto variante="h3" como="h2" id="titulo-historial">
                    Historial
                  </Texto>
                  {detalle.historial.length === 0 ? (
                    <Texto variante="cuerpo-s" tono="secundario">
                      Sin cambios registrados.
                    </Texto>
                  ) : (
                    <ol className={styles.historial}>
                      {detalle.historial.map((entrada, indice) => (
                        <li key={`${entrada.fechaHora.toISOString()}-${indice}`} className={styles.entrada}>
                          <Texto variante="etiqueta-fuerte">{ETIQUETA_ESTADO[entrada.estadoNuevo]}</Texto>
                          <Texto variante="mini" tono="secundario">
                            {formatearFecha(entrada.fechaHora)} · {entrada.usuario}
                            {entrada.motivo && ` · ${entrada.motivo}`}
                          </Texto>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Abrir un diálogo es montarlo: su estado local empieza limpio en cada apertura */}
      {detalle && dialogo?.tipo === 'aprobar' && (
        <DialogoConfirmarAprobacion
          detalle={detalle}
          cargando={cargando}
          error={error}
          aprobarPago={aprobarPago}
          alCerrar={cerrarDialogo}
        />
      )}

      {detalle && dialogo?.tipo === 'rechazar' && (
        <DialogoRechazarComprobante
          detalle={detalle}
          motivos={dialogo.motivos}
          cargando={cargando}
          error={error}
          validarMotivo={validarMotivo}
          rechazarComprobante={rechazarComprobante}
          alCerrar={cerrarDialogo}
        />
      )}

      {detalle && dialogo?.tipo === 'estado' && (
        <DialogoActualizarEstado
          detalle={detalle}
          estadoActual={dialogo.estadoActual}
          siguiente={dialogo.siguiente}
          cargando={cargando}
          error={error}
          validarTransicion={validarTransicion}
          actualizarEstado={actualizarEstado}
          alCerrar={cerrarDialogo}
        />
      )}

      {detalle && dialogo?.tipo === 'cancelar' && (
        <DialogoCancelarPedido
          detalle={detalle}
          advertencia={dialogo.advertencia}
          cargando={cargando}
          error={error}
          validarMotivo={validarMotivo}
          cancelarPedido={cancelarPedido}
          alCerrar={cerrarDialogo}
        />
      )}
    </div>
  )
}
