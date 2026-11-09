/**
 * Vista de Inicio de Sesión
 * Basada en diseño IniciarSesion.png
 */

import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { contenedor } from '@app/contenedor'
import { useIniciarSesion } from '../hooks/useIniciarSesion'
import { Texto } from '@compartido/ui/Texto'
import { Campo } from '@compartido/ui/Campo'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Icono } from '@compartido/ui/iconos/Icono'
import styles from './IniciarSesionVista.module.css'

export default function IniciarSesionVista() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { cargando, error, login, loginConGoogle } = useIniciarSesion(
    contenedor.autenticacionService,
    contenedor.sesionModel
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const exitoso = await login({ email, password })

    if (exitoso) {
      const redirigir = searchParams.get('redirigir') || '/'
      navigate(redirigir)
    }
  }

  const handleGoogleLogin = () => {
    const redirigir = searchParams.get('redirigir')
    loginConGoogle(redirigir || undefined)
  }

  return (
    <div className={styles.contenedor}>
      <div className={styles.tarjeta}>
        {/* Logo FLY */}
        <div className={styles.logo}>
          <img src="/flyBlanco.svg" alt="FLY" className={styles.logoImagen} />
        </div>

        {/* Encabezado */}
        <header className={styles.encabezado}>
          <Texto variante="h2" como="h1">
            Iniciar sesión
          </Texto>
          <Texto variante="cuerpo" tono="secundario">
            Accede a tu cuenta para ver tus pedidos y favoritos.
          </Texto>
        </header>

        {error && <Aviso tono="error">{error.mensaje}</Aviso>}

        {/* Botón de Google primero */}
        <Boton
          variante="secundario"
          anchoCompleto
          onClick={handleGoogleLogin}
          disabled={cargando}
          icono={<Icono nombre="google" tamano={20} />}
        >
          Continuar con Google
        </Boton>

        {/* Divisor */}
        <div className={styles.divisor}>
          <span className={styles.divisorLinea} />
          <Texto variante="etiqueta" tono="secundario">
            o
          </Texto>
          <span className={styles.divisorLinea} />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.formulario}>
          <Campo
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
            autoComplete="email"
          />

          <Campo
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            autoComplete="current-password"
          />

          <Boton type="submit" variante="primario" anchoCompleto cargando={cargando}>
            INICIAR SESIÓN
          </Boton>
        </form>

        {/* Footer */}
        <footer className={styles.pie}>
          <Texto variante="cuerpo-s" tono="secundario">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className={styles.enlace}>
              Regístrate
            </Link>
          </Texto>
          <Texto variante="mini" tono="secundario" className={styles.footer}>
            FLY STORE · CIUDAD OBREGÓN
          </Texto>
        </footer>
      </div>
    </div>
  )
}
