/**
 * AppleMotionDirector — dirección de arte ligada al scroll.
 * Escribe --fly-glass (header), --fly-hero-scroll (hero) y --fly-editorial (encabezados).
 * No intercepta el scroll ni cambia el layout. Siempre activo; no se ejecuta en /admin.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SELECTOR = '[data-fly-cinematic], [data-fly-editorial], [data-fly-glass]'
const PROPIEDADES = ['--fly-glass', '--fly-hero-scroll', '--fly-editorial']

const limitar = (n: number) => Math.min(1, Math.max(0, n))

export function AppleMotionDirector() {
  const { pathname, key } = useLocation()

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root || pathname.startsWith('/admin')) return

    let cuadro = 0
    let nodos: HTMLElement[] = []

    function pintar() {
      cuadro = 0
      const alto = window.innerHeight
      for (const el of nodos) {
        const rect = el.getBoundingClientRect()
        if (el.hasAttribute('data-fly-glass')) {
          el.style.setProperty('--fly-glass', String(limitar(window.scrollY / 100)))
        } else if (el.hasAttribute('data-fly-cinematic')) {
          el.style.setProperty('--fly-hero-scroll', String(limitar(-rect.top / Math.max(1, rect.height))))
        } else {
          el.style.setProperty('--fly-editorial', String(limitar((alto - rect.top) / (alto * .30))))
        }
      }
    }
    function programar() { if (!cuadro) cuadro = requestAnimationFrame(pintar) }
    const refrescar = () => { nodos = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)); programar() }
    const limpiar = () => { for (const el of nodos) for (const prop of PROPIEDADES) el.style.removeProperty(prop) }

    const observador = new MutationObserver(refrescar)
    observador.observe(root, { childList: true, subtree: true })
    window.addEventListener('scroll', programar, { passive: true })
    window.addEventListener('resize', programar, { passive: true })
    refrescar()

    return () => {
      observador.disconnect()
      cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', programar)
      window.removeEventListener('resize', programar)
      limpiar()
    }
  }, [pathname, key])

  return null
}
