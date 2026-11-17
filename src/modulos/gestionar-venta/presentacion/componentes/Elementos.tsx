/** Piezas pequeñas compartidas por las vistas del CU-02. */

import type { ReactNode } from 'react'
import { Icono, Insignia, Texto, type NombreIcono } from '@compartido/ui'
import type { EstadoPedidoTs } from '../../dominio/EstadoVenta'
import estilos from './venta.module.css'

const ICONO_TONO: Record<EstadoPedidoTs['tono'], NombreIcono> = {
  neutro: 'info',
  info: 'info',
  advertencia: 'clock',
  exito: 'check-circle',
  error: 'ban',
}

/** Insignia de estado: color + ícono + texto, nunca solo color. */
export function InsigniaEstado({ estado, icono }: { readonly estado: Pick<EstadoPedidoTs, 'etiqueta' | 'tono'>; readonly icono?: NombreIcono }) {
  return (
    <Insignia tono={estado.tono}>
      <span className={estilos.contenidoInsignia}>
        <Icono nombre={icono ?? ICONO_TONO[estado.tono]} tamano={14} />
        {estado.etiqueta}
      </span>
    </Insignia>
  )
}

/** Foto del producto (dato del backend). Sin imagen: fondo de superficie con ícono. */
export function FotoProducto({ url, alt, tamano }: { readonly url: string | null; readonly alt: string; readonly tamano: number }) {
  return (
    <span className={estilos.foto} style={{ width: tamano, height: tamano }}>
      {url ? <img src={url} alt={alt} loading="lazy" /> : <Icono nombre="package" tamano={Math.round(tamano / 3)} aria-label={alt} />}
    </span>
  )
}

type TipoFila = 'normal' | 'descuento' | 'total'

/** «Fila de resumen» del Figma (146:272): Normal, Descuento y Total. */
export function FilaResumen({ etiqueta, valor, tipo = 'normal' }: { readonly etiqueta: ReactNode; readonly valor: ReactNode; readonly tipo?: TipoFila }) {
  if (tipo === 'total') {
    return (
      <div className={estilos.filaTotal}>
        <Texto variante="h3">{etiqueta}</Texto>
        <Texto variante="precio-l">{valor}</Texto>
      </div>
    )
  }
  return (
    <div className={estilos.fila}>
      <Texto variante="cuerpo-s" tono="secundario">{etiqueta}</Texto>
      <Texto variante="etiqueta-fuerte" className={tipo === 'descuento' ? estilos.filaDescuento : undefined}>{valor}</Texto>
    </div>
  )
}

export function Divisor() {
  return <div className={estilos.divisor} role="presentation" />
}

/** Tarjeta de sección con título h3, subtítulo y acción opcional (Editar, Cambiar…). */
export function Tarjeta({ titulo, subtitulo, accion, children, etiquetaId }: {
  readonly titulo: string
  readonly subtitulo?: ReactNode
  readonly accion?: ReactNode
  readonly children: ReactNode
  readonly etiquetaId?: string
}) {
  return (
    <section className={estilos.tarjeta} aria-labelledby={etiquetaId}>
      <div className={estilos.encabezadoTarjeta}>
        <div>
          <Texto variante="h3" como="h2" id={etiquetaId}>{titulo}</Texto>
          {subtitulo && <Texto variante="cuerpo-s" como="p" tono="secundario">{subtitulo}</Texto>}
        </div>
        {accion}
      </div>
      {children}
    </section>
  )
}

/** Caja de fecha límite (S3 y B5). */
export function CajaFecha({ icono, etiqueta, fecha, estado }: {
  readonly icono: NombreIcono
  readonly etiqueta: string
  readonly fecha: string
  readonly estado: Pick<EstadoPedidoTs, 'etiqueta' | 'tono'>
}) {
  return (
    <div className={estilos.cajaFecha}>
      <Icono nombre={icono} tamano={28} />
      <div>
        <Texto variante="cuerpo-s" tono="secundario">{etiqueta}</Texto>
        <Texto variante="h3">{fecha}</Texto>
      </div>
      <InsigniaEstado estado={estado} />
    </div>
  )
}
