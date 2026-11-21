/** PerfilDTO del backend (record Java, camelCase). */
export interface PerfilDTO {
  readonly id: number
  readonly nombre: string
  readonly apellidos: string
  readonly email: string
  readonly telefono: string | null
  readonly tipoUsuario: string
  readonly tipoCliente: string | null
  /** «2026-10-20» */
  readonly fechaRegistro: string | null
  /** «email», «google»… */
  readonly proveedores: readonly string[]
  readonly tieneContrasena: boolean
  readonly correoPendiente: string | null
}
