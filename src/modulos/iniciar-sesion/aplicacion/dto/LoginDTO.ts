/**
 * DTO para petición de login tradicional (email + password)
 */

export interface LoginDTO {
  readonly email: string
  readonly password: string
}
