/**
 * Estados del catálogo: A2 búsqueda sin resultados, A3 filtros sin coincidencias, A4 error al cargar,
 * línea sin productos y A6 fin del catálogo.
 */

import type { ReactNode } from 'react'
import { Icono, type NombreIcono } from '@compartido/ui'
import estilos from './tienda.module.css'

interface EstadoProps {
  readonly icono: NombreIcono
  readonly titulo: string
  readonly children: ReactNode
  readonly acciones?: ReactNode
  readonly rol?: 'status' | 'alert'
}

export function EstadoCatalogo({ icono, titulo, children, acciones, rol = 'status' }: EstadoProps) {
  return (
    <section className={estilos.estado} role={rol}>
      <span className={estilos.estadoIcono} aria-hidden="true"><Icono nombre={icono} tamano={24} /></span>
      <h2>{titulo}</h2>
      <p>{children}</p>
      {acciones && <div className={estilos.estadoAcciones}>{acciones}</div>}
    </section>
  )
}

/** A4 · Error de conexión o de base de datos, con «Reintentar». */
export function ErrorCatalogo({ mensaje, alReintentar }: { readonly mensaje: string; readonly alReintentar: () => void }) {
  return (
    <EstadoCatalogo icono="wifi-off" titulo="Catálogo no disponible" rol="alert"
      acciones={<button type="button" className={estilos.botonSecundario} onClick={alReintentar}><Icono nombre="refresh" tamano={18} /> Reintentar</button>}>
      No fue posible cargar los productos. {mensaje}
    </EstadoCatalogo>
  )
}
