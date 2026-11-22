import { useEffect, useRef } from 'react'
import { Icono } from '@compartido/ui'
import { productos as textoProductos } from '../formato'
import estilos from './tienda.module.css'

export interface VerMasProps {
  readonly mostrados: number
  readonly total: number
  readonly hayMas: boolean
  readonly cargando: boolean
  readonly error: string | null
  readonly alCargarMas: () => void
}

/**
 * S3 · «Mostrando 30 de 48» con su barra, «Ver más productos» y carga automática al llegar al final.
 * A6 · Cuando ya no hay más: «Ya viste todo el catálogo de esta sección».
 */
export function VerMas({ mostrados, total, hayMas, cargando, error, alCargarMas }: VerMasProps) {
  const centinela = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nodo = centinela.current
    if (!nodo || !hayMas || cargando || error || typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(entradas => {
      if (entradas.some(e => e.isIntersecting)) alCargarMas()
    }, { rootMargin: '480px 0px' })
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [hayMas, cargando, error, alCargarMas])

  if (total === 0) return null
  const porcentaje = Math.min(100, Math.round((mostrados / total) * 100))

  return (
    <div className={estilos.mas}>
      <div ref={centinela} aria-hidden="true" />
      <span className={estilos.masTexto} aria-live="polite">
        Mostrando {mostrados.toLocaleString('es-MX')} de {textoProductos(total)}
      </span>
      <span className={estilos.progreso} aria-hidden="true"><span style={{ width: `${porcentaje}%` }} /></span>
      {error && <span className={estilos.errorCampo} role="alert">{error}</span>}
      {hayMas ? (
        <button type="button" className={estilos.botonSecundario} onClick={alCargarMas} disabled={cargando} aria-busy={cargando}>
          <Icono nombre={cargando ? 'refresh' : 'chevron-down'} tamano={18} />
          {cargando ? `Cargando ${Math.min(30, total - mostrados)} productos más…` : error ? 'Reintentar' : 'Ver más productos'}
        </button>
      ) : (
        <span className={estilos.fin}><Icono nombre="check-circle" tamano={16} /> Ya viste todo el catálogo de esta sección</span>
      )}
    </div>
  )
}
