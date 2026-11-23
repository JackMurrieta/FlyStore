import { Boton, Icono, Insignia, Texto } from '@compartido/ui'
import type { CarritoTs } from '../../dominio/CarritoTs'
import { etiquetaAhorro, formatearDescuento, formatearMonto, formatearTotal, piezas } from '../formato'
import { CodigoDescuento } from './CodigoDescuento'
import { Divisor, FilaResumen } from './Elementos'
import estilos from './venta.module.css'

interface Props {
  readonly carrito: CarritoTs
  readonly codigo: string
  readonly errorCodigo: string | null
  readonly actualizando: boolean
  readonly continuando: boolean
  readonly capturarCodigo: (valor: string) => void
  readonly aplicarCodigoDescuento: () => void
  readonly continuarConCompra: () => void
  readonly seguirComprando: () => void
}

/** «Resumen del pedido» de B1 y S7. */
export function ResumenCarrito(props: Props) {
  const { carrito } = props
  const { esquema } = carrito
  return (
    <aside className={estilos.tarjetaResumen} aria-labelledby="titulo-resumen">
      <Texto variante="h3" como="h2" id="titulo-resumen">Resumen del pedido</Texto>
      <div className={estilos.esquema}>
        <div className={estilos.fila}>
          <Texto variante="cuerpo-s" tono="secundario">Esquema aplicado</Texto>
          <Insignia tono="neutro">
            <span className={`${estilos.contenidoInsignia} ${estilos.insigniaEsquema}`}>
              <span className={estilos.punto} aria-hidden="true" />{esquema.etiqueta} · {esquema.rango}
            </span>
          </Insignia>
        </div>
        {!esquema.porProducto && (
          <div className={estilos.progreso} role="progressbar" aria-label="Avance al siguiente esquema de precio"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(esquema.progreso * 100)}>
            <span style={{ width: `${esquema.progreso * 100}%` }} />
          </div>
        )}
        <Texto variante="mini" tono="secundario" como="p">
          {esquema.porProducto
            ? 'Con varios productos, cada uno se cobra según sus propias piezas. Revisa el precio de cada uno en tu carrito.'
            : esquema.siguiente
              ? `Te ${esquema.siguiente.piezasFaltantes === 1 ? 'falta' : 'faltan'} ${piezas(esquema.siguiente.piezasFaltantes)} para precio ${esquema.siguiente.etiqueta}${esquema.siguiente.minPiezas ? ` (${esquema.siguiente.minPiezas}+)` : ''}.`
              : `Ya tienes el mejor precio: ${esquema.etiqueta}.`}
        </Texto>
      </div>
      <FilaResumen etiqueta="Piezas" valor={carrito.totalPiezas} />
      <FilaResumen etiqueta="Subtotal a precio Base" valor={formatearMonto(carrito.subtotalPrecioBase)} />
      {carrito.ahorroPorEsquema > 0 && (
        <FilaResumen etiqueta={etiquetaAhorro(esquema.etiqueta)} valor={formatearDescuento(carrito.ahorroPorEsquema)} tipo="descuento" />
      )}
      {carrito.descuentosCodigo.map((descuento, indice) => (
        <FilaResumen key={`${descuento.codigo}-${indice}`} etiqueta={`Código ${descuento.codigo} · ${descuento.producto}`}
          valor={formatearDescuento(descuento.monto)} tipo="descuento" />
      ))}
      <Divisor />
      <CodigoDescuento valor={props.codigo} aplicados={carrito.descuentosCodigo} error={props.errorCodigo}
        aplicando={props.actualizando} capturar={props.capturarCodigo} aplicar={props.aplicarCodigoDescuento} />
      <Divisor />
      <FilaResumen etiqueta="Total" valor={formatearTotal(carrito.total)} tipo="total" />
      <Boton variante="primario" anchoCompleto icono={<Icono nombre="arrow-right" tamano={18} />}
        cargando={props.continuando} disabled={carrito.vacio || props.actualizando} onClick={props.continuarConCompra}>
        Continuar con la compra
      </Boton>
      <Boton variante="fantasma" anchoCompleto onClick={props.seguirComprando}>Seguir comprando</Boton>
      <Texto variante="mini" como="p" className={estilos.notaSegura}>
        <Icono nombre="lock" tamano={14} /> Tu carrito se guarda en tu cuenta.
      </Texto>
    </aside>
  )
}
