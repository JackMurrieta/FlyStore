/**
 * Lo que el perfil necesita de la sesión (lo implementa SesionModel de iniciar-sesion):
 * refrescar el nombre que muestra el encabezado y cerrar la sesión local.
 */
export interface ISesionCuenta {
  refrescarUsuario(): Promise<void>
  establecerAnonimo(): void
}
