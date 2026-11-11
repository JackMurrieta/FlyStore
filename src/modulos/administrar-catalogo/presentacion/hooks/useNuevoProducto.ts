import { useEffect, useRef, useState } from 'react'
import type { CatalogoModel } from '../../aplicacion/CatalogoModel'
import type { ProductoModel } from '../../aplicacion/ProductoModel'
import type { DatosProductoTs } from '../../dominio/DatosProductoTs'
import type { FiltrosDisponiblesTs } from '../../dominio/FiltrosDisponiblesTs'
import type { TallaTs } from '../../dominio/TallaTs'
import type { VarianteProductoTs } from '../../dominio/VarianteProductoTs'
import type { PrecioProductoTs } from '../../dominio/PrecioProductoTs'
import { EstadoProducto } from '../../dominio/EstadoProducto'
import { PasoAlta } from '../../dominio/PasoAlta'
import { mensajeError } from './useCatalogoAdmin'

const datosIniciales = (): DatosProductoTs => ({ clave: '', nombre: '', descripcion: '',
  idCategoria: '', idSubcategoria: '', idMarca: '', imagenes: null,
  estado: EstadoProducto.BORRADOR, variantes: [], precios: [] })

export function useNuevoProducto(catalogo: CatalogoModel, model: ProductoModel) {
  const [datosProducto, setDatos] = useState(datosIniciales)
  const [filtrosDisponibles, setFiltros] = useState<FiltrosDisponiblesTs | null>(null)
  const [tallasCategoria, setTallas] = useState<TallaTs[]>([])
  const [cargandoTallas, setCargandoTallas] = useState(false)
  const [errorTallas, setErrorTallas] = useState<string | null>(null)
  const [erroresPorCampo, setErrores] = useState<Record<string, string>>({})
  const [paso, setPaso] = useState<PasoAlta>(PasoAlta.DATOS)
  const [guardando, setGuardando] = useState(false)
  const [registroPendiente, setRegistroPendiente] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [exitoso, setExitoso] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ocupado = useRef(false)
  const pendiente = useRef<DatosProductoTs | null>(null)

  useEffect(() => {
    let vigente = true
    catalogo.obtenerFiltrosDisponibles().then(opciones => {
      if (vigente) { setFiltros(opciones); setError(null) }
    }).catch(e => { if (vigente) setError(mensajeError(e)) })
      .finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [catalogo])

  useEffect(() => {
    let vigente = true
    if (datosProducto.idCategoria) {
      catalogo.obtenerTallasPorCategoria(datosProducto.idCategoria).then(tallas => {
        if (vigente) setTallas(tallas)
      }).catch(e => { if (vigente) setErrorTallas(mensajeError(e)) })
        .finally(() => { if (vigente) setCargandoTallas(false) })
    }
    return () => { vigente = false }
  }, [catalogo, datosProducto.idCategoria])

  const actualizarCampo = <K extends keyof DatosProductoTs>(campo: K, valor: DatosProductoTs[K]) => {
    if (ocupado.current || pendiente.current) return
    // Pulsar el chip activo no cambia de categoría ni debe vaciar sus datos.
    if (campo === 'idCategoria' && valor === datosProducto.idCategoria) return
    setDatos(anterior => campo === 'idCategoria'
      ? { ...anterior, [campo]: valor, idSubcategoria: '', variantes: [] }
      : { ...anterior, [campo]: valor })
    if (campo === 'idCategoria') {
      setTallas([])
      setCargandoTallas(Boolean(valor))
      setErrorTallas(null)
    }
    setErrores(anterior => {
      const siguientes = { ...anterior }
      delete siguientes[campo]
      return siguientes
    })
    setError(null); setExitoso(false)
  }
  const agregarVariante = (variante: VarianteProductoTs) => {
    if (!datosProducto.idCategoria || cargandoTallas || errorTallas || !tallasCategoria.length) {
      setErrores(anterior => ({ ...anterior, variantes: !datosProducto.idCategoria
        ? 'Selecciona primero la categoría del producto en la sección 1'
        : cargandoTallas ? 'Espera a que se carguen las tallas'
          : errorTallas ? 'No se pudieron cargar las tallas de la categoría' : 'La categoría seleccionada no tiene tallas disponibles' }))
      return false
    }
    const errorVariante = model.validarVariante(variante)
    if (errorVariante) { setErrores({ variantes: errorVariante }); return false }
    if (!tallasCategoria.some(t => t.nombre === variante.talla)) {
      setErrores({ variantes: 'Selecciona una talla de la categoría' }); return false
    }
    if (datosProducto.variantes.some(v => v.talla === variante.talla && v.color.toLowerCase() === variante.color.trim().toLowerCase())) {
      setErrores({ variantes: 'La combinación de talla y color ya existe' }); return false
    }
    actualizarCampo('variantes', [...datosProducto.variantes, { ...variante, color: variante.color.trim() }])
    return true
  }
  const actualizarPrecios = (precio: PrecioProductoTs) => {
    const errorPrecio = model.validarPrecio(precio)
    if (errorPrecio) { setErrores({ precios: errorPrecio }); return false }
    actualizarCampo('precios', [...datosProducto.precios.filter(p => p.tipoPrecio !== precio.tipoPrecio), precio])
    return true
  }
  const guardarProducto = async () => {
    if (ocupado.current) return false
    const errores = model.validarDatosCompletos(datosProducto)
    setErrores(errores)
    if (Object.keys(errores).length) return false
    ocupado.current = true; pendiente.current = datosProducto
    setRegistroPendiente(true)
    setGuardando(true); setError(null)
    try {
      await model.registrarProducto(datosProducto)
      pendiente.current = null; setRegistroPendiente(false); setExitoso(true)
      return true
    } catch (e) {
      if (!model.tieneRegistroPendiente()) {
        pendiente.current = null
        setRegistroPendiente(false)
      }
      setError(mensajeError(e)); return false
    }
    finally { ocupado.current = false; setGuardando(false) }
  }
  return { datosProducto, filtrosDisponibles, tallasCategoria, cargandoTallas, errorTallas, erroresPorCampo, paso,
    guardando, cargando, exitoso, error, bloqueado: guardando || registroPendiente,
    actualizarCampo, agregarVariante, actualizarPrecios, guardarProducto, setPaso }
}
