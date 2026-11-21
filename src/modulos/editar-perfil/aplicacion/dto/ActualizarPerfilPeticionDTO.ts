export interface ActualizarPerfilPeticionDTO {
  readonly nombre: string
  readonly apellidos: string
  /** 10 dígitos o vacío. */
  readonly telefono: string
}
