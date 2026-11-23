import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CriteriosBusquedaTs } from '../../dominio/CriteriosBusquedaTs'
import { criteriosAParametros, criteriosDesdeParametros } from '../../dominio/ReglasCatalogo'

/**
 * Los criterios viven en la URL: compartir el enlace, recargar o «Regresar al catálogo» los conserva.
 * {@code extra} son parámetros que no son criterios y deben quedarse (ej. «linea» en la búsqueda).
 */
export function useCriteriosUrl(extra: readonly string[] = []) {
  const [parametros, setParametros] = useSearchParams()
  const texto = parametros.toString()
  const criterios = useMemo(() => criteriosDesdeParametros(new URLSearchParams(texto)), [texto])
  const claveExtra = extra.join(',')

  const cambiarCriterios = useCallback((nuevos: CriteriosBusquedaTs, cambios: Record<string, string | null> = {}) => {
    const siguiente = criteriosAParametros(nuevos)
    const actuales = new URLSearchParams(texto)
    for (const nombre of claveExtra ? claveExtra.split(',') : []) {
      const valor = nombre in cambios ? cambios[nombre] : actuales.get(nombre)
      if (valor) siguiente.set(nombre, valor)
    }
    setParametros(siguiente, { replace: true })
  }, [texto, claveExtra, setParametros])

  return { criterios, parametros, cambiarCriterios }
}
