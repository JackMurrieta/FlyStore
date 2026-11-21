/** usePerfil · ViewModel de la página «Mi perfil»: carga el perfil una vez y lo comparte con las pestañas. */

import { useEffect, useSyncExternalStore } from 'react'
import { useModelosPerfil } from '../ModelosPerfilContext'

export function usePerfil() {
  const { modelos } = useModelosPerfil()
  const modelo = modelos.perfil
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)

  useEffect(() => {
    const actual = modelo.obtenerEstado()
    if (actual.cargando || actual.perfil) return
    void modelo.obtenerPerfil()
  }, [modelo])

  return {
    perfil: estado.perfil,
    cargando: !estado.perfil && (estado.cargando || !estado.error),
    error: estado.error,
    reintentar: () => void modelo.obtenerPerfil(),
  }
}
