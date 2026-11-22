import { useEffect, useSyncExternalStore } from 'react'
import type { CriteriosBusquedaTs, DestinoCatalogoTs } from '../../dominio/CriteriosBusquedaTs'
import { useModelosCatalogo } from '../ModelosCatalogoContext'

/**
 * Catálogo de una línea o de la búsqueda. Pide la primera página cuando cambian el destino o los
 * criterios, y otra vez si el modelo se invalidó (al iniciar o cerrar sesión cambian los precios).
 */
export function useCatalogo(destino: DestinoCatalogoTs, criterios: CriteriosBusquedaTs) {
  const { catalogo } = useModelosCatalogo().modelos
  const estado = useSyncExternalStore(catalogo.suscribir, catalogo.obtenerEstado, catalogo.obtenerEstado)
  const tipo = destino.tipo
  const ruta = destino.tipo === 'linea' ? destino.ruta : destino.linea

  useEffect(() => {
    void catalogo.cargar(tipo === 'linea' ? { tipo, ruta: ruta ?? '' } : { tipo, linea: ruta }, criterios)
  }, [catalogo, tipo, ruta, criterios, estado.clave])

  return {
    ...estado,
    cargarMas: catalogo.cargarMas,
    reintentar: catalogo.reintentar,
  }
}
