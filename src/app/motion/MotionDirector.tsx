/**
 * MotionDirector — entrada al hacer scroll, barra de progreso e inclinación de tarjetas.
 * Solo decorativo: nunca intercepta la navegación, el checkout ni el teclado.
 * Siempre activo (no depende de «reducir movimiento»); no se ejecuta en /admin.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SELECTOR_REVELAR = '[data-fly-reveal]'

export function MotionDirector() {
  const { pathname, key } = useLocation()
  const enAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (enAdmin) return
    const root = document.getElementById('root')
    if (!root) return

    // ---- Entrada de elementos [data-fly-reveal] ----
    const reproducidos = new WeakSet<Element>()
    const animaciones = new Set<Animation>()
    const animar = (el: Element, frames: Keyframe[], opciones: KeyframeAnimationOptions) => {
      if (typeof el.animate !== 'function') return
      const a = el.animate(frames, opciones)
      animaciones.add(a)
      a.onfinish = a.oncancel = () => { animaciones.delete(a) }
    }
    const observador = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(entradas => {
        entradas.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return
          observador?.unobserve(target)
          if (reproducidos.has(target)) return
          reproducidos.add(target)
          target.setAttribute('data-fly-motion-played', 'true')
          const hermanos = Array.from(target.parentElement?.children ?? [])
          animar(target, [
            { opacity: .25, translate: '0 30px', scale: '.975' },
            { opacity: 1, translate: '0 0', scale: '1' },
          ], { duration: 720, delay: Math.min(hermanos.indexOf(target) % 4, 3) * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' })
        })
      }, { threshold: .04 })
      : null
    const escanear = () => {
      if (!observador) return
      root.querySelectorAll(SELECTOR_REVELAR).forEach(el => { if (!reproducidos.has(el)) observador.observe(el) })
    }
    const mutaciones = new MutationObserver(escanear)
    mutaciones.observe(root, { childList: true, subtree: true })
    escanear()

    // ---- Progreso del scroll (--fly-scroll) ----
    let cuadro = 0
    const alDesplazar = () => {
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        document.documentElement.style.setProperty('--fly-scroll', String(max > 0 ? window.scrollY / max : 0))
      })
    }
    window.addEventListener('scroll', alDesplazar, { passive: true })
    alDesplazar()

    // ---- Inclinación de tarjetas (solo mouse) ----
    let activa: HTMLElement | null = null
    const restablecer = () => {
      if (!activa) return
      for (const prop of ['--fly-rx', '--fly-ry', '--fly-glow-x', '--fly-glow-y']) activa.style.removeProperty(prop)
      activa = null
    }
    const alMover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return
      const tarjeta = e.target.closest<HTMLElement>('[data-fly-card]')
      if (tarjeta !== activa) restablecer()
      if (!tarjeta) return
      activa = tarjeta
      const r = tarjeta.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      tarjeta.style.setProperty('--fly-rx', `${(0.5 - y) * 7}deg`)
      tarjeta.style.setProperty('--fly-ry', `${(x - .5) * 7}deg`)
      tarjeta.style.setProperty('--fly-glow-x', `${x * 100}%`)
      tarjeta.style.setProperty('--fly-glow-y', `${y * 100}%`)
    }
    root.addEventListener('pointermove', alMover, { passive: true })
    root.addEventListener('pointerleave', restablecer)

    return () => {
      observador?.disconnect()
      mutaciones.disconnect()
      animaciones.forEach(a => a.cancel())
      cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', alDesplazar)
      root.removeEventListener('pointermove', alMover)
      root.removeEventListener('pointerleave', restablecer)
      restablecer()
    }
  }, [enAdmin, pathname, key])

  return enAdmin ? null : <div className="fly-scroll-progress" aria-hidden="true" />
}
