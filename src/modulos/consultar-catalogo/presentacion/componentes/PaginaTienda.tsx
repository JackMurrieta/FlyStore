import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@compartido/layout/Header'
import { Footer } from '@compartido/layout/Footer'
import { Icono } from '@compartido/ui'
import estilos from './tienda.module.css'

export interface Miga {
  readonly etiqueta: string
  readonly ruta?: string
}

/** Marco de las páginas de la tienda: encabezado, migas, contenido y pie. */
export function PaginaTienda({ migas = [], children }: { readonly migas?: readonly Miga[]; readonly children: ReactNode }) {
  return (
    <div className={estilos.pagina}>
      <Header />
      <main className={estilos.contenido}>
        {migas.length > 0 && <Migas migas={migas} />}
        {children}
      </main>
      <Footer />
    </div>
  )
}

export function Migas({ migas }: { readonly migas: readonly Miga[] }) {
  return (
    <nav aria-label="Ruta de navegación" className={estilos.migas}>
      <Link to="/">Inicio</Link>
      {migas.map((miga, indice) => (
        <span key={`${miga.etiqueta}-${indice}`} style={{ display: 'contents' }}>
          <Icono nombre="chevron-right" tamano={14} />
          {miga.ruta && indice < migas.length - 1
            ? <Link to={miga.ruta}>{miga.etiqueta}</Link>
            : <span aria-current="page">{miga.etiqueta}</span>}
        </span>
      ))}
    </nav>
  )
}
