import { useId, useState, type DragEvent } from 'react'
import { Aviso, Icono, Insignia, Texto } from '@compartido/ui'
import estilos from './venta.module.css'

interface Props {
  readonly archivo: File | null
  readonly vistaPreviaUrl: string | null
  readonly esPdf: boolean
  readonly mensajeError: string | null
  readonly errorDeConexion: boolean
  readonly comprobanteValido: boolean
  readonly archivoValidoLocal: boolean
  readonly validando: boolean
  readonly seleccionarArchivo: (archivo: File | null) => void
}

const ACEPTA = 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf'

function tamanoLegible(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** «Tu comprobante» (B4, A6, A7): seleccionar, vista previa y estado de validación. */
export function ComprobantePago(props: Props) {
  const { archivo, mensajeError, errorDeConexion } = props
  const entradaId = useId()
  const [arrastrando, setArrastrando] = useState(false)
  const extension = archivo?.name.split('.').pop()?.toUpperCase() ?? ''
  const invalido = Boolean(archivo) && !props.archivoValidoLocal

  const soltar = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setArrastrando(false)
    const elegido = e.dataTransfer.files.item(0)
    if (elegido) props.seleccionarArchivo(elegido)
  }

  const entrada = (
    <input id={entradaId} type="file" accept={ACEPTA} className={estilos.visuallyHidden}
      onChange={(e) => { props.seleccionarArchivo(e.target.files?.item(0) ?? null); e.target.value = '' }} />
  )

  return (
    <section className={estilos.tarjeta} aria-labelledby="titulo-comprobante">
      <div className={estilos.encabezadoTarjeta}>
        <div>
          <Texto variante="h3" como="h2" id="titulo-comprobante">Tu comprobante</Texto>
          <Texto variante="cuerpo-s" como="p" tono="secundario">JPG, PNG o PDF · máximo 5 MB.</Texto>
        </div>
      </div>

      {mensajeError && (
        <Aviso tono="error" titulo={errorDeConexion ? 'El comprobante no se pudo subir' : 'No pudimos usar ese archivo'}>
          {errorDeConexion ? `${mensajeError} Tu archivo sigue seleccionado; inténtalo de nuevo.` : mensajeError}
        </Aviso>
      )}

      {!archivo ? (
        <div className={estilos.zonaArchivo} data-arrastrando={arrastrando}
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
          onDragLeave={() => setArrastrando(false)} onDrop={soltar}>
          <Icono nombre="upload" tamano={24} />
          <Texto variante="etiqueta-fuerte">Arrastra tu comprobante o selecciónalo</Texto>
          <Texto variante="mini" tono="secundario">JPG, PNG o PDF · máximo 5 MB</Texto>
          {entrada}
          <label htmlFor={entradaId} className={estilos.botonSubir}>
            <Icono nombre="upload" tamano={18} /> Subir comprobante
          </label>
        </div>
      ) : (
        <div className={estilos.archivo} data-invalido={invalido}>
          <div className={estilos.miniaturaArchivo}>
            {props.vistaPreviaUrl && !invalido
              ? <img src={props.vistaPreviaUrl} alt="Vista previa del comprobante" />
              : <div><Icono nombre={props.esPdf ? 'file' : 'image'} tamano={28} /><Texto variante="etiqueta-fuerte">.{extension}</Texto></div>}
          </div>
          <div>
            <Texto variante="etiqueta-fuerte" className={estilos.nombreArchivo}>{archivo.name}</Texto>
            <Texto variante="mini" tono="secundario">{tamanoLegible(archivo.size)}</Texto>
            {invalido && <EstadoArchivo tono="error" icono="ban" texto="Formato y tamaño no permitidos" />}
            {!invalido && errorDeConexion && <EstadoArchivo tono="error" icono="ban" texto="Carga interrumpida" />}
            {!invalido && !errorDeConexion && props.comprobanteValido && <EstadoArchivo tono="exito" icono="check-circle" texto="Comprobante recibido" />}
            {!invalido && !errorDeConexion && !props.comprobanteValido && !mensajeError && (
              <EstadoArchivo tono="exito" icono="check-circle" texto="Formato y tamaño válidos" />
            )}
            {entrada}
            <label htmlFor={entradaId} className={estilos.botonTexto} aria-disabled={props.validando}>
              <Icono nombre="refresh" tamano={18} />
              <Texto variante="boton">Cambiar archivo</Texto>
            </label>
          </div>
        </div>
      )}
      {props.validando && (
        <div className={estilos.estadoCargaCompacto} role="status" aria-live="polite">
          <span className={estilos.spinner} aria-hidden="true" />
          <Texto variante="cuerpo-s" tono="secundario">Subiendo y validando tu comprobante…</Texto>
        </div>
      )}
    </section>
  )
}

function EstadoArchivo({ tono, icono, texto }: { readonly tono: 'exito' | 'error'; readonly icono: 'check-circle' | 'ban'; readonly texto: string }) {
  return (
    <Insignia tono={tono}>
      <span className={estilos.contenidoInsignia}><Icono nombre={icono} tamano={14} />{texto}</span>
    </Insignia>
  )
}
