/**
 * Tipo de dominio para la respuesta de autenticación
 * Versión frontend del AccesoDTO (mismo contrato, nombres TypeScript)
 */

import type { TipoUsuario } from '@compartido/contratos/TipoUsuario'

export interface AccesoTs {
  readonly userId: string
  readonly email: string
  readonly nombre: string
  readonly apellidos: string
  readonly tipoUsuario: TipoUsuario
}
