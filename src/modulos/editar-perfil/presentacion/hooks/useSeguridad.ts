/** useSeguridad · ViewModel de la pestaña «Seguridad»: correo, contraseña y sesiones. */

import { useState, useSyncExternalStore } from 'react'
import { useModelosPerfil } from '../ModelosPerfilContext'

export function useSeguridad() {
  const { modelos } = useModelosPerfil()
  const modelo = modelos.perfil
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState({ actual: '', nueva: '', confirmacion: '' })
  const [confirmarSesiones, setConfirmarSesiones] = useState(false)

  const enviarCorreo = async () => {
    if (await modelo.solicitarCambioCorreo(correo)) setCorreo('')
  }

  const guardarContrasena = async () => {
    if (await modelo.cambiarContrasena(contrasena.actual, contrasena.nueva, contrasena.confirmacion)) {
      setContrasena({ actual: '', nueva: '', confirmacion: '' })
    }
  }

  return {
    correo,
    cambiarCorreo: (valor: string) => setCorreo(valor),
    enviarCorreo: () => void enviarCorreo(),
    enviandoCorreo: estado.enviandoCorreo,
    errorCorreo: estado.errorCorreo,
    mensajeCorreo: estado.mensajeCorreo,

    contrasena,
    cambiarContrasena: (campo: keyof typeof contrasena, valor: string) => setContrasena((c) => ({ ...c, [campo]: valor })),
    guardarContrasena: () => void guardarContrasena(),
    cambiandoContrasena: estado.cambiandoContrasena,
    erroresContrasena: estado.erroresContrasena,
    errorContrasena: estado.errorContrasena,
    contrasenaCambiada: estado.contrasenaCambiada,

    confirmarSesiones,
    pedirCerrarSesiones: () => setConfirmarSesiones(true),
    cancelarCerrarSesiones: () => setConfirmarSesiones(false),
    cerrarSesiones: () => modelo.cerrarSesionGlobal(),
    cerrandoSesiones: estado.cerrandoSesiones,
    errorSesiones: estado.errorSesiones,
  }
}
