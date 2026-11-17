/**
 * CarritoView «ViewComponent» · B1 Revisar pedido, S1 Eliminar, S7 Código aplicado, A3 Carrito vacío, A11.
 * Mensajes que recibe: verCarrito (al montar), continuarConCompra, cambiarCantidad (Alt1), aplicarCodigoDescuento (Alt2).
 */

import { Aviso, Boton, Dialogo, Icono, Texto } from '@compartido/ui'
import { useCarrito } from '../hooks/useCarrito'
import { useNavegacionVenta } from '../hooks/useNavegacionVenta'
import { EstadoCarga, PaginaVenta } from '../componentes/PaginaVenta'
import { LineaCarrito } from '../componentes/LineaCarrito'
import { ResumenCarrito } from '../componentes/ResumenCarrito'
import { FotoProducto } from '../componentes/Elementos'
import { formatearMonto, piezas, productos } from '../formato'
import estilos from '../componentes/venta.module.css'

export default function CarritoView() {
  const carritoVm = useCarrito()
  const navegacion = useNavegacionVenta()
  const { carrito, lineaPorEliminar } = carritoVm

  const continuarConCompra = () => void navegacion.irDatosEntrega()
  const cambiarCantidad = (varianteProductoId: number, cantidad: number) =>
    void carritoVm.actualizarCantidad(varianteProductoId, cantidad)
  const aplicarCodigoDescuento = () => void carritoVm.aplicarCodigoDescuento(carritoVm.codigoCapturado)

  if (carritoVm.cargando) {
    return <PaginaVenta titulo="Tu carrito"><EstadoCarga texto="Cargando tu carrito…" /></PaginaVenta>
  }

  if (!carrito) {
    return (
      <PaginaVenta titulo="Tu carrito">
        <Aviso tono="error" titulo="No pudimos cargar tu carrito">
          {carritoVm.error?.mensaje ?? 'Inténtalo de nuevo en un momento.'}
        </Aviso>
        <div><Boton variante="secundario" icono={<Icono nombre="refresh" tamano={18} />} onClick={() => void carritoVm.cargarCarrito()}>Reintentar</Boton></div>
      </PaginaVenta>
    )
  }

  if (carrito.vacio) {
    return (
      <PaginaVenta titulo="Tu carrito">
        <section className={estilos.vacio} aria-labelledby="titulo-vacio">
          <span className={estilos.iconoCirculo}><Icono nombre="cart" tamano={28} /></span>
          <Texto variante="h2" como="h2" id="titulo-vacio">Tu carrito está vacío</Texto>
          <Texto variante="cuerpo-s" como="p" tono="secundario">
            Explora gorras, ropa, perfumes y tenis. Entre más piezas lleves, mejor precio.
          </Texto>
          <Boton variante="primario" icono={<Icono nombre="arrow-right" tamano={18} />} onClick={navegacion.irCatalogo}>
            Ir al catálogo
          </Boton>
        </section>
      </PaginaVenta>
    )
  }

  const { esquema } = carrito
  const esquemaEspecial = esquema.tipoPrecio !== 'BASE'
  return (
    <PaginaVenta titulo="Tu carrito" subtitulo={`${productos(carrito.totalProductos)} · ${piezas(carrito.totalPiezas)}`} paso={1}>
      <div className={estilos.columnas}>
        <div className={estilos.principal}>
          {carritoVm.error && <Aviso tono="error" titulo="Ajusta tu carrito para continuar">{carritoVm.error.mensaje}</Aviso>}
          {!carritoVm.error && esquemaEspecial && (
            <Aviso tono="exito" titulo={`¡Ya aplicaste el precio ${esquema.etiqueta}!`}>
              Con {piezas(carrito.totalPiezas)} todo tu pedido se cobra a precio {esquema.etiqueta}.
              {esquema.siguiente && ` Agrega ${piezas(esquema.siguiente.piezasFaltantes)} más para precio ${esquema.siguiente.etiqueta}.`}
            </Aviso>
          )}
          {!carritoVm.error && !esquemaEspecial && esquema.siguiente && (
            <Aviso tono="info" titulo="Precio por volumen">
              Agrega {piezas(esquema.siguiente.piezasFaltantes)} más para precio {esquema.siguiente.etiqueta}.
            </Aviso>
          )}
          <div className={`${estilos.encabezadoTabla} fly-sobretitulo`} aria-hidden="true">
            <span>Producto</span>
            <div><span>Cantidad</span><span>Subtotal</span></div>
          </div>
          <ul className={estilos.lineas} aria-label="Productos en tu carrito">
            {carrito.lineas.map((linea) => (
              <LineaCarrito key={linea.idDetalle} linea={linea} deshabilitado={carritoVm.actualizando}
                cambiarCantidad={cambiarCantidad} solicitarEliminar={carritoVm.solicitarEliminar} />
            ))}
          </ul>
        </div>
        <div className={estilos.lateral}>
          <ResumenCarrito carrito={carrito} codigo={carritoVm.codigoCapturado} errorCodigo={carritoVm.errorCodigo}
            actualizando={carritoVm.actualizando} continuando={navegacion.navegando}
            capturarCodigo={carritoVm.capturarCodigo} aplicarCodigoDescuento={aplicarCodigoDescuento}
            continuarConCompra={continuarConCompra} seguirComprando={navegacion.irCatalogo} />
        </div>
      </div>

      <Dialogo abierto={Boolean(lineaPorEliminar)} alCerrar={carritoVm.cancelarEliminar}
        titulo="¿Eliminar este producto?" icono="trash" tonoIcono="peligro" alineacion="izquierda">
        {lineaPorEliminar && (
          <div className={estilos.principal}>
            <Texto variante="cuerpo" como="p" tono="secundario">
              Se quitará de tu carrito y recalcularemos el esquema de compra y el total.
            </Texto>
            <div className={estilos.archivo}>
              <FotoProducto url={lineaPorEliminar.imagenUrl} alt="" tamano={48} />
              <div>
                <Texto variante="etiqueta-fuerte">{lineaPorEliminar.nombre}</Texto>
                <Texto variante="mini" tono="secundario">
                  {piezas(lineaPorEliminar.cantidad)} · {formatearMonto(lineaPorEliminar.subtotal)}
                </Texto>
              </div>
            </div>
            <Aviso tono="advertencia">
              Al quitarlo tendrás {piezas(carrito.totalPiezas - lineaPorEliminar.cantidad)} en tu carrito.
            </Aviso>
            <div className={estilos.acciones}>
              <span className={estilos.espaciador} />
              <Boton variante="secundario" onClick={carritoVm.cancelarEliminar}>Cancelar</Boton>
              <Boton variante="peligroSolido" icono={<Icono nombre="trash" tamano={18} />}
                cargando={carritoVm.actualizando} onClick={() => void carritoVm.confirmarEliminar()}>
                Eliminar
              </Boton>
            </div>
          </div>
        )}
      </Dialogo>
    </PaginaVenta>
  )
}
