/**
 * Footer de la aplicación
 * Información y enlaces compartidos en todas las páginas
 */

import { Link } from 'react-router-dom'
import { Texto } from '@compartido/ui/Texto'
import { Boton } from '@compartido/ui/Boton'
import { Icono } from '@compartido/ui/iconos/Icono'
import styles from './Footer.module.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.contenedor}>
        {/* Logo y columnas de navegación */}
        <div className={styles.principal}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Link to="/" className={styles.logo}>
              <div className={styles.logoPlaceholder}>
                <Texto variante="h3" como="span">
                  FLY
                </Texto>
              </div>
            </Link>
          </div>

          {/* Columnas de navegación */}
          <div className={styles.columnas}>
            {/* Categorías */}
            <div className={styles.columna}>
              <Texto variante="etiqueta-fuerte" className={styles.titulo}>
                Categorías
              </Texto>
              <nav className={styles.enlaces}>
                <Link to="/categoria/gorra" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Gorra</Texto>
                </Link>
                <Link to="/categoria/prenda" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Prenda</Texto>
                </Link>
                <Link to="/categoria/perfumes" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Perfumes</Texto>
                </Link>
                <Link to="/categoria/tenis" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Tenis</Texto>
                </Link>
              </nav>
            </div>

            {/* Soporte */}
            <div className={styles.columna}>
              <Texto variante="etiqueta-fuerte" className={styles.titulo}>
                Soporte
              </Texto>
              <nav className={styles.enlaces}>
                <Link to="/soporte/garantia" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Reparar por garantía</Texto>
                </Link>
                <Link to="/contacto" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Contacto</Texto>
                </Link>
                <Link to="/faq" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Preguntas frecuentes</Texto>
                </Link>
              </nav>
            </div>

            {/* Información */}
            <div className={styles.columna}>
              <Texto variante="etiqueta-fuerte" className={styles.titulo}>
                Información
              </Texto>
              <nav className={styles.enlaces}>
                <Link to="/acerca" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Acerca de FlyStore</Texto>
                </Link>
                <Link to="/terminos" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Términos y condiciones</Texto>
                </Link>
                <Link to="/privacidad" className={styles.enlace}>
                  <Texto variante="cuerpo-s">Política de privacidad</Texto>
                </Link>
              </nav>
            </div>
          </div>

          {/* Botón de WhatsApp */}
          <div className={styles.whatsappContainer}>
            <a
              href="https://wa.me/526441234567"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <Boton variante="whatsapp" anchoCompleto icono={<Icono nombre="whatsapp" tamano={20} />}>
                Contactar por WhatsApp
              </Boton>
            </a>
          </div>
        </div>

        {/* Separador */}
        <div className={styles.separador} />

        {/* Copyright */}
        <div className={styles.copyright}>
          <Texto variante="mini" tono="secundario">
            © {currentYear} FlyStore. Todos los derechos reservados.
          </Texto>
        </div>
      </div>
    </footer>
  )
}
