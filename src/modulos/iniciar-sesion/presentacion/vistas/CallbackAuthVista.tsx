/**
 * Vista de Callback OAuth
 * Muestra mensaje de "verificando..." mientras el backend procesa el callback
 *
 * El backend maneja todo el flujo OAuth (Opción B del PROMPT),
 * esta vista solo muestra un estado de carga mientras redirige
 */

import { useEffect } from 'react'
import { Texto } from '@compartido/ui/Texto'
import styles from './CallbackAuthVista.module.css'

export default function CallbackAuthVista() {
  useEffect(() => {
    // El backend ya manejó el callback y seteó la cookie
    // Redirige al inicio tras un breve delay
    const timer = setTimeout(() => {
      window.location.href = '/'
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles.contenedor}>
      <div className={styles.contenido}>
        <div className={styles.spinner} />
        <Texto variante="h3">Verificando autenticación...</Texto>
        <Texto variante="cuerpo" tono="secundario">
          Serás redirigido en breve
        </Texto>
      </div>
    </div>
  )
}
