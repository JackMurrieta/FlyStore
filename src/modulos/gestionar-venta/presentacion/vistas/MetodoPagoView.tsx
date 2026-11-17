/**
 * MetodoPagoView «ViewComponent» · B3 Transferencia, B4 Subir comprobante, S3 Transferir después,
 * B5 Efectivo, A6 Archivo inválido, A7 Error al subir.
 * Mensajes que recibe: subirComprobante (básico 39), continuarAConfirmacion (básico 47),
 * elegirPagoEfectivo (Alt3 · 1), subirComprobanteDespues (Alt4 · 1).
 */

import { Navigate } from 'react-router-dom'
import { Aviso, Boton, Icono, Texto } from '@compartido/ui'
import { TipoPago } from '../../dominio/TipoPago'
import { HORAS_LIMITE_PAGO } from '../../dominio/ReglasVenta'
import { useMetodoPago } from '../hooks/useMetodoPago'
import { useSubirComprobante } from '../hooks/useSubirComprobante'
import { useNavegacionVenta } from '../hooks/useNavegacionVenta'
import { useModelosVenta } from '../ModelosVentaContext'
import { EstadoCarga, PaginaVenta } from '../componentes/PaginaVenta'
import { ResumenPedido } from '../componentes/ResumenPedido'
import { OpcionPago } from '../componentes/OpcionPago'
import { DatosTransferencia } from '../componentes/DatosTransferencia'
import { ComprobantePago } from '../componentes/ComprobantePago'
import { CajaFecha, Tarjeta } from '../componentes/Elementos'
import { formatearFechaLimite, piezas } from '../formato'
import estilos from '../componentes/venta.module.css'

export default function MetodoPagoView() {
  const pago = useMetodoPago()
  const comprobante = useSubirComprobante()
  const navegacion = useNavegacionVenta()
  const { rutaBase } = useModelosVenta()
  const { informacionPedido, datosBancarios, metodoPago, opcion, seccion } = pago

  if (!informacionPedido) return <Navigate to={rutaBase} replace />

  const subirComprobante = () => {
    if (comprobante.archivo) void pago.crearMetodoPagoDTO(TipoPago.TRANSFERENCIA, comprobante.archivo)
  }
  const continuarAConfirmacion = () => void navegacion.irConfirmacion()
  const elegirPagoEfectivo = () => void pago.elegirPagoEfectivo()
  const subirComprobanteDespues = () => void pago.subirComprobanteDespues()
  const fechaLimite = metodoPago?.fechaLimiteEstimada ? formatearFechaLimite(metodoPago.fechaLimiteEstimada) : null

  return (
    <PaginaVenta titulo="Método de pago" subtitulo="La plataforma no cobra en línea: transfiere o paga en efectivo." paso={3}>
      <div className={estilos.columnas}>
        <div className={estilos.principal}>
          {pago.errorDatosBancarios && (
            <Aviso tono="error" titulo="No pudimos cargar los datos para pagar">{pago.errorDatosBancarios.mensaje}</Aviso>
          )}

          <Tarjeta titulo="¿Cómo quieres pagar?" etiquetaId="titulo-como-pagar">
            <fieldset className={estilos.opciones} disabled={!datosBancarios || comprobante.validando}>
              <legend className={estilos.visuallyHidden}>Forma de pago</legend>
              <OpcionPago nombre="tipoPago" valor={TipoPago.TRANSFERENCIA} seleccionada={opcion === TipoPago.TRANSFERENCIA}
                icono="bank" titulo="Transferencia bancaria"
                descripcion={`Sube tu comprobante ahora o en máximo ${HORAS_LIMITE_PAGO} h; si no, tu pedido se elimina.`}
                alElegir={pago.elegirTransferencia} />
              <OpcionPago nombre="tipoPago" valor={TipoPago.EFECTIVO} seleccionada={opcion === TipoPago.EFECTIVO}
                icono="cash" titulo="Efectivo"
                descripcion={`Tienes ${HORAS_LIMITE_PAGO} horas para pagar; si no, tu pedido se elimina.`}
                alElegir={elegirPagoEfectivo} />
            </fieldset>
          </Tarjeta>

          {pago.cargandoDatosBancarios && <EstadoCarga texto="Cargando datos para pagar…" />}

          {opcion === TipoPago.TRANSFERENCIA && datosBancarios && (
            <DatosTransferencia datos={datosBancarios} total={informacionPedido.total} />
          )}

          {opcion === TipoPago.TRANSFERENCIA && seccion === 'COMPROBANTE' && (
            <ComprobantePago archivo={comprobante.archivo} vistaPreviaUrl={comprobante.vistaPreviaUrl} esPdf={comprobante.esPdf}
              mensajeError={comprobante.mensajeError} errorDeConexion={comprobante.errorDeConexion}
              comprobanteValido={comprobante.comprobanteValido} archivoValidoLocal={comprobante.archivoValidoLocal}
              validando={comprobante.validando} seleccionarArchivo={comprobante.seleccionarArchivo} />
          )}

          {opcion === TipoPago.TRANSFERENCIA && seccion === 'DESPUES' && metodoPago?.modalidad === 'COMPROBANTE_DESPUES' && fechaLimite && (
            <Tarjeta titulo="Transferirás después" subtitulo="Tu pedido se registrará sin comprobante." etiquetaId="titulo-despues">
              <CajaFecha icono="clock" etiqueta="Fecha y hora límite" fecha={fechaLimite} estado={metodoPago.estadoInicial} />
              <Aviso tono="advertencia" titulo={`Tienes ${HORAS_LIMITE_PAGO} horas para transferir y subir tu comprobante`}>
                Usa el folio del pedido como concepto. Tus piezas no quedan apartadas hasta que subas el comprobante.
                Si no lo subes en {HORAS_LIMITE_PAGO} horas, tu pedido se elimina y tendrás que hacer uno nuevo.
              </Aviso>
            </Tarjeta>
          )}

          {opcion === TipoPago.EFECTIVO && metodoPago?.modalidad === 'EFECTIVO' && fechaLimite && (
            <Tarjeta titulo={`Tienes ${HORAS_LIMITE_PAGO} horas para pagar`}
              subtitulo="Liquida en efectivo al recoger o al recibir tu pedido; lo coordinamos por WhatsApp." etiquetaId="titulo-efectivo">
              <CajaFecha icono="calendar" etiqueta="Paga antes de" fecha={fechaLimite} estado={metodoPago.estadoInicial} />
              <ul className={estilos.condiciones}>
                <li><Icono nombre="package" tamano={18} /><Texto variante="cuerpo">Tus {piezas(informacionPedido.totalPiezas)} no quedan apartadas hasta que se registre tu pago.</Texto></li>
                <li><Icono nombre="clock" tamano={18} /><Texto variante="cuerpo">El plazo empieza al confirmar el pedido.</Texto></li>
                <li><Icono nombre="ban" tamano={18} /><Texto variante="cuerpo">Si no pagas en {HORAS_LIMITE_PAGO} horas, tu pedido se elimina y tendrás que hacer uno nuevo.</Texto></li>
              </ul>
            </Tarjeta>
          )}

          <div className={estilos.acciones}>
            <Boton variante="fantasma" icono={<Icono nombre="chevron-left" tamano={18} />} onClick={navegacion.irEntrega}>Regresar</Boton>
            <span className={estilos.espaciador} />
            {!datosBancarios && pago.errorDatosBancarios && (
              <Boton variante="primario" icono={<Icono nombre="refresh" tamano={18} />} cargando={pago.cargandoDatosBancarios}
                onClick={() => void pago.reintentarDatosBancarios()}>Reintentar</Boton>
            )}
            {datosBancarios && opcion === TipoPago.TRANSFERENCIA && seccion === 'NINGUNA' && (
              <>
                <Boton variante="secundario" icono={<Icono nombre="clock" tamano={18} />} onClick={subirComprobanteDespues}>Transferir después</Boton>
                <Boton variante="primario" icono={<Icono nombre="upload" tamano={18} />} onClick={pago.mostrarSubirComprobante}>Ya transferí, subir comprobante</Boton>
              </>
            )}
            {opcion === TipoPago.TRANSFERENCIA && seccion === 'DESPUES' && (
              <Boton variante="secundario" icono={<Icono nombre="upload" tamano={18} />} onClick={pago.mostrarSubirComprobante}>Ya transferí</Boton>
            )}
            {opcion === TipoPago.TRANSFERENCIA && seccion === 'COMPROBANTE' && !comprobante.validando && (
              <Boton variante="secundario" icono={<Icono nombre="clock" tamano={18} />} onClick={subirComprobanteDespues}>Transferir después</Boton>
            )}
            {opcion === TipoPago.TRANSFERENCIA && seccion === 'COMPROBANTE' && !pago.listoParaContinuar && (
              comprobante.errorDeConexion
                ? <Boton variante="primario" icono={<Icono nombre="refresh" tamano={18} />} cargando={comprobante.validando} onClick={subirComprobante}>Reintentar</Boton>
                : <Boton variante="primario" icono={<Icono nombre="check" tamano={18} />} cargando={comprobante.validando}
                    disabled={!comprobante.archivoValidoLocal} onClick={subirComprobante}>Confirmar comprobante</Boton>
            )}
            {pago.listoParaContinuar && (
              <Boton variante="primario" icono={<Icono nombre="arrow-right" tamano={18} />} cargando={navegacion.navegando}
                onClick={continuarAConfirmacion}>Continuar al resumen</Boton>
            )}
          </div>
        </div>
        <div className={estilos.lateral}><ResumenPedido informacion={informacionPedido} /></div>
      </div>
    </PaginaVenta>
  )
}
