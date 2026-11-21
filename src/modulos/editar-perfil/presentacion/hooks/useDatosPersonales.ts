/**
 * useDatosPersonales · ViewModel del formulario «Datos personales».
 * El formulario parte del perfil cargado; la vista lo monta con `key` para reiniciarlo
 * cuando el perfil cambia (sin sincronizar estado en efectos).
 */

import { useState, useSyncExternalStore } from 'react'
import type { DatosPersonalesTs, PerfilTs } from '../../dominio/PerfilTs'
import { PerfilMapper } from '../../aplicacion/mappers/PerfilMapper'
import { useModelosPerfil } from '../ModelosPerfilContext'

export function useDatosPersonales(perfil: PerfilTs) {
  const { modelos } = useModelosPerfil()
  const modelo = modelos.perfil
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const original = PerfilMapper.convertirPerfilTsaDatosPersonales(perfil)
  const [datos, setDatos] = useState<DatosPersonalesTs>(original)

  const cambiar = (campo: keyof DatosPersonalesTs, valor: string) => {
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }))
    modelo.editarDatos()
  }

  const modificado = datos.nombre !== original.nombre || datos.apellidos !== original.apellidos || datos.telefono !== original.telefono

  return {
    datos,
    cambiar,
    modificado,
    descartar: () => {
      setDatos(original)
      modelo.editarDatos()
    },
    guardar: () => modelo.guardarDatosPersonales(datos),
    guardando: estado.guardando,
    errores: estado.erroresDatos,
    error: estado.errorGuardar,
    guardado: estado.datosGuardados,
  }
}
