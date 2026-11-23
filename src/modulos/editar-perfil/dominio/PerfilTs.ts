/** Tipo de cuenta del usuario con sesión. */
export type TipoUsuarioPerfil = 'cliente' | 'empleado' | 'admin'

/** Perfil listo para pintar en «Mi perfil». */
export interface PerfilTs {
  readonly nombre: string
  readonly apellidos: string
  readonly nombreCompleto: string
  readonly iniciales: string
  readonly correo: string
  /** «644 123 4567» o vacío. */
  readonly telefono: string
  readonly tipoUsuario: TipoUsuarioPerfil
  /** «Cliente», «Administrador», «Empleado». */
  readonly etiquetaTipoUsuario: string
  /** Esquema del cliente («Base», «Mayoreo»…); null para el personal. Solo lectura. */
  readonly etiquetaTipoCliente: string | null
  readonly miembroDesde: Date | null
  /** La cuenta entra con Google. */
  readonly conGoogle: boolean
  /** La cuenta tiene contraseña propia (se registró con correo). */
  readonly tieneContrasena: boolean
  /** Correo nuevo esperando confirmación; null si no hay cambio pendiente. */
  readonly correoPendiente: string | null
}

/** Valores del formulario «Datos personales». */
export interface DatosPersonalesTs {
  readonly nombre: string
  readonly apellidos: string
  readonly telefono: string
}

export type ErroresDatosPersonales = Partial<Record<keyof DatosPersonalesTs, string>>
