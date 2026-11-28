/**
 * SharedProductMotion — continuidad de la foto al abrir un producto:
 * la foto de la tarjeta viaja hasta la foto principal de /producto/:id.
 * Funciona también en navegadores sin View Transition API (Safari).
 * Si la API tarda o la navegación falla, la copia se retira a los 1.3 s.
 */

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

interface FotoPendiente {
  readonly imagen: HTMLImageElement
  readonly id: string
  readonly inicio: DOMRect
  temporizador: number
  animacion?: Animation
}

const RUTA_PRODUCTO = /^\/producto\/(\d+)\/?(?:[?#].*)?$/

export function SharedProductMotion() {
  const location = useLocation()
  const rutaActual = useRef(location.pathname)

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    let pendiente: FotoPendiente | null = null
    let cuadro = 0

    const limpiar = () => {
      const anterior = pendiente
      pendiente = null
      if (!anterior) return
      clearTimeout(anterior.temporizador)
      anterior.animacion?.cancel()
      anterior.imagen.remove()
    }
    const transferir = () => {
      cuadro = 0
      const item = pendiente
      if (!item || item.animacion) return
      if (rutaActual.current.replace(/\/$/, '') !== `/producto/${item.id}`) return
      const destino = root.querySelector<HTMLImageElement>('[data-fly-product-stage] > img')
      if (!destino || !destino.complete || !destino.naturalWidth) return
      const rect = destino.getBoundingClientRect()
      if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > innerHeight) { limpiar(); return }
      const inicio = item.inicio
      item.animacion = item.imagen.animate([
        { transform: 'translate(0px,0px) scale(1,1)', opacity: 1, borderRadius: '12px' },
        { transform: `translate(${rect.left - inicio.left}px,${rect.top - inicio.top}px) scale(${rect.width / inicio.width},${rect.height / inicio.height})`, opacity: 0, borderRadius: '10px' },
      ], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' })
      item.animacion.finished.then(() => { if (pendiente === item) limpiar() }, () => { if (pendiente === item) limpiar() })
    }
    const programar = () => { if (pendiente && !cuadro) cuadro = requestAnimationFrame(transferir) }

    const capturar = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || !(event.target instanceof Element)) return
      const enlace = event.target.closest<HTMLAnchorElement>('a[href]')
      const tarjeta = enlace?.closest('[data-fly-card]')
      const foto = tarjeta?.querySelector<HTMLImageElement>('img')
      const coincide = enlace?.getAttribute('href')?.match(RUTA_PRODUCTO)
      if (!coincide?.[1] || !foto?.complete || !foto.naturalWidth || typeof foto.animate !== 'function' || enlace?.target === '_blank') return
      const inicio = foto.getBoundingClientRect()
      if (!inicio.width || !inicio.height) return
      limpiar()
      const imagen = document.createElement('img')
      imagen.src = foto.currentSrc || foto.src
      imagen.alt = ''
      imagen.setAttribute('aria-hidden', 'true')
      imagen.style.cssText = `position:fixed;left:${inicio.left}px;top:${inicio.top}px;width:${inicio.width}px;height:${inicio.height}px;object-fit:cover;transform-origin:top left;border-radius:12px;z-index:1400;pointer-events:none;`
      document.body.appendChild(imagen)
      const item: FotoPendiente = { imagen, id: coincide[1], inicio, temporizador: 0 }
      pendiente = item
      item.temporizador = window.setTimeout(() => { if (pendiente === item) limpiar() }, 1300)
      programar()
    }

    const observador = new MutationObserver(programar)
    observador.observe(root, { childList: true, subtree: true })
    root.addEventListener('click', capturar, true)
    root.addEventListener('load', programar, true)
    window.addEventListener('popstate', programar)
    window.addEventListener('fly:route-ready', programar)

    return () => {
      observador.disconnect()
      root.removeEventListener('click', capturar, true)
      root.removeEventListener('load', programar, true)
      window.removeEventListener('popstate', programar)
      window.removeEventListener('fly:route-ready', programar)
      cancelAnimationFrame(cuadro)
      limpiar()
    }
  }, [])

  // Avisa aunque la ruta se sirva al instante desde caché.
  useEffect(() => {
    rutaActual.current = location.pathname
    window.dispatchEvent(new Event('fly:route-ready'))
  }, [location.key, location.pathname])

  return null
}
