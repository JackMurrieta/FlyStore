import { Icono, Texto } from '@compartido/ui'
import type { LineaCarritoTs } from '../../dominio/CarritoTs'
import { formatearMonto } from '../formato'
import { FotoProducto } from './Elementos'
import estilos from './venta.module.css'

interface Props {
  readonly linea: LineaCarritoTs
  readonly deshabilitado: boolean
  readonly cambiarCantidad: (varianteProductoId: number, cantidad: number) => void
  readonly solicitarEliminar: (linea: LineaCarritoTs) => void
}

/** «Línea de carrito» del Figma (148:207). Con código aplicado muestra la etiqueta y el subtotal anterior. */
export function LineaCarrito({ linea, deshabilitado, cambiarCantidad, solicitarEliminar }: Props) {
  const codigo = linea.codigoDescuento
  const sinExistencia = linea.existencia !== null && linea.cantidad > linea.existencia
  const tope = linea.existencia !== null && linea.cantidad >= linea.existencia
  return (
    <li data-fly-reveal className={estilos.linea} data-con-codigo={Boolean(codigo)} data-alerta={sinExistencia}>
      <FotoProducto url={linea.imagenUrl} alt={linea.nombre} tamano={88} />
      <div className={estilos.infoLinea}>
        <Texto variante="sobretitulo" tono="secundario">{linea.marca}</Texto>
        <Texto variante="etiqueta-fuerte">{linea.nombre}</Texto>
        <Texto variante="cuerpo-s" tono="secundario">{linea.descripcionVariante}</Texto>
        <Texto variante="cuerpo-s">
          {codigo
            ? `${formatearMonto(linea.precioFinal)} c/u · ${linea.etiquetaEsquema} ${formatearMonto(linea.precioEsquema)} − ${codigo.etiquetaValor}`
            : `${formatearMonto(linea.precioFinal)} c/u · precio ${linea.etiquetaEsquema}`}
        </Texto>
        {codigo && (
          <Texto variante="mini" className={estilos.etiquetaCodigo}>
            <Icono nombre="tag" tamano={12} /> {codigo.codigo} · −{codigo.etiquetaValor} en este producto
          </Texto>
        )}
        {sinExistencia && (
          <Texto variante="mini" className={estilos.ayudaError} role="alert">
            <Icono nombre="alert-circle" tamano={14} />
            Solo quedan {linea.existencia} piezas disponibles
          </Texto>
        )}
      </div>
      <div className={estilos.lineaControles}>
        <div className={estilos.cantidad} role="group" aria-label={`Cantidad de ${linea.nombre}`}>
          <button type="button" aria-label="Quitar una pieza" disabled={deshabilitado || linea.cantidad <= 1}
            onClick={() => cambiarCantidad(linea.varianteProductoId, linea.cantidad - 1)}>
            <Icono nombre="minus" tamano={16} />
          </button>
          <output className="fly-etiqueta-fuerte" aria-live="polite">{linea.cantidad}</output>
          <button type="button" aria-label="Agregar una pieza" disabled={deshabilitado || tope}
            onClick={() => cambiarCantidad(linea.varianteProductoId, linea.cantidad + 1)}>
            <Icono nombre="plus" tamano={16} />
          </button>
        </div>
        <div className={estilos.importe}>
          {codigo && <Texto variante="mini" className={estilos.importeAnterior}>{formatearMonto(linea.subtotalSinCodigo)}</Texto>}
          <Texto variante="precio">{formatearMonto(linea.subtotal)}</Texto>
        </div>
        <button type="button" className={estilos.botonIcono} aria-label={`Eliminar ${linea.nombre}`}
          disabled={deshabilitado} onClick={() => solicitarEliminar(linea)}>
          <Icono nombre="trash" tamano={18} />
        </button>
      </div>
    </li>
  )
}
