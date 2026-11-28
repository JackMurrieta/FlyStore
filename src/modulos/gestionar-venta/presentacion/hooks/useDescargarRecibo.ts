/**
 * useDescargarRecibo · descarga el recibo del pedido (TicketPedido) como imagen PNG.
 * Lo usan B7 «Pedido registrado» y el diálogo «Ver recibo» de Mis pedidos.
 *
 * html-to-image copia el recibo tal como se ve (fuentes de la página incluidas) y lo convierte
 * en PNG. La librería se carga solo al descargar. Si una foto de producto no se puede copiar
 * (CORS), se pinta un cuadro gris en su lugar para que la descarga no falle.
 */

import { useCallback, useRef, useState } from 'react'

/** Cuadro gris (#ededeb, el fondo de las fotos) para fotos que no se pueden copiar. */
const FOTO_DE_RESPALDO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#ededeb"/></svg>')

/** Atributo que congela las animaciones del recibo mientras se copia (ver ticket.module.css). */
const ATRIBUTO_CAPTURA = 'data-capturando'

export function useDescargarRecibo() {
  const referencia = useRef<HTMLElement>(null)
  const [descargando, setDescargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Descarga «FLY-000128.png» (o «recibo-fly.png» sin folio). */
  const descargar = useCallback(async (folio: string | null) => {
    const nodo = referencia.current
    if (!nodo) return
    setDescargando(true)
    setError(null)
    nodo.setAttribute(ATRIBUTO_CAPTURA, 'true')
    try {
      const { toPng } = await import('html-to-image')
      const imagen = await toPng(nodo, {
        pixelRatio: Math.max(2, Math.min(3, window.devicePixelRatio || 1)),
        cacheBust: true,
        imagePlaceholder: FOTO_DE_RESPALDO,
      })
      const enlace = document.createElement('a')
      enlace.href = imagen
      enlace.download = `${folio ?? 'recibo-fly'}.png`
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
    } catch {
      setError('No pudimos descargar tu recibo. Inténtalo de nuevo.')
    } finally {
      nodo.removeAttribute(ATRIBUTO_CAPTURA)
      setDescargando(false)
    }
  }, [])

  return { referencia, descargar, descargando, error }
}
