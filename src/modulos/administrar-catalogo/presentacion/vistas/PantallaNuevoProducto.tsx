import { useEffect, useId, useState, type ChangeEvent } from 'react'
import { useNuevoProducto } from '../hooks/useNuevoProducto'
import type { CatalogoModel } from '../../aplicacion/CatalogoModel'
import type { ProductoModel } from '../../aplicacion/ProductoModel'
import { PasoAlta } from '../../dominio/PasoAlta'
import { EstadoProducto } from '../../dominio/EstadoProducto'
import { Boton } from '@compartido/ui/Boton'
import { Campo } from '@compartido/ui/Campo'
import { Radio } from '@compartido/ui/Radio'
import { Chip } from '@compartido/ui/Chip'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import { VarianteProductoPanel } from '../componentes/VarianteProductoPanel'
import { PreciosProductoPanel } from '../componentes/PreciosProductoPanel'
import { formatoMoneda } from '../formato'
import estilos from './CatalogoAdmin.module.css'

interface Props {
  catalogoModel: CatalogoModel
  productoModel: ProductoModel
  alRegresar: () => void
  alRegistrado?: (mensaje: string) => void
}
export function PantallaNuevoProducto({ catalogoModel, productoModel, alRegresar, alRegistrado }: Props) {
  const vm = useNuevoProducto(catalogoModel, productoModel)
  const id = useId()
  const datos = vm.datosProducto
  const [imagenUrl, setImagenUrl] = useState<string | null>(null)
  const [errorImagen, setErrorImagen] = useState<string | null>(null)
  const [errorVistaPrevia, setErrorVistaPrevia] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const errores = vm.erroresPorCampo
  const marca = vm.filtrosDisponibles?.marcas.find(item => item.id === datos.idMarca)?.nombre
  const precioBase = datos.precios.find(precio => precio.tipoPrecio === 'BASE')

  useEffect(() => () => { if (imagenUrl) URL.revokeObjectURL(imagenUrl) }, [imagenUrl])

  const seleccionarImagen = (evento: ChangeEvent<HTMLInputElement>) => {
    const imagen = evento.target.files?.[0]
    if (!imagen) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(imagen.type) || imagen.size > 5 * 1024 * 1024) {
      setErrorImagen('Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.')
      evento.target.value = ''
      return
    }
    setErrorImagen(null); setErrorVistaPrevia(false)
    vm.actualizarCampo('imagenes', imagen)
    setImagenUrl(URL.createObjectURL(imagen))
  }
  const guardar = async () => {
    if (errorImagen || errorVistaPrevia) return
    vm.setPaso(PasoAlta.CONFIRMACION)
    const guardado = await vm.guardarProducto()
    if (guardado) alRegistrado?.(datos.estado === EstadoProducto.PUBLICADO
      ? 'El producto se registró con éxito y ya está publicado en la tienda.'
      : 'El producto se guardó como borrador correctamente.')
  }
  const acciones = (completo = false) => <>
    <Boton variante="secundario" anchoCompleto={completo} disabled={vm.bloqueado} onClick={alRegresar}>Cancelar</Boton>
    <Boton type="submit" anchoCompleto={completo} cargando={vm.guardando} disabled={vm.cargando || !!errorImagen || errorVistaPrevia}
      icono={<Icono nombre="check" tamano={16} />}>Guardar</Boton>
  </>

  if (vm.exitoso) return <main className={estilos.pantalla}>
    <Aviso tono="exito" titulo="Producto registrado">El producto se guardó correctamente.</Aviso>
    <Boton onClick={alRegresar}>Regresar al catálogo</Boton>
  </main>

  return <main className={estilos.pantalla}>
    <form className={estilos.formularioAlta} noValidate onSubmit={e => { e.preventDefault(); void guardar() }}>
    <header className={estilos.encabezadoPagina}>
      <div><p className={estilos.sobretitulo}>Catálogo</p><h1>Nuevo producto</h1>
        <p className={estilos.textoSecundario}>Los campos con * son obligatorios.</p></div>
      <div className={estilos.accionesFormulario}>{acciones()}</div>
    </header>
    {vm.error && <Aviso tono="error" titulo="No se pudo guardar el producto">{vm.error} Revisa la información e intenta guardar de nuevo.</Aviso>}
    {Object.keys(errores).length > 0 && <Aviso tono="error" titulo="Faltan datos o hay campos por revisar">
      Completa los campos señalados, agrega una imagen, al menos una variante y el precio base.
    </Aviso>}
    {vm.cargando && <p role="status">Cargando opciones…</p>}
    {vm.bloqueado && !vm.guardando && <Aviso tono="advertencia" titulo="Registro pendiente">
      Reintenta guardar para continuar desde la última operación confirmada.
    </Aviso>}
    <div className={estilos.formularioColumnas}>
      <div className={estilos.seccionesFormulario}>
        <fieldset id="categorias-producto" className={estilos.tarjeta} disabled={vm.bloqueado || vm.cargando} onFocusCapture={() => vm.setPaso(PasoAlta.DATOS)}>
          <legend className={estilos.soloLectores}>Categorías y marca</legend>
          <div className={estilos.tituloSeccion}><span>1</span><div><h2>Categorías y marca</h2><p>La categoría define las tallas disponibles.</p></div></div>
          <div className={estilos.grupoCampo}><p>Categoría del producto *</p>
            <div className={estilos.chips}>{vm.filtrosDisponibles?.categorias.map(item =>
              <Chip key={item.id} activo={datos.idCategoria === item.id} onClick={() => vm.actualizarCampo('idCategoria', item.id)}>{item.nombre}</Chip>)}</div>
            {errores.idCategoria && <p className={estilos.errorCampo}>{errores.idCategoria}</p>}
          </div>
          <div className={estilos.dosColumnas}>
            <div><label className={estilos.campoSelect}>Marca *
              <select value={datos.idMarca} aria-invalid={!!errores.idMarca} aria-describedby={errores.idMarca ? `${id}-marca-error` : undefined} onChange={e => vm.actualizarCampo('idMarca', e.target.value)}>
                <option value="">Selecciona una marca</option>{vm.filtrosDisponibles?.marcas.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select></label>{errores.idMarca && <p id={`${id}-marca-error`} className={estilos.errorCampo}>{errores.idMarca}</p>}
            </div>
            <div><label className={estilos.campoSelect}>Tipo de producto *
              <select value={datos.idSubcategoria} aria-invalid={!!errores.idSubcategoria} aria-describedby={errores.idSubcategoria ? `${id}-tipo-error` : undefined} onChange={e => vm.actualizarCampo('idSubcategoria', e.target.value)}>
                <option value="">Selecciona un tipo</option>{vm.filtrosDisponibles?.subcategorias.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select></label>{errores.idSubcategoria && <p id={`${id}-tipo-error`} className={estilos.errorCampo}>{errores.idSubcategoria}</p>}
            </div>
          </div>
        </fieldset>
        <fieldset className={estilos.tarjeta} disabled={vm.bloqueado || vm.cargando} onFocusCapture={() => vm.setPaso(PasoAlta.DATOS)}>
          <legend className={estilos.soloLectores}>Datos generales</legend>
          <div className={estilos.tituloSeccion}><span>2</span><div><h2>Datos generales</h2></div></div>
          <div className={estilos.dosColumnas}>
            <Campo etiqueta="Nombre / modelo *" placeholder="Nombre del producto" value={datos.nombre} error={errores.nombre}
              onChange={e => vm.actualizarCampo('nombre', e.target.value)} />
            <Campo etiqueta="Clave / SKU *" placeholder="Ej. NE-940-LAD-NEG" value={datos.clave} error={errores.clave}
              onChange={e => vm.actualizarCampo('clave', e.target.value)} />
          </div>
          <label className={estilos.campoSelect}>Descripción *
            <textarea value={datos.descripcion} rows={4} aria-invalid={!!errores.descripcion} aria-describedby={errores.descripcion ? `${id}-descripcion-error` : undefined} placeholder="Describe los detalles del producto"
              onChange={e => vm.actualizarCampo('descripcion', e.target.value)} />
          </label>
          {errores.descripcion && <p id={`${id}-descripcion-error`} className={estilos.errorCampo}>{errores.descripcion}</p>}
        </fieldset>
        <fieldset className={estilos.tarjeta} disabled={vm.bloqueado || vm.cargando}>
          <legend className={estilos.soloLectores}>Imagen del producto</legend>
          <div className={estilos.tituloSeccion}><span>3</span><div><h2>Imagen del producto *</h2><p>JPG, PNG o WEBP · máx. 5 MB. Se usará en el catálogo.</p></div></div>
          <div className={estilos.imagenesProducto}>
            {imagenUrl && <div className={estilos.imagenSubida}><img src={imagenUrl} alt="Imagen seleccionada del producto" onError={() => setErrorVistaPrevia(true)} /><span>Principal</span></div>}
            <label className={estilos.cargaImagen}><Icono nombre="upload" tamano={20} /><span>{imagenUrl ? 'Cambiar imagen' : 'Agregar imagen'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Imagen del producto" onChange={seleccionarImagen} />
            </label>
          </div>
          {(errorImagen || errores.imagenes || errorVistaPrevia) && <p className={estilos.errorCampo} role="alert">{errorImagen || (errorVistaPrevia ? 'No se pudo leer la imagen. Selecciona otro archivo.' : errores.imagenes)}</p>}
        </fieldset>
        <fieldset className={estilos.tarjeta} disabled={vm.bloqueado || vm.cargando} onFocusCapture={() => vm.setPaso(PasoAlta.VARIANTES)}>
          <legend className={estilos.soloLectores}>Variantes y existencias</legend>
          <div className={estilos.tituloSeccion}><span>4</span><div><h2>Variantes y existencias *</h2><p>Cada combinación de color y talla es una unidad vendible.</p></div></div>
          <Aviso tono="info" titulo="Talla y color de la variante">Las tallas dependen de la categoría seleccionada. Agrega una combinación diferente por variante.</Aviso>
          {datos.variantes.length > 0 && <div className={estilos.tablaVariantes}><table><thead><tr><th>Color</th><th>Talla</th><th>Existencia</th><th><span className={estilos.soloLectores}>Acciones</span></th></tr></thead>
            <tbody>{datos.variantes.map((variante, indice) => <tr key={`${variante.talla}-${variante.color}`}><td>{variante.color}</td><td>{variante.talla}</td><td>{variante.stock} pzas</td>
              <td><button type="button" className={estilos.botonIcono} aria-label={`Quitar variante ${variante.color} ${variante.talla}`}
                onClick={() => vm.actualizarCampo('variantes', datos.variantes.filter((_, i) => i !== indice))}><Icono nombre="trash" tamano={14} /></button></td></tr>)}</tbody></table></div>}
          <VarianteProductoPanel key={datos.idCategoria} tallas={vm.tallasCategoria}
            categoriaSeleccionada={!!datos.idCategoria} cargandoTallas={vm.cargandoTallas} errorTallas={vm.errorTallas}
            alAgregar={vm.agregarVariante} />
          {errores.variantes && <p className={estilos.errorCampo} role="alert">{errores.variantes}</p>}
        </fieldset>
        <fieldset className={estilos.tarjeta} disabled={vm.bloqueado || vm.cargando} onFocusCapture={() => vm.setPaso(PasoAlta.PRECIOS)}>
          <legend className={estilos.soloLectores}>Precios por esquema</legend>
          <div className={estilos.tituloSeccion}><span>5</span><div><h2>Precios por esquema *</h2><p>Base, Mayoreo y Distribuidor. Los importes se expresan en MXN.</p></div></div>
          <PreciosProductoPanel precios={datos.precios} alCambiar={precios => vm.actualizarCampo('precios', precios)} error={errores.precios} />
        </fieldset>
      </div>
      <aside className={estilos.lateralFormulario} aria-label="Publicación y vista previa">
        <fieldset className={estilos.tarjeta} disabled={vm.bloqueado || vm.cargando}>
          <legend className={estilos.soloLectores}>Publicación</legend><h2>Publicación</h2>
          <Radio name="publicacion" etiqueta="Publicado · visible para clientes" checked={datos.estado === EstadoProducto.PUBLICADO}
            onChange={() => vm.actualizarCampo('estado', EstadoProducto.PUBLICADO)} />
          <Radio name="publicacion" etiqueta="Borrador · oculto en la tienda" checked={datos.estado === EstadoProducto.BORRADOR}
            onChange={() => vm.actualizarCampo('estado', EstadoProducto.BORRADOR)} />
        </fieldset>
        <section className={estilos.tarjeta}><h2>Vista previa en tienda</h2>
          <div className={estilos.vistaPreviaImagen}>{imagenUrl && !errorVistaPrevia
            ? <img src={imagenUrl} alt={datos.nombre || 'Vista previa del producto'} />
            : <div className={estilos.sinImagen}><Icono nombre="image" tamano={36} /><span>Imagen del producto</span></div>}
            <span className={estilos.corazonPreview} aria-hidden="true"><Icono nombre="heart" tamano={16} /></span>
          </div>
          <div className={estilos.datosPreview}><p className={estilos.sobretitulo}>{marca || 'Marca'}</p>
            <p>{datos.nombre || 'Nombre del producto'}</p><strong>{precioBase && Number.isFinite(precioBase.precio) ? formatoMoneda.format(precioBase.precio) : '$0.00'} <small>MXN · Base</small></strong></div>
        </section>
        <div className={estilos.accionesLateral}>{acciones(true)}</div>
        <button type="button" className={estilos.enlaceDiscreto} onClick={() => setConfirmar(!confirmar)} aria-expanded={confirmar}>Revisar resumen</button>
        {confirmar && <section className={estilos.tarjeta}><h2>Confirmación</h2><p>{datos.clave || 'SKU pendiente'}</p><p>{datos.variantes.length} variantes · {datos.precios.length} precios</p>
          <p>{datos.estado === EstadoProducto.PUBLICADO ? 'Visible en tienda al guardar' : 'Se guardará como borrador'}</p></section>}
      </aside>
    </div>
    </form>
  </main>
}
