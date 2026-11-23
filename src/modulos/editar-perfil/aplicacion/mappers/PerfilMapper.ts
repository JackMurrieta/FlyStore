/**
 * PerfilMapper · Fabricación pura (GRASP): DTO del backend ⇄ TsInterfaces de las vistas.
 * Sin I/O ni React.
 */

import type { ErrorTs } from '@compartido/tipos/ErrorTs'
import type { PerfilDTO } from '../dto/PerfilDTO'
import type { DireccionEntregaDTO } from '../dto/DireccionEntregaDTO'
import type { ActualizarPerfilPeticionDTO } from '../dto/ActualizarPerfilPeticionDTO'
import type { DatosPersonalesTs, PerfilTs, TipoUsuarioPerfil } from '../../dominio/PerfilTs'
import type { DireccionEntregaTs } from '../../dominio/DireccionEntregaTs'
import { soloDigitos } from '../../dominio/ReglasPerfil'

const TIPOS_USUARIO: Record<TipoUsuarioPerfil, string> = { cliente: 'Cliente', empleado: 'Empleado', admin: 'Administrador' }

const TIPOS_CLIENTE: Record<string, string> = {
  BASE: 'Base',
  EMPRENDEDOR: 'Emprendedor',
  MAYOREO: 'Mayoreo',
  DISTRIBUIDOR: 'Distribuidor',
  SOCIO_COMERCIAL: 'Socio comercial',
}

export class PerfilMapper {
  static convertirPerfilDTOaPerfilTs(dto: PerfilDTO): PerfilTs {
    const tipoUsuario: TipoUsuarioPerfil = dto.tipoUsuario === 'admin' || dto.tipoUsuario === 'empleado' ? dto.tipoUsuario : 'cliente'
    const nombre = dto.nombre?.trim() ?? ''
    const apellidos = dto.apellidos?.trim() ?? ''
    return {
      nombre,
      apellidos,
      nombreCompleto: [nombre, apellidos].filter(Boolean).join(' '),
      iniciales: `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || '?',
      correo: dto.email,
      telefono: PerfilMapper.formatearTelefono(dto.telefono ?? ''),
      tipoUsuario,
      etiquetaTipoUsuario: TIPOS_USUARIO[tipoUsuario],
      etiquetaTipoCliente: dto.tipoCliente ? TIPOS_CLIENTE[dto.tipoCliente] ?? dto.tipoCliente : null,
      miembroDesde: PerfilMapper.convertirFecha(dto.fechaRegistro),
      conGoogle: dto.proveedores.includes('google'),
      tieneContrasena: dto.tieneContrasena,
      correoPendiente: dto.correoPendiente,
    }
  }

  static convertirPerfilTsaDatosPersonales(perfil: PerfilTs): DatosPersonalesTs {
    return { nombre: perfil.nombre, apellidos: perfil.apellidos, telefono: perfil.telefono }
  }

  static convertirDatosPersonalesaDTO(datos: DatosPersonalesTs): ActualizarPerfilPeticionDTO {
    return { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), telefono: soloDigitos(datos.telefono) }
  }

  static convertirDireccionDTOaDireccionTs(dto: DireccionEntregaDTO): DireccionEntregaTs {
    const referencias = dto.referencias?.trim()
    return {
      id: dto.id,
      nombreCompleto: dto.nombreCompleto?.trim() || 'Sin nombre de quien recibe',
      telefono: PerfilMapper.formatearTelefono(dto.telefono ?? ''),
      direccion: dto.direccion?.trim() ?? '',
      ciudadEstado: [dto.ciudad?.trim(), dto.estado?.trim()].filter(Boolean).join(', '),
      referencias: referencias ? referencias : null,
      predeterminada: dto.predeterminada,
    }
  }

  /** Error del HttpClient (ErrorApi) o de red → ErrorTs. Lee el tipo por forma, sin importar infraestructura. */
  static convertirErrorAErrorTs(error: unknown, mensajePorDefecto: string): ErrorTs {
    if (error instanceof Error && error.message) {
      const tipo = 'tipo' in error && typeof error.tipo === 'string' ? error.tipo.toLowerCase() : undefined
      const conocidos: readonly NonNullable<ErrorTs['tipo']>[] = ['validacion', 'negocio', 'red', 'desconocido']
      const tipoTs = conocidos.find((t) => t === tipo)
      return tipoTs ? { mensaje: error.message, tipo: tipoTs } : { mensaje: error.message }
    }
    return { mensaje: mensajePorDefecto, tipo: 'desconocido' }
  }

  /** 6441234567 → «644 123 4567» */
  static formatearTelefono(valor: string): string {
    const digitos = soloDigitos(valor)
    return digitos.length === 10 ? `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}` : valor
  }

  /** «2026-10-20» se toma como fecha local (sin desfase de zona horaria). */
  private static convertirFecha(valor: string | null): Date | null {
    if (!valor) return null
    const [anio, mes, dia] = valor.split('-').map(Number)
    if (!anio || !mes || !dia) return null
    return new Date(anio, mes - 1, dia)
  }
}
