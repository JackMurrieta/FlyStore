/** Copiar al portapapeles con confirmación breve («Copiado»). Solo estado de interfaz. */

import { useEffect, useRef, useState } from 'react'

export function useCopiar(duracionMs = 2000) {
  const [copiado, setCopiado] = useState<string | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current)
  }, [])

  const copiar = async (clave: string, texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(clave)
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => setCopiado(null), duracionMs)
    } catch {
      setCopiado(null)
    }
  }

  return { copiado, copiar }
}
