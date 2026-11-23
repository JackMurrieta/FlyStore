import type { ReactNode } from 'react'
import { Header } from '@compartido/layout/Header'
import { Footer } from '@compartido/layout/Footer'
import { Texto } from '@compartido/ui'
import estilos from './informacion.module.css'

export interface SeccionInformativa {
  readonly id: string
  readonly titulo: string
  readonly contenido: ReactNode
}

interface Props {
  readonly sobretitulo: string
  readonly titulo: string
  readonly introduccion: ReactNode
  /** «21 de noviembre de 2026». */
  readonly actualizado?: string
  readonly secciones: readonly SeccionInformativa[]
}

/**
 * Plantilla de las páginas públicas de información (Privacidad, Términos y Preguntas frecuentes):
 * índice «En esta página» fijo en escritorio y secciones con ancla para enlazarlas directamente.
 */
export function PaginaInformativa({ sobretitulo, titulo, introduccion, actualizado, secciones }: Props) {
  return (
    <div className={estilos.pagina}>
      <Header />
      <main className={estilos.contenido} id="contenido">
        <header className={estilos.encabezado}>
          <Texto variante="sobretitulo" tono="secundario">{sobretitulo}</Texto>
          <Texto variante="h1" como="h1">{titulo}</Texto>
          <div className={estilos.introduccion}>{introduccion}</div>
          {actualizado && <Texto variante="mini" tono="secundario">Última actualización: {actualizado}</Texto>}
        </header>

        <div className={estilos.columnas}>
          <nav className={estilos.indice} aria-labelledby="titulo-indice">
            <Texto variante="sobretitulo" tono="secundario" id="titulo-indice">En esta página</Texto>
            <ol>
              {secciones.map((seccion) => (
                <li key={seccion.id}><a href={`#${seccion.id}`}>{seccion.titulo}</a></li>
              ))}
            </ol>
          </nav>

          <div className={estilos.cuerpo}>
            {secciones.map((seccion) => (
              <section key={seccion.id} id={seccion.id} className={estilos.seccion} aria-labelledby={`${seccion.id}-titulo`}>
                <h2 id={`${seccion.id}-titulo`} className="fly-h2">{seccion.titulo}</h2>
                <div className={estilos.texto}>{seccion.contenido}</div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
