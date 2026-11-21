/**
 * /restablecer-contrasena · Nueva contraseña después de abrir el enlace del correo.
 * Requiere la sesión que abre ese enlace (ver /auth/confirmar); el backend acepta el cambio
 * solo si la sesión viene de un enlace de recuperación reciente.
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { contenedor } from '@app/contenedor'
import { Aviso, Boton, Campo, Texto } from '@compartido/ui'
import { useRestablecerContrasena } from '../hooks/useCuentaPorCorreo'
import styles from './IniciarSesionVista.module.css'

export default function RestablecerContrasenaVista() {
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const navegar = useNavigate()
  const { guardando, errores, error, listo, guardar } = useRestablecerContrasena(contenedor.autenticacionService)

  const alGuardar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    void guardar(nueva, confirmacion)
  }

  return (
    <main className={styles.contenedor}>
      <div className={styles.tarjeta}>
        <Link to="/" className={styles.logo} aria-label="FlyStore, ir al inicio">
          <img src="/flyBlanco.svg" alt="" className={styles.logoImagen} />
        </Link>
        <header className={styles.encabezado}>
          <Texto variante="h2" como="h1">Crea tu nueva contraseña</Texto>
          <Texto variante="cuerpo" tono="secundario">Usa al menos 8 caracteres, con letras y números.</Texto>
        </header>

        {listo ? (
          <div className={styles.formulario}>
            <Aviso tono="exito" titulo="Contraseña actualizada">Ya puedes usar tu nueva contraseña para iniciar sesión.</Aviso>
            <Boton variante="primario" anchoCompleto onClick={() => navegar('/')}>Seguir comprando</Boton>
            <Boton variante="secundario" anchoCompleto onClick={() => navegar('/perfil/seguridad')}>Ir a mi perfil</Boton>
          </div>
        ) : (
          <form onSubmit={alGuardar} className={styles.formulario} noValidate>
            {error && (
              <Aviso tono="error" titulo={error.vencido ? 'El enlace venció' : undefined}>
                {error.mensaje}{' '}
                {error.vencido && <Link to="/recuperar-contrasena" className={styles.enlace}>Pedir otro enlace</Link>}
              </Aviso>
            )}
            <Campo etiqueta="Nueva contraseña" type="password" value={nueva} onChange={(e) => setNueva(e.target.value)}
              autoComplete="new-password" error={errores.nueva} ayuda="Mínimo 8 caracteres, con letras y números" />
            <Campo etiqueta="Confirma tu nueva contraseña" type="password" value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)} autoComplete="new-password" error={errores.confirmacion} />
            <Boton type="submit" variante="primario" anchoCompleto cargando={guardando}>Guardar contraseña</Boton>
          </form>
        )}
      </div>
    </main>
  )
}
