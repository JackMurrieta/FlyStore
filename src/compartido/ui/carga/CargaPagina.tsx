import { BarraCarga } from './BarraCarga'
import { CargaContenido, Esqueleto, EsqueletoTexto } from './Esqueleto'
import estilos from './Carga.module.css'

export type DisenoCarga = 'tarjetas' | 'lista' | 'columnas' | 'formulario' | 'texto'

export interface CargaPaginaProps {
  readonly texto?: string
  /** Forma del contenido que se está cargando, para que el esqueleto se parezca a la página. */
  readonly diseno?: DisenoCarga
  /** Con encabezado de tienda (rutas completas) o solo el contenido (dentro de una página). */
  readonly conEncabezado?: boolean
}

/** Carga de una página: barra superior + esqueleto con la forma del contenido. Para Suspense y guardas de ruta. */
export function CargaPagina({ texto = 'Cargando…', diseno = 'columnas', conEncabezado = true }: CargaPaginaProps) {
  return (
    <div className={estilos.pagina}>
      <BarraCarga />
      {conEncabezado && (
        <div className={estilos.encabezado} aria-hidden="true">
          <div className={estilos.soloEscritorio}>
            <Esqueleto forma="texto" ancho={64} /><Esqueleto forma="texto" ancho={56} /><Esqueleto forma="texto" ancho={72} />
          </div>
          <Esqueleto ancho={76} alto={36} />
          <div><Esqueleto forma="pastilla" ancho={180} alto={40} className={estilos.soloEscritorio} /><Esqueleto forma="circulo" ancho={32} /></div>
        </div>
      )}
      <CargaContenido texto={texto} className={estilos.contenido}>
        <span className={estilos.lineas} style={{ maxWidth: 320 }}>
          <Esqueleto forma="texto" ancho={90} />
          <Esqueleto forma="titulo" ancho="100%" />
        </span>
        <CuerpoCarga diseno={diseno} />
      </CargaContenido>
    </div>
  )
}

/** Solo el cuerpo del esqueleto (sin barra ni encabezado), para secciones dentro de una página. */
export function CuerpoCarga({ diseno }: { readonly diseno: DisenoCarga }) {
  switch (diseno) {
    case 'tarjetas':
      return (
        <div className={estilos.rejilla}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={estilos.pila}>
              <Esqueleto alto={220} />
              <EsqueletoTexto lineas={2} />
            </div>
          ))}
        </div>
      )
    case 'lista':
      return (
        <div className={estilos.pila}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={`${estilos.tarjeta} ${estilos.fila}`}>
              <Esqueleto ancho={64} alto={64} />
              <EsqueletoTexto lineas={2} ultima="40%" />
              <Esqueleto forma="texto" ancho={72} />
            </div>
          ))}
        </div>
      )
    case 'formulario':
      return (
        <div className={estilos.tarjeta} style={{ maxWidth: 720 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={estilos.lineas}>
              <Esqueleto forma="texto" ancho={120} />
              <Esqueleto alto={44} />
            </span>
          ))}
          <Esqueleto ancho={180} alto={44} />
        </div>
      )
    case 'texto':
      return (
        <div className={estilos.pila} style={{ maxWidth: 760 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={estilos.lineas}>
              <Esqueleto forma="texto" ancho="40%" />
              <EsqueletoTexto lineas={4} ultima="70%" />
            </span>
          ))}
        </div>
      )
    default:
      return (
        <div className={estilos.columnas}>
          <div className={estilos.pila}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`${estilos.tarjeta} ${estilos.fila}`}>
                <Esqueleto ancho={88} alto={88} />
                <EsqueletoTexto lineas={3} ultima="45%" />
              </div>
            ))}
          </div>
          <div className={estilos.tarjeta}>
            <Esqueleto forma="titulo" ancho="50%" />
            <EsqueletoTexto lineas={4} />
            <Esqueleto alto={44} />
          </div>
        </div>
      )
  }
}
