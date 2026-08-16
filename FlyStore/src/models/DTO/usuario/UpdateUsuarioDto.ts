/**
 * DTO para actualizar información del usuario
 * Solo se actualizan los campos que se envían (partial update)
 */
export interface UpdateUsuarioDto {
  nombre?: string;
  telefono?: string;
  direccion?: DireccionDetallada;
}

/**
 * DTO para dirección completa del usuario
 */
export interface DireccionDetallada {
  calle: string;
  numero: string;
  entreCalle1?: string;
  entreCalle2?: string;
  colonia?: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  celular: string;
}

/**
 * Response del perfil de usuario completo
 */
export interface UsuarioResponse {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  direccion: string; // String simple como está en el backend
  createdAt: string;
}
