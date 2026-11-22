import { useCallback, useEffect, useRef, useState } from 'react'
import type { CatalogoModel } from '../../aplicacion/CatalogoModel'
import type { ProductoCatalogoTs } from '../../dominio/ProductoCatalogoTs'
import type { FiltrosDisponiblesTs } from '../../dominio/FiltrosDisponiblesTs'
import type { FiltrosCatalogoTs } from '../../dominio/FiltrosCatalogoTs'

export const filtrosVacios: FiltrosCatalogoTs = { texto: '', idCategoria: '', idSubcategoria: '', idMarca: '', estado: null }
export const mensajeError = (error: unknown) => error instanceof Error ? error.message : 'Ocurrió un error inesperado'

async function leerPagina(model: CatalogoModel, pagina: number, filtros?: FiltrosCatalogoTs) {
  let resultado = await model.obtenerPagina(pagina, filtros)
  if (!resultado.productos.length && pagina > 0) {
    resultado = await model.obtenerPagina(pagina - 1, filtros)
    if (!resultado.productos.length && pagina > 1) resultado = await model.obtenerPagina(0, filtros)
  }
  return resultado
}

export function useCatalogoAdmin(model: CatalogoModel) {
  const [productos, setProductos] = useState<ProductoCatalogoTs[]>([])
  const [filtrosDisponibles, setFiltros] = useState<FiltrosDisponiblesTs | null>(null)
  const [pagina, setPagina] = useState(0)
  const [hayMas, setHayMas] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const solicitud = useRef(0)
  const filtrosAplicados = useRef<FiltrosCatalogoTs | undefined>(undefined)
  const paginaActual = useRef(0)

  const cargar = useCallback(async (filtros?: FiltrosCatalogoTs, numero = 0) => {
    const actual = ++solicitud.current
    setCargando(true)
    setError(null)
    try {
      const resultado = await leerPagina(model, numero, filtros)
      if (actual !== solicitud.current) return
      setProductos(resultado.productos)
      setPagina(resultado.pagina)
      setHayMas(resultado.hayMas)
      filtrosAplicados.current = filtros
      paginaActual.current = resultado.pagina
    } catch (e) {
      if (actual === solicitud.current) setError(mensajeError(e))
    } finally {
      if (actual === solicitud.current) setCargando(false)
    }
  }, [model])

  useEffect(() => {
    let vigente = true
    const actual = ++solicitud.current
    model.obtenerPagina().then(async resultado => {
      if (!vigente || actual !== solicitud.current) return
      setProductos(resultado.productos)
      setPagina(resultado.pagina)
      setHayMas(resultado.hayMas)
      const opciones = await model.obtenerFiltrosDisponibles()
      if (vigente && actual === solicitud.current) setFiltros(opciones)
    }).catch(e => {
      if (vigente && actual === solicitud.current) setError(mensajeError(e))
    }).finally(() => {
      if (vigente && actual === solicitud.current) setCargando(false)
    })
    return () => { vigente = false }
  }, [model])

  return { productos, filtrosDisponibles, pagina, hayMas, cargando, error,
    obtenerCatalogo: () => cargar(), buscarProductos: (filtros: FiltrosCatalogoTs) => cargar(filtros),
    cambiarPagina: (numero: number) => cargar(filtrosAplicados.current, numero),
    recargar: () => cargar(filtrosAplicados.current, paginaActual.current) }
}
