/**
 * UltraMotionDirector — efecto magnético en [data-fly-magnetic] (solo mouse).
 * La animación de la foto «volando» al carrito se eliminó: ahora el botón
 * «Agregar al carrito» tiene su propia animación y el header muestra un contador.
 * Siempre activo; no se ejecuta en /admin.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function UltraMotionDirector() {
  const { pathname, key } = useLocation()

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root || pathname.startsWith('/admin')) return

    let magnetico: HTMLElement | null = null
    const restablecer = () => {
      magnetico?.style.removeProperty('--fly-mx')
      magnetico?.style.removeProperty('--fly-my')
      magnetico = null
    }
    const alMover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return
      const el = e.target.closest<HTMLElement>('[data-fly-magnetic]')
      if (el !== magnetico) restablecer()
      if (!el) return
      magnetico = el
      const r = el.getBoundingClientRect()
      el.style.setProperty('--fly-mx', `${(e.clientX - r.left - r.width / 2) * .09}px`)
      el.style.setProperty('--fly-my', `${(e.clientY - r.top - r.height / 2) * .12}px`)
    }
    root.addEventListener('pointermove', alMover, { passive: true })
    root.addEventListener('pointerleave', restablecer)

    return () => {
      root.removeEventListener('pointermove', alMover)
      root.removeEventListener('pointerleave', restablecer)
      restablecer()
    }
  }, [pathname, key])

  return null
}
