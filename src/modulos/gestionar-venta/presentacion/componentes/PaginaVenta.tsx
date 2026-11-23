import type { ReactNode } from 'react'
import { Header } from '@compartido/layout/Header'
import { Footer } from '@compartido/layout/Footer'
import { BarraCarga, CargaContenido, CuerpoCarga, Esqueleto, EsqueletoTexto, Texto } from '@compartido/ui'
import { PasosCompra, type PasoCompra } from './PasosCompra'
import estilos from './venta.module.css'

interface Props {
  readonly titulo?: string
  readonly subtitulo?: string
  readonly paso?: PasoCompra
  readonly conPie?: boolean
  readonly children: ReactNode
}

/** Estructura común de las pantallas del checkout: encabezado de tienda, títulos y pasos. */
export function PaginaVenta({ titulo, subtitulo, paso, conPie = false, children }: Props) {
  return (
    <div className={estilos.pagina}>
      <Header />
      <main className={estilos.contenido}>
        {(titulo || paso) && (
          <div className={estilos.encabezadoPaso}>
            {titulo && (
              <div className={estilos.titulos}>
                <Texto variante="h1" como="h1">{titulo}</Texto>
                {subtitulo && <Texto variante="cuerpo-s" como="p" tono="secundario">{subtitulo}</Texto>}
              </div>
            )}
            {paso && <PasosCompra actual={paso} />}
          </div>
        )}
        {children}
      </main>
      {conPie && <Footer />}
    </div>
  )
}

export type DisenoCargaVenta = 'carrito' | 'pedidos' | 'ticket' | 'filas'

/**
 * Esqueleto con la forma de lo que se está cargando (CU-02): líneas del carrito con su resumen,
 * lista de pedidos con su detalle, ticket o filas de datos. Anuncia el texto a lectores de pantalla.
 */
export function EstadoCarga({ texto, diseno = 'carrito' }: { readonly texto: string; readonly diseno?: DisenoCargaVenta }) {
  return (
    <CargaContenido texto={texto}>
      <BarraCarga />
      {diseno === 'carrito' && <CuerpoCarga diseno="columnas" />}
      {diseno === 'filas' && (
        <div className={estilos.esqueletoFilas}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}><Esqueleto forma="texto" ancho={140} /><Esqueleto forma="texto" ancho="45%" /></div>
          ))}
        </div>
      )}
      {diseno === 'pedidos' && (
        <div className={estilos.misPedidos}>
          <div className={estilos.listaPedidos}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={estilos.tarjetaPedido} aria-hidden="true">
                <span className={estilos.fila} style={{ width: '100%' }}><Esqueleto forma="texto" ancho={96} /><Esqueleto forma="texto" ancho={56} /></span>
                <Esqueleto forma="texto" ancho={140} />
                <Esqueleto forma="pastilla" ancho={150} />
              </div>
            ))}
          </div>
          <div className={estilos.tarjeta}>
            <Esqueleto forma="texto" ancho={60} />
            <Esqueleto forma="titulo" ancho={200} />
            <Esqueleto alto={72} />
            <EsqueletoTexto lineas={3} />
          </div>
        </div>
      )}
      {diseno === 'ticket' && (
        <div className={estilos.registrado}>
          <div>
            <Esqueleto forma="circulo" ancho={48} />
            <Esqueleto forma="titulo" ancho="70%" alto={56} />
            <EsqueletoTexto lineas={2} />
            <Esqueleto alto={160} />
          </div>
          <Esqueleto alto={420} />
        </div>
      )}
    </CargaContenido>
  )
}
