import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useFormularioProducto } from '../hooks/useFormularioProducto'
import type { CatalogoModel } from '../../aplicacion/CatalogoModel'
import { MAXIMO_ARCHIVOS_NUEVOS, type ProductoModel } from '../../aplicacion/ProductoModel'
import { grupoActivo, type DatosProductoTs } from '../../dominio/DatosProductoTs'
import { PasoAlta } from '../../dominio/PasoAlta'
import { EstadoProducto } from '../../dominio/EstadoProducto'
import { Boton } from '@compartido/ui/Boton'
import { Campo } from '@compartido/ui/Campo'
import { Radio } from '@compartido/ui/Radio'
import { Chip } from '@compartido/ui/Chip'
import { Aviso } from '@compartido/ui/Aviso'
import { Dialogo } from '@compartido/ui/Dialogo'
import { Icono } from '@compartido/ui/iconos/Icono'
import { CargaContenido, Esqueleto, EsqueletoTexto } from '@compartido/ui/carga'
import { VarianteProductoPanel } from '../componentes/VarianteProductoPanel'
import { PreciosProductoPanel } from '../componentes/PreciosProductoPanel'
import { EstadoProductoInsignia } from '../componentes/EstadoProductoInsignia'
import { formatoMoneda } from '../formato'
import estilos from './CatalogoAdmin.module.css'
import f from './FormularioProducto.module.css'

interface Props {
  catalogoModel: CatalogoModel
  productoModel: ProductoModel
  /** Sin id: alta (Figma B2). Con id: edición del producto (Figma S1). */
  idProducto?: string
  alRegresar: () => void
  /** Recibe el mensaje de éxito para mostrarlo en el catálogo. */
  alGuardado: (mensaje: string) => void
}

const SECCIONES = {
  categoria: 'producto-categoria',
  datos: 'producto-datos',
  variantes: 'producto-variantes',
  precios: 'producto-precios',
  publicacion: 'producto-publicacion',
} as const

const ETIQUETAS_ERROR: Record<string, { etiqueta: string; seccion: string }> = {
  idCategoria: { etiqueta: 'Línea de producto', seccion: SECCIONES.categoria },
  idMarca: { etiqueta: 'Marca', seccion: SECCIONES.categoria },
  idSubcategoria: { etiqueta: 'Tipo de producto', seccion: SECCIONES.categoria },
  nombre: { etiqueta: 'Nombre / modelo', seccion: SECCIONES.datos },
  clave: { etiqueta: 'Clave / SKU', seccion: SECCIONES.datos },
  descripcion: { etiqueta: 'Descripción', seccion: SECCIONES.datos },
  variantes: { etiqueta: 'Colores y tallas', seccion: SECCIONES.variantes },
  fotos: { etiqueta: 'Fotos', seccion: SECCIONES.variantes },
  precios: { etiqueta: 'Precios', seccion: SECCIONES.precios },
  estado: { etiqueta: 'Publicación', seccion: SECCIONES.publicacion },
}

const normalizar = (texto: string) => texto.trim().toLocaleLowerCase('es-MX')

/** Primera foto del primer color que se guardará: la portada que verá el cliente. */
function portada(datos: DatosProductoTs) {
  const foto = datos.grupos.filter(grupoActivo).flatMap(grupo => grupo.fotos)[0]
  return foto ? foto.vistaPrevia ?? foto.url : null
}

/** Formulario único de producto: alta y edición con variantes por color, fotos por color y precios. */
export function PantallaFormularioProducto({ catalogoModel, productoModel, idProducto, alRegresar, alGuardado }: Props) {
  const vm = useFormularioProducto(catalogoModel, productoModel, idProducto)
  const id = useId()
  const resumenRef = useRef<HTMLDivElement>(null)
  const [confirmarSalida, setConfirmarSalida] = useState(false)
  const [errorPortada, setErrorPortada] = useState<string | null>(null)
  const datos = vm.datosProducto
  const errores = vm.erroresPorCampo
  const edicion = vm.modo === 'EDICION'
  const marca = vm.filtrosDisponibles?.marcas.find(item => item.id === datos.idMarca)?.nombre
  const precioBase = datos.precios.find(precio => precio.tipoPrecio === 'BASE')
  const imagenPortada = portada(datos)
  const activos = datos.grupos.filter(grupoActivo)
  const tallasActivas = activos.reduce((total, grupo) => total + grupo.variantes.filter(v => !v.quitada).length, 0)

  // Aviso del navegador si se cierra o recarga la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!vm.hayCambios) return
    const avisar = (evento: BeforeUnloadEvent) => { evento.preventDefault() }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [vm.hayCambios])

  const cerrarDialogo = useCallback(() => setConfirmarSalida(false), [])
  const cancelar = () => { if (vm.hayCambios) setConfirmarSalida(true); else alRegresar() }

  const guardar = async () => {
    const mensaje = await vm.guardarProducto()
    if (mensaje) alGuardado(mensaje)
    else requestAnimationFrame(() => resumenRef.current?.focus())
  }

  const coloresPara = (claveGrupo: string) => {
    const otros = new Set(datos.grupos.filter(grupo => grupo.clave !== claveGrupo).map(grupo => normalizar(grupo.color)))
    return (vm.filtrosDisponibles?.colores ?? []).filter(color => !otros.has(normalizar(color)))
  }

  const titulo = edicion ? 'Editar producto' : 'Nuevo producto'
  const acciones = (completo = false) => <>
    <Boton variante="secundario" anchoCompleto={completo} disabled={vm.bloqueado} onClick={cancelar}>Cancelar</Boton>
    <Boton type="submit" anchoCompleto={completo} cargando={vm.guardando} disabled={vm.cargando}
      icono={<Icono nombre="check" tamano={16} />}>{edicion ? 'Guardar cambios' : 'Guardar'}</Boton>
  </>

  if (vm.cargando) return <div className={estilos.pantalla}>
    <CargaContenido texto={edicion ? 'Cargando el producto…' : 'Cargando el formulario…'} className={f.cargaFormulario}>
      <Esqueleto forma="texto" ancho={90} />
      <Esqueleto forma="titulo" ancho="32%" />
      <div className={estilos.formularioColumnas}>
        <div className={estilos.seccionesFormulario}>
          <Esqueleto alto={180} /><Esqueleto alto={220} /><Esqueleto alto={260} />
        </div>
        <div className={estilos.seccionesFormulario}><Esqueleto alto={120} /><EsqueletoTexto lineas={3} /></div>
      </div>
    </CargaContenido>
  </div>

  if (vm.errorCarga) return <div className={estilos.pantalla}>
    <header className={estilos.encabezadoPagina}>
      <div><p className={estilos.sobretitulo}>Catálogo</p><h1>{titulo}</h1></div>
    </header>
    <Aviso tono="error" titulo={edicion ? 'No se pudo abrir el producto' : 'No se pudo preparar el formulario'}>{vm.errorCarga}</Aviso>
    <div><Boton variante="secundario" icono={<Icono nombre="chevron-left" tamano={16} />} onClick={alRegresar}>Volver al catálogo</Boton></div>
  </div>

  const listaErrores = Object.entries(errores).map(([campo, mensaje]) => {
    if (campo.startsWith('grupo.')) {
      const indice = datos.grupos.findIndex(grupo => `grupo.${grupo.clave}` === campo)
      const grupo = datos.grupos[indice]
      return { campo, mensaje, etiqueta: `Color ${indice + 1}${grupo?.color ? ` · ${grupo.color}` : ''}`, destino: grupo ? `color-${grupo.clave}` : SECCIONES.variantes }
    }
    const info = ETIQUETAS_ERROR[campo]
    return { campo, mensaje, etiqueta: info?.etiqueta ?? campo, destino: info?.seccion ?? SECCIONES.datos }
  })

  return <div className={estilos.pantalla}>
    <form className={estilos.formularioAlta} noValidate aria-labelledby={`${id}-titulo`} onSubmit={e => { e.preventDefault(); void guardar() }}>
      <header className={estilos.encabezadoPagina}>
        <div><p className={estilos.sobretitulo}>Catálogo</p><h1 id={`${id}-titulo`}>{titulo}</h1>
          {edicion
            ? <p className={f.subtitulo}><span>{datos.clave}</span>{vm.estadoOriginal && <EstadoProductoInsignia estado={vm.estadoOriginal} />}</p>
            : <p className={estilos.textoSecundario}>Los campos con * son obligatorios.</p>}
        </div>
        <div className={estilos.accionesFormulario}>{acciones()}</div>
      </header>

      {(listaErrores.length > 0 || vm.error) && <div ref={resumenRef} tabIndex={-1} className={f.resumenErrores}>
        {vm.error && <Aviso tono="error" titulo="No se pudo guardar">{vm.error} Tus datos siguen aquí: revisa e intenta de nuevo.</Aviso>}
        {listaErrores.length > 0 && <Aviso tono="error" titulo={listaErrores.length === 1 ? 'Hay 1 dato por revisar' : `Hay ${listaErrores.length} datos por revisar`}>
          <ul>{listaErrores.map(item => <li key={item.campo}><a href={`#${item.destino}`}>{item.etiqueta}</a>: {item.mensaje}</li>)}</ul>
        </Aviso>}
      </div>}

      <div className={estilos.formularioColumnas}>
        <div className={estilos.seccionesFormulario}>
          <fieldset id={SECCIONES.categoria} className={`${estilos.tarjeta} ${f.seccion}`} disabled={vm.bloqueado} onFocusCapture={() => vm.setPaso(PasoAlta.DATOS)}>
            <legend className={estilos.soloLectores}>Línea, marca y tipo</legend>
            <div className={estilos.tituloSeccion}><span>1</span><div><h2>Categoría y marca</h2><p>La línea define las tallas disponibles.</p></div></div>
            <div className={estilos.grupoCampo}><p id={`${id}-linea`}>Línea de producto *</p>
              {edicion
                ? <div className={f.lineaFija}><span>{vm.categoriaEdicion}</span><small>La línea no se cambia al editar.</small></div>
                : <div className={estilos.chips} role="group" aria-labelledby={`${id}-linea`}>{vm.filtrosDisponibles?.categorias.map(item =>
                    <Chip key={item.id} activo={datos.idCategoria === item.id} onClick={() => vm.seleccionarCategoria(item.id)}>{item.nombre}</Chip>)}</div>}
              {errores.idCategoria && <p className={estilos.errorCampo}>{errores.idCategoria}</p>}
            </div>
            <div className={estilos.dosColumnas}>
              <div><label className={estilos.campoSelect}>Marca *
                <select value={datos.idMarca} aria-invalid={!!errores.idMarca} aria-describedby={errores.idMarca ? `${id}-marca-error` : undefined}
                  onChange={e => vm.actualizarCampo('idMarca', e.target.value)}>
                  <option value="">Selecciona una marca</option>{vm.filtrosDisponibles?.marcas.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select></label>{errores.idMarca && <p id={`${id}-marca-error`} className={estilos.errorCampo}>{errores.idMarca}</p>}
              </div>
              <div><label className={estilos.campoSelect}>Tipo de producto *
                <select value={datos.idSubcategoria} aria-invalid={!!errores.idSubcategoria}
                  aria-describedby={errores.idSubcategoria ? `${id}-tipo-error` : edicion ? `${id}-tipo-ayuda` : undefined}
                  onChange={e => vm.actualizarCampo('idSubcategoria', e.target.value)}>
                  <option value="">Selecciona un tipo</option>{vm.filtrosDisponibles?.subcategorias.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select></label>
                {errores.idSubcategoria ? <p id={`${id}-tipo-error`} className={estilos.errorCampo}>{errores.idSubcategoria}</p>
                  : edicion && <p id={`${id}-tipo-ayuda`} className={f.contadorFotos}>Debe ser un tipo de la línea {vm.categoriaEdicion}.</p>}
              </div>
            </div>
          </fieldset>

          <fieldset id={SECCIONES.datos} className={`${estilos.tarjeta} ${f.seccion}`} disabled={vm.bloqueado} onFocusCapture={() => vm.setPaso(PasoAlta.DATOS)}>
            <legend className={estilos.soloLectores}>Datos generales</legend>
            <div className={estilos.tituloSeccion}><span>2</span><div><h2>Datos generales</h2></div></div>
            <div className={estilos.dosColumnas}>
              <Campo etiqueta="Nombre / modelo *" placeholder="Ej. 9FORTY LA Dodgers" value={datos.nombre} error={errores.nombre}
                onChange={e => vm.actualizarCampo('nombre', e.target.value)} />
              <Campo etiqueta="Clave / SKU *" placeholder="Ej. NE-940-LAD" value={datos.clave} error={errores.clave} autoComplete="off"
                onChange={e => vm.actualizarCampo('clave', e.target.value)} />
            </div>
            <label className={estilos.campoSelect}>Descripción *
              <textarea value={datos.descripcion} rows={4} aria-invalid={!!errores.descripcion}
                aria-describedby={errores.descripcion ? `${id}-descripcion-error` : undefined} placeholder="Describe materiales, ajuste y detalles"
                onChange={e => vm.actualizarCampo('descripcion', e.target.value)} />
            </label>
            {errores.descripcion && <p id={`${id}-descripcion-error`} className={estilos.errorCampo}>{errores.descripcion}</p>}
          </fieldset>

          <section id={SECCIONES.variantes} className={`${estilos.tarjeta} ${f.seccion}`} aria-labelledby={`${id}-variantes`}
            onFocusCapture={() => vm.setPaso(PasoAlta.VARIANTES)}>
            <div className={estilos.tituloSeccion}><span>3</span><div><h2 id={`${id}-variantes`}>Colores, tallas y fotos *</h2>
              <p>Cada color con su talla es una variante vendible. Las fotos se ligan al color: quien busque ese color en la tienda verá esas fotos.</p></div></div>
            {!datos.grupos.length && <div className={estilos.estadoVacio}><Icono nombre="image" tamano={26} />
              <p>Aún no hay colores. Agrega el primero con su talla, existencia y fotos.</p></div>}
            <div className={f.grupos}>
              {datos.grupos.map((grupo, indice) => <VarianteProductoPanel key={grupo.clave} grupo={grupo} numero={indice + 1}
                coloresDisponibles={coloresPara(grupo.clave)} tallas={vm.tallasCategoria} categoriaSeleccionada={Boolean(datos.idCategoria)}
                cargandoTallas={vm.cargandoTallas} errorTallas={vm.errorTallas} error={errores[`grupo.${grupo.clave}`]} bloqueado={vm.bloqueado}
                marcarFotosNuevas={edicion} acciones={vm} />)}
            </div>
            {datos.fotosSinColor.length > 0 && <div className={f.sinColor}>
              <Aviso tono="advertencia" titulo="Fotos sin color">Estas fotos no están ligadas a ninguno de los colores del producto.
                Asígnales uno para conservarlas o quítalas.</Aviso>
              <ul className={f.listaSinColor}>{datos.fotosSinColor.map((foto, indice) => <li key={foto.clave}>
                <img src={foto.url ?? ''} alt={`Foto sin color ${indice + 1}`} loading="lazy" />
                <select value={foto.color} aria-label={`Color de la foto sin color ${indice + 1}`} disabled={vm.bloqueado}
                  aria-invalid={Boolean(errores.fotos && !foto.color)} onChange={e => vm.asignarColorFoto(foto.clave, e.target.value)}>
                  <option value="">Asignar a un color…</option>
                  {activos.filter(grupo => grupo.color).map(grupo => <option key={grupo.clave} value={grupo.color}>{grupo.color}</option>)}
                </select>
                <button type="button" className={estilos.botonIcono} aria-label={`Quitar la foto sin color ${indice + 1}`} disabled={vm.bloqueado}
                  onClick={() => vm.quitarFotoSinColor(foto.clave)}><Icono nombre="trash" tamano={14} /></button>
              </li>)}</ul>
            </div>}
            <div className={f.pieVariantes}>
              <Boton variante="secundario" icono={<Icono nombre="plus" tamano={16} />} disabled={vm.bloqueado} onClick={vm.agregarColor}>Agregar color</Boton>
              {vm.archivosNuevos > 0 && <span className={f.contadorFotos} aria-live="polite">{vm.archivosNuevos} de {MAXIMO_ARCHIVOS_NUEVOS} fotos nuevas por guardado</span>}
            </div>
            {errores.variantes && <p className={estilos.errorCampo} role="alert">{errores.variantes}</p>}
            {errores.fotos && <p className={estilos.errorCampo} role="alert">{errores.fotos}</p>}
          </section>

          <fieldset id={SECCIONES.precios} className={`${estilos.tarjeta} ${f.seccion}`} disabled={vm.bloqueado} onFocusCapture={() => vm.setPaso(PasoAlta.PRECIOS)}>
            <legend className={estilos.soloLectores}>Precios por esquema</legend>
            <div className={estilos.tituloSeccion}><span>4</span><div><h2>Precios por esquema *</h2>
              <p>Base es obligatorio y aplica desde 1 pieza. Los esquemas por volumen son opcionales y no pueden superar a Base.</p></div></div>
            <PreciosProductoPanel precios={datos.precios} alCambiar={precios => vm.actualizarCampo('precios', precios)} error={errores.precios} />
          </fieldset>
        </div>

        <aside className={estilos.lateralFormulario} aria-label="Publicación y vista previa">
          <fieldset id={SECCIONES.publicacion} className={`${estilos.tarjeta} ${f.seccion}`} disabled={vm.bloqueado}>
            <legend className={estilos.soloLectores}>Publicación</legend><h2>Publicación</h2>
            <Radio name="publicacion" etiqueta="Publicado · visible para clientes" checked={datos.estado === EstadoProducto.PUBLICADO}
              onChange={() => vm.actualizarCampo('estado', EstadoProducto.PUBLICADO)} />
            {vm.estadoOriginal === EstadoProducto.STOCK_BAJO && <Radio name="publicacion" etiqueta="Stock bajo · visible, con aviso de pocas piezas"
              checked={datos.estado === EstadoProducto.STOCK_BAJO} onChange={() => vm.actualizarCampo('estado', EstadoProducto.STOCK_BAJO)} />}
            <Radio name="publicacion" etiqueta="Borrador · oculto en la tienda" checked={datos.estado === EstadoProducto.BORRADOR}
              onChange={() => vm.actualizarCampo('estado', EstadoProducto.BORRADOR)} />
            {edicion && <Radio name="publicacion" etiqueta="Inactivo · fuera de la tienda" checked={datos.estado === EstadoProducto.INACTIVO}
              onChange={() => vm.actualizarCampo('estado', EstadoProducto.INACTIVO)} />}
            {errores.estado && <p className={estilos.errorCampo}>{errores.estado}</p>}
          </fieldset>
          <section className={estilos.tarjeta} aria-labelledby={`${id}-vista`}><h2 id={`${id}-vista`}>Vista previa en tienda</h2>
            <div className={estilos.vistaPreviaImagen}>{imagenPortada && errorPortada !== imagenPortada
              ? <img src={imagenPortada} alt={datos.nombre || 'Vista previa del producto'} onError={() => setErrorPortada(imagenPortada)} />
              : <div className={estilos.sinImagen}><Icono nombre="image" tamano={36} /><span>Foto principal del primer color</span></div>}
              <span className={estilos.corazonPreview} aria-hidden="true"><Icono nombre="heart" tamano={16} /></span>
            </div>
            <div className={estilos.datosPreview}><p className={estilos.sobretitulo}>{marca || 'Marca'}</p>
              <p>{datos.nombre || 'Nombre del producto'}</p>
              <strong>{precioBase && Number.isFinite(precioBase.precio) ? formatoMoneda.format(precioBase.precio) : '$0.00'} <small>MXN · Base</small></strong>
              <small className={f.contadorFotos}>{activos.length} {activos.length === 1 ? 'color' : 'colores'} · {tallasActivas} {tallasActivas === 1 ? 'variante' : 'variantes'}</small>
            </div>
          </section>
          <div className={estilos.accionesLateral}>{acciones(true)}</div>
          {vm.guardando && vm.archivosNuevos > 0 && <p className={f.contadorFotos} role="status">Subiendo {vm.archivosNuevos} {vm.archivosNuevos === 1 ? 'foto' : 'fotos'}…</p>}
        </aside>
      </div>
    </form>

    <Dialogo abierto={confirmarSalida} alCerrar={cerrarDialogo} titulo="¿Descartar cambios?" icono="alert-triangle" alineacion="izquierda">
      <div className={estilos.contenidoBaja}>
        <p>Si sales ahora se pierden los cambios que no has guardado{edicion && datos.nombre ? ` en «${datos.nombre}»` : ''}.</p>
        <div className={estilos.accionesBaja}>
          <Boton variante="secundario" onClick={cerrarDialogo}>Seguir editando</Boton>
          <Boton variante="peligroSolido" onClick={() => { setConfirmarSalida(false); alRegresar() }}>Descartar cambios</Boton>
        </div>
      </div>
    </Dialogo>
  </div>
}
