/**
 * ConfirmarPedidoView «ViewComponent» · B6 Resumen final, A9 Error al registrar.
 * Mensajes que recibe: confirmarPedido (básico 58).
 */

import { Navigate } from 'react-router-dom'
import { Aviso, Boton, Icono, Texto } from '@compartido/ui'
import { TipoPago } from '../../dominio/TipoPago'
import { useConfirmarPedido } from '../hooks/useConfirmarPedido'
import { useNavegacionVenta } from '../hooks/useNavegacionVenta'
import { useModelosVenta } from '../ModelosVentaContext'
import { PaginaVenta } from '../componentes/PaginaVenta'
import { Divisor, FilaResumen, FotoProducto, InsigniaEstado, Tarjeta } from '../componentes/Elementos'
import { formatearDescuento, formatearFechaLimite, formatearMonto, formatearTotal, piezas, productos } from '../formato'
import estilos from '../componentes/venta.module.css'

export default function ConfirmarPedidoView() {
  const confirmacion = useConfirmarPedido()
  const navegacion = useNavegacionVenta()
  const { rutaBase } = useModelosVenta()
  const { informacionPedido: pedido, metodoPago, datosEntrega, error } = confirmacion

  if (!pedido || !metodoPago || !datosEntrega) return <Navigate to={rutaBase} replace />

  const confirmarPedido = () => { if (pedido.folio) void navegacion.irPedidoRegistrado(pedido.folio) }
  const procesando = confirmacion.registrando || navegacion.navegando

  const editar = (texto: string, accion: () => void, etiqueta: string) => (
    <Boton variante="fantasma" icono={<Icono nombre="pencil" tamano={16} />} onClick={accion} aria-label={etiqueta} disabled={procesando}>
      {texto}
    </Boton>
  )

  return (
    <PaginaVenta titulo="Confirma tu pedido" subtitulo="Revisa todo antes de confirmar. Después recibirás tu folio." paso={4}>
      <div className={estilos.columnas}>
        <div className={estilos.principal}>
          {error && (
            <Aviso tono="error" titulo="No pudimos registrar tu pedido">{error.mensaje}</Aviso>
          )}
          <Tarjeta titulo="Productos" etiquetaId="titulo-productos"
            subtitulo={`${productos(pedido.totalProductos)} · ${piezas(pedido.totalPiezas)} · esquema ${pedido.etiquetaEsquema}`}
            accion={editar('Editar carrito', navegacion.irCarrito, 'Editar carrito')}>
            <ul className={estilos.articulos}>
              {pedido.articulos.map((articulo) => (
                <li key={articulo.idDetalle} className={estilos.articulo}>
                  <FotoProducto url={articulo.imagenUrl} alt="" tamano={48} />
                  <div>
                    <Texto variante="etiqueta">{articulo.nombre}</Texto>
                    <Texto variante="mini" tono="secundario">{piezas(articulo.cantidad, true)} · {formatearMonto(articulo.precioFinal)} c/u</Texto>
                  </div>
                  <Texto variante="etiqueta-fuerte">{formatearMonto(articulo.subtotal)}</Texto>
                </li>
              ))}
            </ul>
          </Tarjeta>
          <div className={estilos.dosColumnas}>
            <Tarjeta titulo="Entrega" etiquetaId="titulo-entrega-resumen"
              accion={editar('Editar', navegacion.irEntrega, 'Editar datos de entrega')}>
              <ul className={estilos.datosConIcono}>
                <li><Icono nombre="user" tamano={18} /><Texto variante="cuerpo">{datosEntrega.nombreCompleto}</Texto></li>
                <li><Icono nombre="whatsapp" tamano={18} /><Texto variante="cuerpo">{datosEntrega.telefono}</Texto></li>
                <li><Icono nombre="pin" tamano={18} /><Texto variante="cuerpo">{datosEntrega.direccion} · {datosEntrega.ciudad}, {datosEntrega.estado}</Texto></li>
              </ul>
            </Tarjeta>
            <Tarjeta titulo="Pago" etiquetaId="titulo-pago-resumen"
              accion={editar('Cambiar', navegacion.irPago, 'Cambiar método de pago')}>
              <ul className={estilos.datosConIcono}>
                <li>
                  <Icono nombre={metodoPago.tipoPago === TipoPago.EFECTIVO ? 'cash' : 'bank'} tamano={18} />
                  <Texto variante="cuerpo">{metodoPago.etiqueta}</Texto>
                </li>
                {metodoPago.comprobanteNombre && (
                  <li><Icono nombre="file" tamano={18} /><Texto variante="cuerpo">{metodoPago.comprobanteNombre} adjunto</Texto></li>
                )}
                {metodoPago.fechaLimiteEstimada && (
                  <li><Icono nombre="clock" tamano={18} /><Texto variante="cuerpo">Plazo: {formatearFechaLimite(metodoPago.fechaLimiteEstimada)} (se fija al confirmar)</Texto></li>
                )}
              </ul>
              <div className={estilos.estadoInicial}>
                <Texto variante="cuerpo-s" tono="secundario">Estado inicial:</Texto>
                <InsigniaEstado estado={metodoPago.estadoInicial} />
              </div>
            </Tarjeta>
          </div>
        </div>
        <div className={estilos.lateral}>
          <aside className={estilos.tarjetaResumen} data-compacta="true" aria-labelledby="titulo-total">
            <Texto variante="h3" como="h2" id="titulo-total">Total a pagar</Texto>
            <FilaResumen etiqueta="Piezas" valor={pedido.totalPiezas} />
            <FilaResumen etiqueta="Esquema aplicado" valor={pedido.etiquetaEsquema} />
            <FilaResumen etiqueta="Subtotal a precio Base" valor={formatearMonto(pedido.subtotalPrecioBase)} />
            {pedido.ahorroPorEsquema > 0 && (
              <FilaResumen etiqueta={`Ahorro por ${pedido.etiquetaEsquema}`} valor={formatearDescuento(pedido.ahorroPorEsquema)} tipo="descuento" />
            )}
            {pedido.descuentosCodigo.map((descuento) => (
              <FilaResumen key={descuento.codigo} etiqueta={`Código ${descuento.codigo} · ${descuento.producto}`}
                valor={formatearDescuento(descuento.monto)} tipo="descuento" />
            ))}
            <Divisor />
            <FilaResumen etiqueta="Total" valor={formatearTotal(pedido.total)} tipo="total" />
            <Boton variante="primario" anchoCompleto cargando={procesando} disabled={!pedido.folio}
              icono={<Icono nombre={error ? 'refresh' : 'check'} tamano={18} />} onClick={confirmarPedido}>
              {error ? 'Reintentar' : 'Confirmar pedido'}
            </Boton>
            <Texto variante="mini" como="p" tono="secundario">
              Al confirmar aceptas los Términos y la Política de privacidad. Te enviaremos el folio por WhatsApp.
            </Texto>
          </aside>
        </div>
      </div>
    </PaginaVenta>
  )
}
