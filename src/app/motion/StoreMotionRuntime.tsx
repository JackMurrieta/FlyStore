/**
 * StoreMotionRuntime — efectos sobre la tienda ya renderizada (incluye rutas que cargan después).
 *  · Entrada de títulos, secciones, tarjetas, foto del producto y diálogos.
 *  · Cifras que cambian ([data-fly-counter], [data-fly-scheme]) se animan.
 *  · Resorte al seleccionar (aria-pressed=true o aria-current=step).
 * Sin efecto al presionar (se eliminó el encogimiento). Siempre activo; no se ejecuta en /admin.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SELECTOR_REVELAR = 'main h1, main h2, main [data-fly-section]:not(:first-child), main [data-fly-card], main [data-fly-product-stage], [role="dialog"], [data-fly-reveal]'
const SELECTOR_CIFRAS = '[data-fly-counter], main [aria-live="polite"] strong, [data-fly-scheme]'

export function StoreMotionRuntime() {
  const { pathname, key } = useLocation()

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root || pathname.startsWith('/admin')) return

    const enCurso = new Set<Animation>()
    const vigilados = new WeakSet<Element>()
    const reproducidos = new WeakSet<Element>()
    const valores = new WeakMap<Element, string>()

    const animar = (el: Element, frames: Keyframe[], duracion = 480, retraso = 0) => {
      if (typeof el.animate !== 'function') return
      try {
        const a = el.animate(frames, { duration: duracion, delay: retraso, easing: 'cubic-bezier(.18,.8,.2,1)', fill: 'none' })
        enCurso.add(a)
        a.finished.then(() => enCurso.delete(a), () => enCurso.delete(a))
      } catch { /* el navegador no soporta la animación: se omite */ }
    }
    const revelar = (el: Element) => {
      if (reproducidos.has(el)) return
      reproducidos.add(el)
      const i = Array.from(el.parentElement?.children ?? []).indexOf(el)
      animar(el, [{ opacity: .35, translate: '0 24px' }, { opacity: 1, translate: '0 0' }], 650, Math.max(0, i % 5) * 55)
      el.setAttribute('data-fly-motion-played', 'true')
    }
    const observador = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
          if (!entrada.isIntersecting) return
          observador?.unobserve(entrada.target)
          revelar(entrada.target)
        })
      }, { threshold: .04 })
      : null

    const escanear = () => {
      root.querySelectorAll(SELECTOR_REVELAR).forEach(el => {
        // [data-fly-reveal] lo anima MotionDirector: no competir.
        if (el.hasAttribute('data-fly-reveal') || vigilados.has(el)) return
        vigilados.add(el)
        if (observador) observador.observe(el)
        else revelar(el)
      })
      root.querySelectorAll(SELECTOR_CIFRAS).forEach(el => {
        const siguiente = el.textContent ?? ''
        const anterior = valores.get(el)
        valores.set(el, siguiente)
        if (anterior !== undefined && anterior !== siguiente) {
          animar(el, [{ opacity: .25, translate: '0 9px', scale: '.96' }, { opacity: 1, translate: '0 0', scale: '1' }], 420)
        }
      })
    }

    let cuadro = 0
    const encolar = () => { if (!cuadro) cuadro = requestAnimationFrame(() => { cuadro = 0; escanear() }) }
    const mutaciones = new MutationObserver(registros => {
      for (const registro of registros) {
        if (registro.type !== 'attributes' || !(registro.target instanceof HTMLElement)) continue
        const el = registro.target
        const seleccionado = registro.attributeName === 'aria-pressed' && el.getAttribute('aria-pressed') === 'true'
        const paso = registro.attributeName === 'aria-current' && el.getAttribute('aria-current') === 'step'
        if (seleccionado || paso) animar(el, [{ scale: '.94' }, { scale: '1.045', offset: .55 }, { scale: '1' }], 400)
      }
      encolar()
    })
    mutaciones.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-current', 'aria-expanded'] })
    escanear()

    return () => {
      observador?.disconnect()
      mutaciones.disconnect()
      cancelAnimationFrame(cuadro)
      enCurso.forEach(a => a.cancel())
    }
  }, [pathname, key])

  return null
}
