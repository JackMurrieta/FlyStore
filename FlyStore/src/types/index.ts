/**
 * Archivo central de exportación de tipos
 * Importa desde aquí todos los tipos necesarios en tu aplicación
 */

// Tipos de autenticación
export type {
  LoginDto,
  RegisterDto,
  User,
  LoginResponse,
  RegisterResponse,
  SessionResponse,
  RefreshResponse,
  RegisterResult,
} from './auth.types';

// Tipos de usuario
export type {
  UsuarioResponse,
  UpdateUsuarioDto,
  DireccionDetallada,
} from './usuario.types';

// Funciones de utilidad para direcciones
export { serializeDireccion, parseDireccion } from './usuario.types';

// Tipos de catálogo
export type { Marca, CatalogoInfo } from './catalogo.types';
