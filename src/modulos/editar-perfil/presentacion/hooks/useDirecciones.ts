/** useDirecciones · ViewModel de la pestaña «Direcciones». */

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { DireccionEntregaTs } from '../../dominio/DireccionEntregaTs'
import { useModelosPerfil } from '../ModelosPerfilContext'

export function useDirecciones() {
  const { modelos } = useModelosPerfil()
  const modelo = modelos.direcciones
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const [porEliminar, setPorEliminar] = useState<DireccionEntregaTs | null>(null)

  useEffect(() => {
    if (modelo.obtenerEstado().cargando) return
    void modelo.listarDirecciones()
  }, [modelo])

  /** El interruptor «Predeterminada»: encenderlo la elige; apagarlo deja sin predeterminada. */
  const alternarPredeterminada = (direccion: DireccionEntregaTs) =>
    void (direccion.predeterminada ? modelo.quitarPredeterminada() : modelo.marcarPredeterminada(direccion.id))

  const confirmarEliminar = async () => {
    if (!porEliminar) return
    const eliminada = await modelo.eliminarDireccion(porEliminar.id)
    if (eliminada) setPorEliminar(null)
  }

  return {
    direcciones: estado.direcciones ?? [],
    cargando: estado.direcciones === null && !estado.error,
    error: estado.error,
    reintentar: () => void modelo.listarDirecciones(),
    enCurso: estado.enCurso,
    errorAccion: estado.errorAccion,
    mensaje: estado.mensaje,
    alternarPredeterminada,
    porEliminar,
    pedirEliminar: (direccion: DireccionEntregaTs) => {
      modelo.limpiarMensaje()
      setPorEliminar(direccion)
    },
    cancelarEliminar: () => setPorEliminar(null),
    confirmarEliminar: () => void confirmarEliminar(),
  }
}
