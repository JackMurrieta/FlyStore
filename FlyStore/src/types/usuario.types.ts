/**
 * DTOs de Usuario
 * Corresponde a los endpoints /api/usuario/*
 */

import type { User } from './auth.types';

/**
 * Respuesta completa del perfil de usuario
 * GET /api/usuario/perfil
 */
export interface UsuarioResponse extends User {
  createdAt: string;
}

/**
 * DTO para actualizar información del usuario
 * Solo se actualizan los campos que se envían (partial update)
 */
export interface UpdateUsuarioDto {
  nombre?: string;
  telefono?: string;
  direccion?: string;
}

/**
 * Dirección detallada del usuario (solo para frontend)
 * Se usa en formularios para capturar datos estructurados
 * Antes de enviar al backend, se convierte a string con serializeDireccion()
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
 * Convierte DireccionDetallada a string para enviar al backend
 * Formato: "Calle Numero, Entre1-Entre2, Colonia, Ciudad, Estado, CP, Celular"
 */
export function serializeDireccion(dir: DireccionDetallada): string {
  const partes: string[] = [];

  // Calle y número
  partes.push(`${dir.calle} ${dir.numero}`);

  // Entre calles (opcional)
  if (dir.entreCalle1 && dir.entreCalle2) {
    partes.push(`Entre ${dir.entreCalle1} y ${dir.entreCalle2}`);
  } else if (dir.entreCalle1) {
    partes.push(`Cerca de ${dir.entreCalle1}`);
  }

  // Colonia (opcional)
  if (dir.colonia) {
    partes.push(dir.colonia);
  }

  // Ciudad, Estado, CP
  partes.push(dir.ciudad);
  partes.push(dir.estado);
  partes.push(`CP ${dir.codigoPostal}`);

  // Celular
  partes.push(`Tel: ${dir.celular}`);

  return partes.join(', ');
}

/**
 * Intenta parsear un string de dirección a DireccionDetallada
 * Si no puede parsearlo, retorna null
 */
export function parseDireccion(direccionStr: string): DireccionDetallada | null {
  // Esta función es opcional, para intentar reconstruir la dirección
  // desde el string almacenado en el backend
  // Por ahora retorna null ya que el formato puede variar
  return null;
}
