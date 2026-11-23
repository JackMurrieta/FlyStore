import { useId } from 'react'
import { grupoActivo, type GrupoColorTs } from '../../dominio/DatosProductoTs'
import type { TallaTs } from '../../dominio/TallaTs'
import type { FormularioProductoVM } from '../hooks/useFormularioProducto'
import { Boton } from '@compartido/ui/Boton'
import { Icono } from '@compartido/ui/iconos/Icono'
import { FotosColorPanel } from './FotosColorPanel'
import estilos from '../vistas/CatalogoAdmin.module.css'
import f from '../vistas/FormularioProducto.module.css'

type Acciones = Pick<FormularioProductoVM, 'cambiarColor' | 'quitarColor' | 'restaurarColor' | 'agregarVariante' | 'cambiarTalla'
  | 'cambiarExistencia' | 'quitarVariante' | 'restaurarVariante' | 'agregarFotos' | 'quitarFoto' | 'moverFoto'>

interface Props {
  grupo: GrupoColorTs
  numero: number
  /** Colores que puede elegir un color nuevo (sin los que ya usan otros grupos). */
  coloresDisponibles: string[]
  tallas: TallaTs[]
  categoriaSeleccionada: boolean
  cargandoTallas: boolean
  errorTallas: string | null
  error?: string
  bloqueado: boolean
  /** Edición: marca las fotos que aún no se han subido. */
  marcarFotosNuevas?: boolean
  acciones: Acciones
}

/**
 * Un color del producto (tarjeta «Variante» del Figma B2): color predominante, sus tallas con existencia
 * y sus fotos. Cada talla es una variante vendible; las fotos se ligan al color.
 */
export function VarianteProductoPanel({ grupo, numero, coloresDisponibles, tallas, categoriaSeleccionada, cargandoTallas, errorTallas,
  error, bloqueado, marcarFotosNuevas = false, acciones }: Props) {
  const id = useId()
  const guardado = grupo.variantes.some(variante => variante.idVariante)
  const nombre = grupo.color || `color ${numero}`
  const activas = grupo.variantes.filter(variante => !variante.quitada)
  const ayudaTallas = !categoriaSeleccionada ? 'Primero elige la línea del producto en la sección 1.'
    : cargandoTallas ? 'Cargando las tallas de la línea…'
      : errorTallas ? `No se pudieron cargar las tallas: ${errorTallas}`
        : !tallas.length ? 'La línea seleccionada no tiene tallas disponibles.' : null

  if (!grupoActivo(grupo)) {
    const conPedidos = grupo.variantes.some(variante => variante.conPedidos)
    return <section className={f.grupo} aria-labelledby={`${id}-titulo`}>
      <div className={f.grupoEncabezado}><h3 id={`${id}-titulo`}><Muestra hex={grupo.hex} />Color {numero} · {grupo.color}</h3></div>
      <div className={f.colorQuitado} role="status">
        <p><strong>{grupo.color}</strong> se quitará al guardar, junto con sus fotos.
          {conPedidos && ' Las tallas que están en pedidos o carritos se conservan con existencia 0.'}</p>
        <Boton variante="secundario" icono={<Icono nombre="undo" tamano={16} />} disabled={bloqueado}
          onClick={() => acciones.restaurarColor(grupo.clave)}>Deshacer</Boton>
      </div>
    </section>
  }

  return <section className={`${f.grupo} ${error ? f.grupoError : ''}`} aria-labelledby={`${id}-titulo`} id={`color-${grupo.clave}`}>
    <div className={f.grupoEncabezado}>
      <h3 id={`${id}-titulo`}><Muestra hex={grupo.hex} />Color {numero}{grupo.color ? ` · ${grupo.color}` : ''}</h3>
      <button type="button" className={estilos.botonIcono} aria-label={`Quitar el ${guardado ? `color ${grupo.color}` : nombre}`} title="Quitar color"
        disabled={bloqueado} onClick={() => acciones.quitarColor(grupo.clave)}><Icono nombre="trash" tamano={15} /></button>
    </div>

    <div className={f.grupoCuerpo}>
      {guardado
        ? <div className={f.colorFijo}><span>Color predominante</span>
            <div><Muestra hex={grupo.hex} />{grupo.color}</div>
            <small>Ya tiene variantes guardadas; para otro color agrega un color nuevo.</small></div>
        : <label className={estilos.campoSelect}>Color predominante *
            <select value={grupo.color} disabled={bloqueado || !coloresDisponibles.length} aria-invalid={Boolean(error && !grupo.color)}
              aria-describedby={error ? `${id}-error` : undefined} onChange={e => acciones.cambiarColor(grupo.clave, e.target.value)}>
              <option value="">{coloresDisponibles.length ? 'Selecciona un color' : 'Sin colores disponibles'}</option>
              {coloresDisponibles.map(color => <option key={color} value={color}>{color}</option>)}
            </select>
          </label>}

      <div className={f.tallas} role="group" aria-label={`Tallas y existencias de ${nombre}`}>
        <div className={`${f.filaTalla} ${f.cabeceraTallas}`} aria-hidden="true"><span>Talla *</span><span>Existencia *</span><span /></div>
        {grupo.variantes.map((variante, indice) => {
          if (variante.quitada) {
            return <div key={variante.clave} className={f.filaQuitada}>
              <p><s>{variante.talla || 'Sin talla'}</s> se quitará al guardar.{variante.conPedidos && ' Está en pedidos o carritos: se conservará con existencia 0.'}</p>
              <button type="button" className={f.botonTexto} disabled={bloqueado}
                onClick={() => acciones.restaurarVariante(grupo.clave, variante.clave)}><Icono nombre="undo" tamano={14} />Deshacer</button>
            </div>
          }
          const usadas = new Set(grupo.variantes.filter(otra => otra.clave !== variante.clave).map(otra => otra.talla))
          const etiqueta = variante.talla || `talla ${indice + 1}`
          const unica = activas.length === 1 && !guardado
          return <div key={variante.clave} className={f.filaTalla}>
            {variante.idVariante
              ? <div className={f.tallaFija}><span className={variante.talla ? undefined : f.sinTalla}>{variante.talla || 'Sin talla'}</span>
                  {variante.sku && <small title={variante.sku}>SKU {variante.sku}</small>}</div>
              : <select value={variante.talla} aria-label={`Talla ${indice + 1} de ${nombre}`} aria-busy={cargandoTallas}
                  aria-invalid={Boolean(error && !variante.talla)} disabled={bloqueado || !tallas.length || cargandoTallas || Boolean(errorTallas)}
                  onChange={e => acciones.cambiarTalla(grupo.clave, variante.clave, e.target.value)}>
                  <option value="">{!categoriaSeleccionada ? 'Elige la línea' : cargandoTallas ? 'Cargando…' : !tallas.length ? 'Sin tallas' : 'Selecciona'}</option>
                  {tallas.filter(talla => !usadas.has(talla.nombre) || talla.nombre === variante.talla)
                    .map(talla => <option key={talla.idTalla} value={talla.nombre}>{talla.nombre}</option>)}
                </select>}
            <input type="number" inputMode="numeric" min={0} step={1} aria-label={`Existencia de ${nombre} ${etiqueta}`} disabled={bloqueado}
              value={Number.isFinite(variante.stock) ? variante.stock : ''}
              aria-invalid={Boolean(error && (!Number.isInteger(variante.stock) || variante.stock < 0))}
              onChange={e => acciones.cambiarExistencia(grupo.clave, variante.clave, e.target.value === '' ? NaN : Number(e.target.value))} />
            <button type="button" className={estilos.botonIcono} aria-label={`Quitar la talla ${etiqueta} de ${nombre}`}
              title={unica ? 'Es la única talla; usa «Quitar color»' : 'Quitar talla'} disabled={bloqueado || unica}
              onClick={() => acciones.quitarVariante(grupo.clave, variante.clave)}><Icono nombre="x" tamano={14} /></button>
          </div>
        })}
        {ayudaTallas && <p className={f.contadorFotos} role={errorTallas ? 'alert' : 'status'}>{ayudaTallas}</p>}
        {tallas.length > 1 && <button type="button" className={f.botonTexto} disabled={bloqueado || cargandoTallas || grupo.variantes.length >= tallas.length}
          onClick={() => acciones.agregarVariante(grupo.clave)}><Icono nombre="plus" tamano={14} />Agregar talla</button>}
      </div>
    </div>

    <FotosColorPanel color={grupo.color || `color ${numero}`} fotos={grupo.fotos} bloqueado={bloqueado} marcarNuevas={marcarFotosNuevas}
      alAgregar={archivos => acciones.agregarFotos(grupo.clave, archivos)}
      alQuitar={claveFoto => acciones.quitarFoto(grupo.clave, claveFoto)}
      alMover={(claveFoto, hasta) => acciones.moverFoto(grupo.clave, claveFoto, hasta)} />

    {error && <p id={`${id}-error`} className={estilos.errorCampo} role="alert">{error}</p>}
  </section>
}

function Muestra({ hex }: { hex: string | null }) {
  // Solo se pinta cuando el backend da el hex (edición); en el alta el catálogo solo trae nombres.
  return hex ? <span className={f.muestra} style={{ background: hex }} aria-hidden="true" /> : null
}
