import { useCallback, useEffect, useRef, useState } from 'react'
import type { CatalogoModel } from '../../aplicacion/CatalogoModel'
import type { ProductoCatalogoTs } from '../../dominio/ProductoCatalogoTs'
import type { FiltrosDisponiblesTs } from '../../dominio/FiltrosDisponiblesTs'
import type { FiltrosCatalogoTs } from '../../dominio/FiltrosCatalogoTs'

export const filtrosVacios: FiltrosCatalogoTs = {
  texto: '', idCategoria: '', idSubcategoria: '', idMarca: '', estado: null,
}
export const mensajeError = (error: unknown) => error instanceof Error ? error.message : 'Ocurrió un error inesperado'

export function useCatalogoAdmin(model: CatalogoModel) {
  const [productos, setProductos] = useState<ProductoCatalogoTs[]>([])
  const [filtrosDisponibles, setFiltros] = useState<FiltrosDisponiblesTs | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const solicitud = useRef(0)

  const cargar = useCallback(async (filtros?: FiltrosCatalogoTs) => {
    const actual = ++solicitud.current
    setCargando(true)
    setError(null)
    try {
      const lista = await (filtros ? model.buscarProductos(filtros) : model.obtenerCatalogo())
      if (actual !== solicitud.current) return
      setProductos(lista)
      if (!filtros) {
        const opciones = await model.obtenerFiltrosDisponibles()
        if (actual === solicitud.current) setFiltros(opciones)
      }
    } catch (e) {
      if (actual === solicitud.current) setError(mensajeError(e))
    } finally {
      if (actual === solicitud.current) setCargando(false)
    }
  }, [model])

  useEffect(() => {
    let vigente = true
    const actual = ++solicitud.current
    model.obtenerCatalogo().then(async lista => {
      if (!vigente || actual !== solicitud.current) return
      setProductos(lista)
      const opciones = await model.obtenerFiltrosDisponibles()
      if (vigente && actual === solicitud.current) setFiltros(opciones)
    }).catch(e => {
      if (vigente && actual === solicitud.current) setError(mensajeError(e))
    }).finally(() => {
      if (vigente && actual === solicitud.current) setCargando(false)
    })
    return () => { vigente = false }
  }, [model])

  return { productos, filtrosDisponibles, cargando, error,
    obtenerCatalogo: () => cargar(), buscarProductos: (filtros: FiltrosCatalogoTs) => cargar(filtros) }
}
