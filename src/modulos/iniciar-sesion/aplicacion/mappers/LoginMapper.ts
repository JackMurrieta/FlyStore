/**
 * Mapper: LoginTs (frontend) → LoginDTO (backend)
 */

import type { LoginTs } from '../../dominio/LoginTs'
import type { LoginDTO } from '../dto/LoginDTO'

export class LoginMapper {
  static aDTO(ts: LoginTs): LoginDTO {
    return {
      email: ts.email,
      password: ts.password,
    }
  }
}
