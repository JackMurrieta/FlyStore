/**
 * /auth/confirmar?token_hash=…&type=… · Destino de los enlaces de los correos de Supabase
 * (confirmar registro, restablecer contraseña y confirmar cambio de correo). Envía el token_hash
 * al backend, que lo verifica y abre la sesión en cookies; el front nunca habla con Supabase.
 */

import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { contenedor } from '@app/contenedor'
import { Aviso, CargaPagina, Texto } from '@compartido/ui'
import { useConfirmarCuenta } from '../hooks/useCuentaPorCorreo'
import styles from './IniciarSesionVista.module.css'

export default function ConfirmarCuentaVista() {
  const [parametros] = useSearchParams()
  const estado = useConfirmarCuenta(contenedor.autenticacionService, contenedor.sesionModel,
    parametros.get('token_hash'), parametros.get('type'))

  if (estado.fase === 'confirmando') return <CargaPagina texto="Confirmando tu enlace…" diseno="formulario" conEncabezado={false} />

  if (estado.fase === 'listo' && estado.confirmacion.tipo === 'recovery' && estado.confirmacion.acceso) {
    return <Navigate to="/restablecer-contrasena" replace />
  }

  const confirmacion = estado.fase === 'listo' ? estado.confirmacion : null
  const titulo = !confirmacion
    ? 'No pudimos confirmar el enlace'
    : confirmacion.tipo === 'email_change'
      ? confirmacion.acceso ? 'Tu correo cambió' : 'Falta un paso'
      : '¡Cuenta confirmada!'

  return (
    <main className={styles.contenedor}>
      <div className={styles.tarjeta}>
        <Link to="/" className={styles.logo} aria-label="FlyStore, ir al inicio">
          <img src="/flyBlanco.svg" alt="" className={styles.logoImagen} />
        </Link>
        <header className={styles.encabezado}>
          <Texto variante="h2" como="h1">{titulo}</Texto>
        </header>
        <div className={styles.formulario}>
          {estado.fase === 'error' ? (
            <>
              <Aviso tono="error">{estado.mensaje}</Aviso>
              <Link to="/iniciar-sesion" className={styles.botonEnlace}>Iniciar sesión</Link>
              <Link to="/recuperar-contrasena" className={styles.botonEnlaceSecundario}>Pedir un enlace nuevo</Link>
            </>
          ) : (
            <>
              <Aviso tono={confirmacion?.acceso ? 'exito' : 'info'}>{confirmacion?.mensaje}</Aviso>
              {confirmacion?.tipo === 'email_change'
                ? <Link to="/perfil/seguridad" className={styles.botonEnlace}>Ir a mi perfil</Link>
                : <Link to="/" className={styles.botonEnlace}>Empezar a comprar</Link>}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
