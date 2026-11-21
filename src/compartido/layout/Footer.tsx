/**
 * Pie de página (Figma «Pie de página» 148:160): marca, Tienda, Ayuda y Contacto.
 * Solo enlaza a rutas que existen o están planeadas (categorías del catálogo, CU-01).
 */

import { Link } from 'react-router-dom'
import { Icono } from '@compartido/ui/iconos/Icono'
import { CATEGORIAS, MARCA, RUTAS_AYUDA, RUTAS_CUENTA, enlaceWhatsapp } from '@compartido/config/marca'
import styles from './Footer.module.css'

const AYUDA = [
  { etiqueta: 'Mis pedidos', ruta: RUTAS_CUENTA.misPedidos },
  { etiqueta: 'Preguntas frecuentes', ruta: RUTAS_AYUDA.preguntasFrecuentes },
  { etiqueta: 'Términos y condiciones', ruta: RUTAS_AYUDA.terminos },
  { etiqueta: 'Aviso de privacidad', ruta: RUTAS_AYUDA.privacidad },
] as const

export function Footer() {
  const whatsapp = enlaceWhatsapp()
  const anio = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.contenedor}>
        <div className={styles.columnas}>
          <div className={styles.marca}>
            <Link to="/" className={styles.logo} aria-label="FlyStore, ir al inicio">
              <img src="/flyBlanco.svg" alt="" width={76} height={44} />
            </Link>
            <p className={styles.descripcion}>{MARCA.descripcion}</p>
          </div>

          <nav className={styles.columna} aria-labelledby="pie-tienda">
            <h2 id="pie-tienda" className={styles.titulo}>Tienda</h2>
            <ul>
              {CATEGORIAS.map((categoria) => (
                <li key={categoria.ruta}><Link to={categoria.ruta} className={styles.enlace}>{categoria.nombre}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className={styles.columna} aria-labelledby="pie-ayuda">
            <h2 id="pie-ayuda" className={styles.titulo}>Ayuda</h2>
            <ul>
              {AYUDA.map((enlace) => (
                <li key={enlace.ruta}><Link to={enlace.ruta} className={styles.enlace}>{enlace.etiqueta}</Link></li>
              ))}
            </ul>
          </nav>

          <div className={styles.columna}>
            <h2 className={styles.titulo}>Contacto</h2>
            <a href={`mailto:${MARCA.correoContacto}`} className={styles.correo}>
              <Icono nombre="mail" tamano={16} /> {MARCA.correoContacto}
            </a>
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
                <Icono nombre="whatsapp" tamano={18} /> Escríbenos por WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className={styles.divisor} role="presentation" />
        <p className={styles.legal}>© {anio} {MARCA.nombreComercial} · Todos los precios en MXN</p>
      </div>
    </footer>
  )
}
