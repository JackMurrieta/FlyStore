import { Texto } from '@compartido/ui'
import type { InformacionPedidoTs } from '../../dominio/InformacionPedidoTs'
import { formatearDescuento, formatearMonto, formatearTotal, piezas } from '../formato'
import { Divisor, FilaResumen, FotoProducto } from './Elementos'
import estilos from './venta.module.css'

/** Panel lateral «Tu pedido» (B2, B3, B4, B5, S3). */
export function ResumenPedido({ informacion }: { readonly informacion: InformacionPedidoTs }) {
  return (
    <aside className={estilos.tarjetaResumen} data-compacta="true" aria-labelledby="titulo-tu-pedido">
      <Texto variante="h3" como="h2" id="titulo-tu-pedido">Tu pedido</Texto>
      <ul className={estilos.articulos}>
        {informacion.articulos.map((articulo) => (
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
      <Divisor />
      <FilaResumen etiqueta="Piezas" valor={informacion.totalPiezas} />
      <FilaResumen etiqueta="Esquema aplicado" valor={informacion.etiquetaEsquema} />
      {informacion.ahorroPorEsquema > 0 && (
        <FilaResumen etiqueta={`Ahorro por ${informacion.etiquetaEsquema}`} valor={formatearDescuento(informacion.ahorroPorEsquema)} tipo="descuento" />
      )}
      {informacion.descuentosCodigo.map((descuento) => (
        <FilaResumen key={descuento.codigo} etiqueta={`Código ${descuento.codigo} · ${descuento.producto}`}
          valor={formatearDescuento(descuento.monto)} tipo="descuento" />
      ))}
      <Divisor />
      <FilaResumen etiqueta="Total" valor={formatearTotal(informacion.total)} tipo="total" />
    </aside>
  )
}
