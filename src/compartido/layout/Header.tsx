/**
 * Header principal de la aplicación
 * Navegación compartida entre todas las páginas
 */

import { Link } from 'react-router-dom'
import { useSesion } from '@compartido/sesion/SesionContext'
import { Texto } from '@compartido/ui/Texto'
import { Boton } from '@compartido/ui/Boton'
import { Icono } from '@compartido/ui/iconos/Icono'
import styles from './Header.module.css'

export function Header() {
  const { estado, usuario } = useSesion()

  return (
    <header className={styles.header}>
      <div className={styles.contenedor}>
        {/* Navegación izquierda - Categorías */}
        <nav className={styles.nav}>
          <Link to="/categoria/gorra" className={styles.enlace}>
            <Texto variante="etiqueta-fuerte">GORRAS</Texto>
          </Link>
          <Link to="/categoria/prenda" className={styles.enlace}>
            <Texto variante="etiqueta-fuerte">ROPA</Texto>
          </Link>
          <Link to="/categoria/perfumes" className={styles.enlace}>
            <Texto variante="etiqueta-fuerte">PERFUMES</Texto>
          </Link>
          <Link to="/categoria/tenis" className={styles.enlace}>
            <Texto variante="etiqueta-fuerte">TENIS</Texto>
          </Link>
        </nav>

        {/* Logo centrado */}
        <Link to="/" className={styles.logo}>
          <img
            src="/flyBlanco.svg"
            alt="FlyStore Logo"
            className={styles.logoImagen}
          />
        </Link>

        {/* Acciones derecha - Buscador + Carrito + Usuario */}
        <div className={styles.acciones}>
          {/* Barra de búsqueda */}
          <div className={styles.searchContainer}>
            <button className={styles.searchIcon} aria-label="Buscar">
              <Icono nombre="search" />
            </button>
            <input
              type="search"
              placeholder="Buscar gorra, tenis, perfume..."
              className={styles.searchInput}
              aria-label="Buscar productos"
            />
          </div>

          {/* Carrito */}
          <Link to="/carrito" className={styles.iconoBtn} aria-label="Ver carrito">
            <Icono nombre="cart" />
          </Link>

          {/* Usuario / Login */}
          {estado === 'autenticado' && usuario ? (
            <Link to="/perfil" className={styles.perfil}>
              <div className={styles.avatar}>{usuario.iniciales}</div>
              <Texto variante="etiqueta-fuerte" className={styles.nombreUsuario}>
                {usuario.nombre.split(' ')[0]}
              </Texto>
            </Link>
          ) : (
            <Link to="/iniciar-sesion">
              <Boton variante="primario">Iniciar sesión</Boton>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
