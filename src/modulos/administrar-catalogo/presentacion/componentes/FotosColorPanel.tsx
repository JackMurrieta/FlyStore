import { useId, type ChangeEvent } from 'react'
import type { FotoProductoTs } from '../../dominio/DatosProductoTs'
import { Icono } from '@compartido/ui/iconos/Icono'
import { TIPOS_IMAGEN } from '../../aplicacion/ProductoModel'
import estilos from '../vistas/CatalogoAdmin.module.css'
import f from '../vistas/FormularioProducto.module.css'

interface Props {
  /** Nombre con el que se anuncian las fotos (el color, o «color 2» si aún no se elige). */
  color: string
  fotos: FotoProductoTs[]
  bloqueado: boolean
  /** En edición se marcan las fotos que aún no se han subido (en el alta todas lo son). */
  marcarNuevas?: boolean
  alAgregar: (archivos: File[]) => void
  alQuitar: (claveFoto: string) => void
  alMover: (claveFoto: string, hasta: number) => void
}

/** Fotos de un color: la primera es la principal; se reordenan con botones (accesible con teclado). */
export function FotosColorPanel({ color, fotos, bloqueado, marcarNuevas = false, alAgregar, alQuitar, alMover }: Props) {
  const ayudaId = useId()
  const nombre = color
  const seleccionar = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? [])
    evento.target.value = ''
    alAgregar(archivos)
  }
  return <div className={f.fotos}>
    <p id={ayudaId} className={f.fotosTitulo}><strong>Fotos de {nombre} *</strong>
      La primera es la principal · JPG, PNG o WEBP · máx. 5 MB c/u</p>
    <ul className={f.listaFotos} aria-label={`Fotos de ${nombre}`}>
      {fotos.map((foto, indice) => {
        const nueva = marcarNuevas && Boolean(foto.archivo)
        const descripcion = `foto ${indice + 1} de ${nombre}`
        return <li key={foto.clave} className={`${f.foto} ${indice === 0 ? f.fotoPrincipal : ''}`}>
          <img src={foto.vistaPrevia ?? foto.url ?? ''} alt={`${indice === 0 ? 'Principal: ' : ''}${descripcion}${nueva ? ', nueva sin guardar' : ''}`} loading="lazy" />
          {indice === 0 && <span className={f.etiquetaFoto}><Icono nombre="star" tamano={10} />Principal</span>}
          {nueva && indice > 0 && <span className={`${f.etiquetaFoto} ${f.etiquetaNueva}`} aria-hidden="true">Nueva</span>}
          <div className={f.accionesFoto}>
            <button type="button" aria-label={`Hacer principal la ${descripcion}`} title="Hacer principal" disabled={bloqueado || indice === 0}
              onClick={() => alMover(foto.clave, 0)}><Icono nombre="star" tamano={13} /></button>
            <button type="button" aria-label={`Mover antes la ${descripcion}`} title="Mover a la izquierda" disabled={bloqueado || indice === 0}
              onClick={() => alMover(foto.clave, indice - 1)}><Icono nombre="chevron-left" tamano={14} /></button>
            <button type="button" aria-label={`Mover después la ${descripcion}`} title="Mover a la derecha" disabled={bloqueado || indice === fotos.length - 1}
              onClick={() => alMover(foto.clave, indice + 1)}><Icono nombre="chevron-right" tamano={14} /></button>
            <button type="button" aria-label={`Quitar la ${descripcion}`} title="Quitar" disabled={bloqueado}
              onClick={() => alQuitar(foto.clave)}><Icono nombre="trash" tamano={13} /></button>
          </div>
        </li>
      })}
      <li className={f.agregarFoto}>
        <label className={estilos.cargaImagen}><Icono nombre="upload" tamano={18} /><span>Agregar</span>
          <input type="file" multiple accept={TIPOS_IMAGEN.join(',')} disabled={bloqueado}
            aria-label={`Agregar fotos de ${nombre}`} aria-describedby={ayudaId} onChange={seleccionar} />
        </label>
      </li>
    </ul>
  </div>
}
