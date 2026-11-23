import { useCallback, useEffect, useRef, useState } from 'react'
import type { CatalogoModel } from '../../aplicacion/CatalogoModel'
import {
  ErrorGuardarProducto, MAXIMO_ARCHIVOS_NUEVOS, errorDeGrupo, nuevaClave, type ProductoModel,
} from '../../aplicacion/ProductoModel'
import type {
  DatosProductoTs, FotoProductoTs, GrupoColorTs, ModoFormulario, VarianteFormularioTs,
} from '../../dominio/DatosProductoTs'
import type { FiltrosDisponiblesTs } from '../../dominio/FiltrosDisponiblesTs'
import type { TallaTs } from '../../dominio/TallaTs'
import type { PrecioProductoTs } from '../../dominio/PrecioProductoTs'
import { EstadoProducto } from '../../dominio/EstadoProducto'
import { PasoAlta } from '../../dominio/PasoAlta'
import { mensajeError } from './useCatalogoAdmin'

const datosIniciales = (): DatosProductoTs => ({ clave: '', nombre: '', descripcion: '',
  idCategoria: '', idSubcategoria: '', idMarca: '', estado: EstadoProducto.BORRADOR,
  grupos: [], fotosSinColor: [], precios: [] })

const varianteNueva = (talla = ''): VarianteFormularioTs => ({
  clave: nuevaClave('variante'), idVariante: null, sku: null, talla, stock: 0, conPedidos: false, quitada: false,
})

type CampoSimple = 'clave' | 'nombre' | 'descripcion' | 'idSubcategoria' | 'idMarca' | 'estado' | 'precios'

/**
 * ViewModel del formulario de producto (alta y edición, Figma B2 / S1).
 * Sin `idProducto` registra uno nuevo; con él carga el producto y guarda los cambios.
 */
export function useFormularioProducto(catalogo: CatalogoModel, model: ProductoModel, idProducto?: string) {
  const modo: ModoFormulario = idProducto ? 'EDICION' : 'ALTA'
  const [datosProducto, setDatos] = useState(datosIniciales)
  const [filtrosDisponibles, setFiltros] = useState<FiltrosDisponiblesTs | null>(null)
  const [tallasCategoria, setTallas] = useState<TallaTs[]>([])
  const [cargandoTallas, setCargandoTallas] = useState(Boolean(idProducto))
  const [errorTallas, setErrorTallas] = useState<string | null>(null)
  const [erroresPorCampo, setErrores] = useState<Record<string, string>>({})
  const [paso, setPaso] = useState<PasoAlta>(PasoAlta.DATOS)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hayCambios, setHayCambios] = useState(false)
  const [edicion, setEdicion] = useState<{ categoria: string; estadoOriginal: EstadoProducto } | null>(null)
  const ocupado = useRef(false)
  const urlsLocales = useRef(new Set<string>())

  // Carga inicial: opciones del catálogo y, al editar, el producto (en paralelo).
  useEffect(() => {
    let vigente = true
    Promise.all([
      catalogo.obtenerFiltrosDisponibles(),
      idProducto ? model.obtenerParaEditar(idProducto) : Promise.resolve(null),
    ]).then(([opciones, producto]) => {
      if (!vigente) return
      setFiltros(opciones)
      if (producto) {
        setDatos(producto.datos)
        setEdicion({ categoria: producto.categoria, estadoOriginal: producto.estadoOriginal })
      }
    }).catch(e => { if (vigente) { setErrorCarga(mensajeError(e)); setCargandoTallas(false) } })
      .finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [catalogo, model, idProducto])

  // Las tallas dependen de la línea (categoría).
  useEffect(() => {
    let vigente = true
    if (datosProducto.idCategoria) {
      catalogo.obtenerTallasPorCategoria(datosProducto.idCategoria).then(tallas => {
        if (vigente) { setTallas(tallas); setErrorTallas(null) }
      }).catch(e => { if (vigente) setErrorTallas(mensajeError(e)) })
        .finally(() => { if (vigente) setCargandoTallas(false) })
    }
    return () => { vigente = false }
  }, [catalogo, datosProducto.idCategoria])

  // Las vistas previas locales (blob:) se liberan al salir del formulario.
  useEffect(() => {
    const urls = urlsLocales.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
      urls.clear()
    }
  }, [])

  const liberar = (fotos: FotoProductoTs[]) => {
    for (const foto of fotos) {
      if (foto.vistaPrevia) { URL.revokeObjectURL(foto.vistaPrevia); urlsLocales.current.delete(foto.vistaPrevia) }
    }
  }

  /** Aplica un cambio, marca el formulario como modificado y limpia los errores que ese cambio resuelve. */
  const mutar = useCallback((cambio: (datos: DatosProductoTs) => DatosProductoTs, limpiar: string[] = []) => {
    if (ocupado.current) return
    setDatos(cambio)
    setHayCambios(true)
    setError(null)
    if (limpiar.length) {
      setErrores(anterior => {
        if (!limpiar.some(campo => campo in anterior)) return anterior
        const siguientes = { ...anterior }
        for (const campo of limpiar) delete siguientes[campo]
        return siguientes
      })
    }
  }, [])

  const cambiarGrupo = (claveGrupo: string, cambio: (grupo: GrupoColorTs) => GrupoColorTs, limpiar: string[] = []) =>
    mutar(datos => ({ ...datos, grupos: datos.grupos.map(grupo => grupo.clave === claveGrupo ? cambio(grupo) : grupo) }),
      [errorDeGrupo(claveGrupo), 'variantes', ...limpiar])

  const cambiarVariante = (claveGrupo: string, claveVariante: string, cambio: (variante: VarianteFormularioTs) => VarianteFormularioTs) =>
    cambiarGrupo(claveGrupo, grupo => ({ ...grupo, variantes: grupo.variantes.map(variante => variante.clave === claveVariante ? cambio(variante) : variante) }))

  const tallaSugerida = () => tallasCategoria.length === 1 ? tallasCategoria[0]!.nombre : ''

  // ---- Datos generales ------------------------------------------------------------------------

  const actualizarCampo = <K extends CampoSimple>(campo: K, valor: DatosProductoTs[K]) =>
    mutar(datos => ({ ...datos, [campo]: valor }), [campo])

  /** Solo en el alta: la línea define las tallas, así que se vacían las tallas elegidas (los colores y fotos se conservan). */
  const seleccionarCategoria = (idCategoria: string) => {
    if (modo === 'EDICION' || ocupado.current || idCategoria === datosProducto.idCategoria) return
    mutar(datos => ({ ...datos, idCategoria, idSubcategoria: '',
      grupos: datos.grupos.map(grupo => ({ ...grupo, variantes: grupo.variantes.map(variante => ({ ...variante, talla: '' })) })) }),
    ['idCategoria', 'idSubcategoria', 'variantes'])
    setTallas([])
    setCargandoTallas(Boolean(idCategoria))
    setErrorTallas(null)
  }

  const actualizarPrecios = (precio: PrecioProductoTs) => {
    const errorPrecio = model.validarPrecio(precio)
    if (errorPrecio) { setErrores(anterior => ({ ...anterior, precios: errorPrecio })); return false }
    actualizarCampo('precios', [...datosProducto.precios.filter(p => p.tipoPrecio !== precio.tipoPrecio), precio])
    return true
  }

  // ---- Colores y tallas -----------------------------------------------------------------------

  const agregarColor = () => mutar(datos => ({ ...datos, grupos: [...datos.grupos,
    { clave: nuevaClave('color'), color: '', hex: null, variantes: [varianteNueva(tallaSugerida())], fotos: [] }] }), ['variantes'])

  /** Solo para colores nuevos: el color de una variante guardada no cambia (se quita y se agrega otra). */
  const cambiarColor = (claveGrupo: string, color: string) =>
    cambiarGrupo(claveGrupo, grupo => grupo.variantes.some(v => v.idVariante) ? grupo : { ...grupo, color }, ['fotos'])

  /** Un color nuevo desaparece; uno guardado marca sus tallas para quitarse (se puede deshacer). */
  const quitarColor = (claveGrupo: string) => {
    const grupo = datosProducto.grupos.find(item => item.clave === claveGrupo)
    if (!grupo || ocupado.current) return
    if (grupo.variantes.some(variante => variante.idVariante)) {
      cambiarGrupo(claveGrupo, actual => ({ ...actual,
        variantes: actual.variantes.filter(v => v.idVariante).map(v => ({ ...v, quitada: true })) }), ['fotos'])
    } else {
      liberar(grupo.fotos)
      mutar(datos => ({ ...datos, grupos: datos.grupos.filter(item => item.clave !== claveGrupo) }), [errorDeGrupo(claveGrupo), 'variantes', 'fotos'])
    }
  }

  const restaurarColor = (claveGrupo: string) =>
    cambiarGrupo(claveGrupo, grupo => ({ ...grupo, variantes: grupo.variantes.map(v => ({ ...v, quitada: false })) }))

  /** Agrega una talla (variante nueva) al color. */
  const agregarVariante = (claveGrupo: string) => cambiarGrupo(claveGrupo, grupo => {
    const usadas = new Set(grupo.variantes.map(v => v.talla))
    const libre = tallasCategoria.length === 1 && !usadas.has(tallasCategoria[0]!.nombre) ? tallasCategoria[0]!.nombre : ''
    return { ...grupo, variantes: [...grupo.variantes, varianteNueva(libre)] }
  })

  const cambiarTalla = (claveGrupo: string, claveVariante: string, talla: string) =>
    cambiarVariante(claveGrupo, claveVariante, variante => variante.idVariante ? variante : { ...variante, talla })

  const cambiarExistencia = (claveGrupo: string, claveVariante: string, stock: number) =>
    cambiarVariante(claveGrupo, claveVariante, variante => ({ ...variante, stock }))

  /** La talla nueva se borra; la guardada queda marcada (con pedidos, el backend la deja en existencia 0). */
  const quitarVariante = (claveGrupo: string, claveVariante: string) =>
    cambiarGrupo(claveGrupo, grupo => ({ ...grupo, variantes: grupo.variantes.flatMap(variante => variante.clave !== claveVariante ? [variante]
      : variante.idVariante ? [{ ...variante, quitada: true }] : []) }))

  const restaurarVariante = (claveGrupo: string, claveVariante: string) =>
    cambiarVariante(claveGrupo, claveVariante, variante => ({ ...variante, quitada: false }))

  // ---- Fotos por color ------------------------------------------------------------------------

  /** Valida y agrega archivos al color. Devuelve el aviso de los que no se aceptaron (o null). */
  const agregarFotos = (claveGrupo: string, archivos: File[]): string | null => {
    if (ocupado.current || !archivos.length) return null
    const rechazos: string[] = []
    let disponibles = MAXIMO_ARCHIVOS_NUEVOS - model.contarArchivosNuevos(datosProducto)
    const nuevas: FotoProductoTs[] = []
    for (const archivo of archivos) {
      const motivo = model.validarArchivo(archivo)
      if (motivo) { rechazos.push(motivo); continue }
      if (disponibles <= 0) { rechazos.push(`Puedes subir hasta ${MAXIMO_ARCHIVOS_NUEVOS} fotos nuevas por guardado.`); break }
      const vistaPrevia = URL.createObjectURL(archivo)
      urlsLocales.current.add(vistaPrevia)
      nuevas.push({ clave: nuevaClave('foto'), idImagen: null, url: null, archivo, vistaPrevia })
      disponibles--
    }
    if (nuevas.length) cambiarGrupo(claveGrupo, grupo => ({ ...grupo, fotos: [...grupo.fotos, ...nuevas] }), ['fotos'])
    const aviso = rechazos.length ? rechazos.join(' ') : null
    if (aviso) setErrores(anterior => ({ ...anterior, [errorDeGrupo(claveGrupo)]: aviso }))
    return aviso
  }

  const quitarFoto = (claveGrupo: string, claveFoto: string) => {
    const foto = datosProducto.grupos.find(g => g.clave === claveGrupo)?.fotos.find(f => f.clave === claveFoto)
    if (!foto || ocupado.current) return
    liberar([foto])
    cambiarGrupo(claveGrupo, grupo => ({ ...grupo, fotos: grupo.fotos.filter(f => f.clave !== claveFoto) }), ['fotos'])
  }

  /** Mueve la foto dentro de su color; `hasta = 0` la vuelve principal. */
  const moverFoto = (claveGrupo: string, claveFoto: string, hasta: number) => cambiarGrupo(claveGrupo, grupo => {
    const desde = grupo.fotos.findIndex(f => f.clave === claveFoto)
    if (desde < 0 || hasta < 0 || hasta >= grupo.fotos.length || desde === hasta) return grupo
    const fotos = [...grupo.fotos]
    const [foto] = fotos.splice(desde, 1)
    fotos.splice(hasta, 0, foto!)
    return { ...grupo, fotos }
  })

  const asignarColorFoto = (claveFoto: string, color: string) => mutar(datos => ({ ...datos,
    fotosSinColor: datos.fotosSinColor.map(foto => foto.clave === claveFoto ? { ...foto, color } : foto) }), ['fotos'])

  const quitarFotoSinColor = (claveFoto: string) => mutar(datos => ({ ...datos,
    fotosSinColor: datos.fotosSinColor.filter(foto => foto.clave !== claveFoto) }), ['fotos'])

  // ---- Guardar --------------------------------------------------------------------------------

  /** Valida y envía. Devuelve el mensaje de éxito para el catálogo, o null si hay que corregir algo. */
  const guardarProducto = async (): Promise<string | null> => {
    if (ocupado.current || cargando || errorCarga) return null
    setPaso(PasoAlta.CONFIRMACION)
    const errores = model.validarDatosCompletos(datosProducto, modo, edicion?.estadoOriginal, filtrosDisponibles?.colores)
    setErrores(errores)
    if (Object.keys(errores).length) return null
    ocupado.current = true
    setGuardando(true); setError(null)
    try {
      if (idProducto && edicion) {
        await model.guardarCambios(idProducto, datosProducto, edicion.estadoOriginal)
        setHayCambios(false)
        return `Se guardaron los cambios de «${datosProducto.nombre.trim()}».`
      }
      await model.registrarProducto(datosProducto, filtrosDisponibles?.colores)
      setHayCambios(false)
      return datosProducto.estado === EstadoProducto.PUBLICADO
        ? 'El producto se registró con éxito y ya está publicado en la tienda.'
        : datosProducto.estado === EstadoProducto.INACTIVO
          ? 'El producto se registró como inactivo.'
          : 'El producto se guardó como borrador correctamente.'
    } catch (e) {
      if (e instanceof ErrorGuardarProducto && e.campo) setErrores({ [e.campo]: e.message })
      else setError(mensajeError(e))
      return null
    } finally {
      ocupado.current = false
      setGuardando(false)
    }
  }

  return {
    modo, datosProducto, filtrosDisponibles, tallasCategoria, cargandoTallas, errorTallas, erroresPorCampo, paso,
    guardando, cargando, errorCarga, error, hayCambios, bloqueado: guardando,
    categoriaEdicion: edicion?.categoria ?? null, estadoOriginal: edicion?.estadoOriginal ?? null,
    archivosNuevos: model.contarArchivosNuevos(datosProducto),
    setPaso, actualizarCampo, seleccionarCategoria, actualizarPrecios,
    agregarColor, cambiarColor, quitarColor, restaurarColor,
    agregarVariante, cambiarTalla, cambiarExistencia, quitarVariante, restaurarVariante,
    agregarFotos, quitarFoto, moverFoto, asignarColorFoto, quitarFotoSinColor,
    guardarProducto,
  }
}

export type FormularioProductoVM = ReturnType<typeof useFormularioProducto>
