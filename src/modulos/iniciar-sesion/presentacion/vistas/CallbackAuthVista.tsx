/**
 * /auth/callback?redirigir=/ruta · Regreso del inicio de sesión con Google.
 * El backend ya canjeó el código (PKCE) y dejó la sesión en cookies; aquí se espera a que la
 * app confirme la sesión y se lleva al usuario a donde iba. Si no hay sesión, se explica.
 */

import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useSesion } from '@compartido/sesion'
import { Aviso, CargaPagina, Texto } from '@compartido/ui'
import styles from './IniciarSesionVista.module.css'

/** Solo rutas internas: evita redirigir a otro sitio. */
function rutaSegura(ruta: string | null): string {
  return ruta && ruta.startsWith('/') && !ruta.startsWith('//') && !ruta.includes('\\') ? ruta : '/'
}

export default function CallbackAuthVista() {
  const [parametros] = useSearchParams()
  const { estado } = useSesion()

  if (estado === 'cargando') return <CargaPagina texto="Terminando de iniciar sesión…" conEncabezado={false} diseno="formulario" />
  if (estado === 'autenticado') return <Navigate to={rutaSegura(parametros.get('redirigir'))} replace />

  return (
    <main className={styles.contenedor}>
      <div className={styles.tarjeta}>
        <header className={styles.encabezado}>
          <Texto variante="h2" como="h1">No pudimos iniciar tu sesión</Texto>
        </header>
        <div className={styles.formulario}>
          <Aviso tono="error">El inicio de sesión con Google no se completó. Inténtalo de nuevo.</Aviso>
          <Link to="/iniciar-sesion" className={styles.botonEnlace}>Volver a iniciar sesión</Link>
        </div>
      </div>
    </main>
  )
}
