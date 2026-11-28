/**
 * Tarjeta de producto del catálogo (Figma B3) con sus colores abajo, como en adidas: al pasar el mouse
 * por un color la foto cambia a ese color; en el celular se toca. El color elegido se lleva a la ficha.
 * Si se filtró por color, la tarjeta abre en ese color (`idColorDestacado`) y lo lleva a la ficha.
 */

import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Icono } from '@compartido/ui'
import type { ColorTarjetaTs, ProductoTarjetaTs } from '../../dominio/CatalogoTs'
import { rutasTienda } from '../rutasTienda'
import { colores as textoColores, formatearPrecio } from '../formato'
import estilos from './tarjeta.module.css'

/** Cuadritos visibles; el resto se resume en «+N». */
const MAX_COLORES = 5

export interface TarjetaProductoProps {
  readonly producto: ProductoTarjetaTs
  /** Posición en la cuadrícula: escalona la animación de entrada. */
  readonly indice?: number
}

export function TarjetaProducto({ producto, indice = 0 }: TarjetaProductoProps) {
  const [elegido, setElegido] = useState<ColorTarjetaTs | null>(null)
  const [vista, setVista] = useState<ColorTarjetaTs | null>(null)

  const destacado = producto.colores.find(color => color.idColor === producto.idColorDestacado) ?? null
  const seleccionado = elegido ?? destacado
  const mostrado = vista ?? seleccionado
  const foto = mostrado?.imagenUrl ?? producto.imagenUrl
  const destino = rutasTienda.producto(producto.id, mostrado?.idColor ?? null)
  const visibles = producto.colores.slice(0, MAX_COLORES)
  const ocultos = producto.colores.length - visibles.length
  const estilo = { '--retraso': `${Math.min(indice % 30, 12) * 45}ms` } as CSSProperties

  return (
    <article data-fly-card data-fly-reveal className={estilos.tarjeta} style={estilo} aria-label={producto.nombre}>
      <Link viewTransition to={destino} className={estilos.foto} tabIndex={-1} aria-hidden="true">
        {foto ? (
          <img key={foto} src={foto} alt="" loading="lazy" decoding="async" className={estilos.imagen} />
        ) : (
          <span className={estilos.sinFoto} style={mostrado?.hex ? { background: mostrado.hex } : undefined}>
            <Icono nombre="image" tamano={28} />
          </span>
        )}
      </Link>

      {producto.colores.length > 1 && (
        <div className={estilos.variantes} role="group" aria-label={`Colores de ${producto.nombre}`}
          onMouseLeave={() => setVista(null)}>
          {visibles.map(color => {
            const activo = (mostrado ?? producto.colores[0])?.idColor === color.idColor
            return (
              <button
                key={color.idColor}
                type="button"
                className={`${estilos.variante} ${activo ? estilos.varianteActiva : ''}`}
                aria-pressed={seleccionado?.idColor === color.idColor}
                aria-label={`Ver en ${color.nombre}`}
                title={color.nombre}
                onMouseEnter={() => setVista(color)}
                onFocus={() => setVista(color)}
                onBlur={() => setVista(null)}
                onClick={() => setElegido(color)}
              >
                {color.imagenUrl
                  ? <img src={color.imagenUrl} alt="" loading="lazy" decoding="async" />
                  : <span className={estilos.muestra} style={{ background: color.hex ?? 'var(--fly-borde-control)' }} />}
              </button>
            )
          })}
          {ocultos > 0 && (
            <Link viewTransition to={destino} className={estilos.masColores} aria-label={`Ver los ${producto.colores.length} colores`}>
              +{ocultos}
            </Link>
          )}
        </div>
      )}

      <Link viewTransition to={destino} className={estilos.info}>
        <span className={estilos.marca}>{producto.marca}</span>
        <span className={estilos.nombre}>{producto.nombre}</span>
        {producto.precio && (
          <span className={estilos.precio}>
            <strong>{formatearPrecio(producto.precio.precio)}</strong>
            <span className={estilos.esquema}>MXN · {producto.precio.etiqueta}</span>
          </span>
        )}
        {producto.colores.length > 0 && (
          <span className={estilos.conteoColores}>
            {mostrado ? mostrado.nombre : textoColores(producto.colores.length)}
          </span>
        )}
      </Link>
    </article>
  )
}

/** Marcador de carga con la misma forma que la tarjeta. */
export function TarjetaCargando({ indice = 0 }: { readonly indice?: number }) {
  return (
    <div className={estilos.cargando} style={{ '--retraso': `${indice * 60}ms` } as CSSProperties} aria-hidden="true">
      <span className={estilos.cargandoFoto} />
      <span className={estilos.cargandoLinea} style={{ width: '36%' }} />
      <span className={estilos.cargandoLinea} style={{ width: '78%' }} />
      <span className={estilos.cargandoLinea} style={{ width: '44%' }} />
    </div>
  )
}
