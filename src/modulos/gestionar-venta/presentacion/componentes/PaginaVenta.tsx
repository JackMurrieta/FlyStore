import type { ReactNode } from 'react'
import { Header } from '@compartido/layout/Header'
import { Footer } from '@compartido/layout/Footer'
import { Texto } from '@compartido/ui'
import { PasosCompra, type PasoCompra } from './PasosCompra'
import estilos from './venta.module.css'

interface Props {
  readonly titulo?: string
  readonly subtitulo?: string
  readonly paso?: PasoCompra
  readonly conPie?: boolean
  readonly children: ReactNode
}

/** Estructura común de las pantallas del checkout: encabezado de tienda, títulos y pasos. */
export function PaginaVenta({ titulo, subtitulo, paso, conPie = false, children }: Props) {
  return (
    <div className={estilos.pagina}>
      <Header />
      <main className={estilos.contenido}>
        {(titulo || paso) && (
          <div className={estilos.encabezadoPaso}>
            {titulo && (
              <div className={estilos.titulos}>
                <Texto variante="h1" como="h1">{titulo}</Texto>
                {subtitulo && <Texto variante="cuerpo-s" como="p" tono="secundario">{subtitulo}</Texto>}
              </div>
            )}
            {paso && <PasosCompra actual={paso} />}
          </div>
        )}
        {children}
      </main>
      {conPie && <Footer />}
    </div>
  )
}

export function EstadoCarga({ texto }: { readonly texto: string }) {
  return (
    <div className={estilos.estadoCarga} role="status" aria-live="polite">
      <span className={estilos.spinner} aria-hidden="true" />
      <Texto variante="cuerpo-s">{texto}</Texto>
    </div>
  )
}
