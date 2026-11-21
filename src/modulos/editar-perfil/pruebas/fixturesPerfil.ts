/** Datos de prueba del módulo (no se usan en producción). */
import { vi } from 'vitest'
import type { IPerfilGateway } from '../dominio/puertos/IPerfilGateway'
import type { ISesionCuenta } from '../dominio/puertos/ISesionCuenta'
import type { PerfilDTO } from '../aplicacion/dto/PerfilDTO'
import type { DireccionEntregaDTO } from '../aplicacion/dto/DireccionEntregaDTO'

export function perfilDTO(extra: Partial<PerfilDTO> = {}): PerfilDTO {
  return {
    id: 7, nombre: 'Ana', apellidos: 'Torres', email: 'ana@correo.mx', telefono: '6441234567',
    tipoUsuario: 'cliente', tipoCliente: 'BASE', fechaRegistro: '2026-10-20', proveedores: ['email'],
    tieneContrasena: true, correoPendiente: null, ...extra,
  }
}

export function direccionDTO(id: number, predeterminada = false, extra: Partial<DireccionEntregaDTO> = {}): DireccionEntregaDTO {
  return {
    id, nombreCompleto: 'Ana Torres', telefono: '6441234567', ciudad: 'Ciudad Obregón', estado: 'Sonora',
    direccion: `Calle ${id} #100, Col. Centro`, referencias: id === 1 ? 'Portón negro' : null, predeterminada, ...extra,
  }
}

export function gatewayFalso(): IPerfilGateway {
  let direcciones = [direccionDTO(1, true), direccionDTO(2)]
  return {
    obtenerPerfil: vi.fn().mockResolvedValue(perfilDTO()),
    actualizarPerfil: vi.fn().mockImplementation(async (dto) => perfilDTO({ ...dto, telefono: dto.telefono || null })),
    listarDirecciones: vi.fn().mockImplementation(async () => direcciones),
    marcarPredeterminada: vi.fn().mockImplementation(async (id: number) => {
      direcciones = direcciones.map((d) => ({ ...d, predeterminada: d.id === id }))
      return direcciones
    }),
    quitarPredeterminada: vi.fn().mockImplementation(async () => {
      direcciones = direcciones.map((d) => ({ ...d, predeterminada: false }))
      return direcciones
    }),
    eliminarDireccion: vi.fn().mockImplementation(async (id: number) => {
      direcciones = direcciones.filter((d) => d.id !== id)
      return direcciones
    }),
    solicitarCambioCorreo: vi.fn().mockImplementation(async (correo: string) => ({ mensaje: `Te enviamos un enlace a ${correo}.` })),
    cambiarContrasena: vi.fn().mockResolvedValue(undefined),
    cerrarSesionGlobal: vi.fn().mockResolvedValue(undefined),
  }
}

export function sesionFalsa(): ISesionCuenta {
  return { refrescarUsuario: vi.fn().mockResolvedValue(undefined), establecerAnonimo: vi.fn() }
}
