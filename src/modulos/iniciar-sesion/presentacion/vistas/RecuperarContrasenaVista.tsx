/**
 * /recuperar-contrasena · «Olvidé mi contraseña»: envía un enlace para crear una nueva.
 * La respuesta es la misma exista o no la cuenta (no revela quién está registrado).
 */

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { contenedor } from '@app/contenedor'
import { Aviso, Boton, Campo, Texto } from '@compartido/ui'
import { useRecuperarContrasena } from '../hooks/useCuentaPorCorreo'
import styles from './IniciarSesionVista.module.css'

export default function RecuperarContrasenaVista() {
  const [correo, setCorreo] = useState('')
  const { enviando, error, mensaje, enviar } = useRecuperarContrasena(contenedor.autenticacionService)

  const alEnviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    void enviar(correo)
  }

  return (
    <main className={styles.contenedor}>
      <div className={styles.tarjeta}>
        <Link to="/" className={styles.logo} aria-label="FlyStore, ir al inicio">
          <img src="/flyBlanco.svg" alt="" className={styles.logoImagen} />
        </Link>
        <header className={styles.encabezado}>
          <Texto variante="h2" como="h1">Recupera tu contraseña</Texto>
          <Texto variante="cuerpo" tono="secundario">Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.</Texto>
        </header>

        {mensaje ? (
          <div className={styles.formulario}>
            <Aviso tono="exito" titulo="Revisa tu correo">{mensaje}</Aviso>
            <Texto variante="cuerpo-s" tono="secundario">El enlace vence pronto; si no llega en unos minutos, vuelve a pedirlo.</Texto>
          </div>
        ) : (
          <form onSubmit={alEnviar} className={styles.formulario} noValidate>
            {error && <Aviso tono="error">{error}</Aviso>}
            <Campo etiqueta="Correo electrónico" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email" required />
            <Boton type="submit" variante="primario" anchoCompleto cargando={enviando}>Enviar enlace</Boton>
          </form>
        )}

        <footer className={styles.pie}>
          <Texto variante="cuerpo-s" tono="secundario">
            ¿Ya la recordaste? <Link to="/iniciar-sesion" className={styles.enlace}>Inicia sesión</Link>
          </Texto>
        </footer>
      </div>
    </main>
  )
}
