import { describe, expect, it, vi } from 'vitest'
import { crearModelosPerfil } from './ModelosPerfil'
import { PerfilMapper } from './mappers/PerfilMapper'
import { validarContrasena, validarCorreo, validarDatosPersonales } from '../dominio/ReglasPerfil'
import { direccionDTO, gatewayFalso, perfilDTO, sesionFalsa } from '../pruebas/fixturesPerfil'

describe('PerfilMapper y reglas', () => {
  it('arma el perfil: nombre completo, iniciales, teléfono legible y cómo entra', () => {
    const perfil = PerfilMapper.convertirPerfilDTOaPerfilTs(perfilDTO({ proveedores: ['google'], tieneContrasena: false }))
    expect(perfil).toMatchObject({ nombreCompleto: 'Ana Torres', iniciales: 'AT', telefono: '644 123 4567', conGoogle: true, tieneContrasena: false, etiquetaTipoUsuario: 'Cliente', etiquetaTipoCliente: 'Base' })
    expect(perfil.miembroDesde?.getDate()).toBe(20)
    expect(PerfilMapper.convertirPerfilDTOaPerfilTs(perfilDTO({ tipoUsuario: 'admin', tipoCliente: null })).etiquetaTipoUsuario).toBe('Administrador')
  })

  it('arma la tarjeta de dirección', () => {
    expect(PerfilMapper.convertirDireccionDTOaDireccionTs(direccionDTO(1, true))).toMatchObject({
      ciudadEstado: 'Ciudad Obregón, Sonora', telefono: '644 123 4567', referencias: 'Portón negro', predeterminada: true,
    })
    expect(PerfilMapper.convertirDireccionDTOaDireccionTs(direccionDTO(2, false, { referencias: '  ' })).referencias).toBeNull()
  })

  it('valida datos personales, correo y contraseña antes de llamar al backend', () => {
    expect(validarDatosPersonales({ nombre: ' ', apellidos: 'Torres', telefono: '644 123' })).toEqual({ nombre: 'Escribe tu nombre', telefono: 'El teléfono debe tener 10 dígitos' })
    expect(validarDatosPersonales({ nombre: 'Ana', apellidos: 'Torres', telefono: '' })).toEqual({})
    expect(validarCorreo('ANA@correo.mx', 'ana@correo.mx')).toBe('Ese ya es tu correo actual')
    expect(validarCorreo('ana@', 'x@y.mx')).toBe('Revisa el correo; no es válido')
    expect(validarContrasena('vieja1', 'corta1', 'corta1')).toEqual({ nueva: 'Usa al menos 8 caracteres' })
    expect(validarContrasena('vieja1', 'soloLetras', 'soloLetras')).toEqual({ nueva: 'Combina letras y números' })
    expect(validarContrasena('', 'Nueva1234', 'Otra1234')).toEqual({ actual: 'Escribe tu contraseña actual', confirmacion: 'Las contraseñas no coinciden' })
  })
})

describe('PerfilModel', () => {
  it('carga, guarda los datos con teléfono solo en dígitos y refresca el encabezado', async () => {
    const gateway = gatewayFalso()
    const sesion = sesionFalsa()
    const { perfil } = crearModelosPerfil(gateway, sesion)
    await perfil.obtenerPerfil()
    expect(perfil.obtenerEstado().perfil?.nombreCompleto).toBe('Ana Torres')

    expect(await perfil.guardarDatosPersonales({ nombre: ' Ana María ', apellidos: 'Torres', telefono: '644 987 6543' })).toBe(true)
    expect(gateway.actualizarPerfil).toHaveBeenCalledWith({ nombre: 'Ana María', apellidos: 'Torres', telefono: '6449876543' })
    expect(perfil.obtenerEstado()).toMatchObject({ datosGuardados: true, perfil: { nombre: 'Ana María' } })
    expect(sesion.refrescarUsuario).toHaveBeenCalled()
  })

  it('no llama al backend con datos inválidos y muestra el error del backend', async () => {
    const gateway = gatewayFalso()
    const { perfil } = crearModelosPerfil(gateway, sesionFalsa())
    expect(await perfil.guardarDatosPersonales({ nombre: '', apellidos: '', telefono: '' })).toBe(false)
    expect(gateway.actualizarPerfil).not.toHaveBeenCalled()
    vi.mocked(gateway.actualizarPerfil).mockRejectedValueOnce(Object.assign(new Error('Sin conexión'), { tipo: 'RED' }))
    await perfil.guardarDatosPersonales({ nombre: 'Ana', apellidos: 'Torres', telefono: '' })
    expect(perfil.obtenerEstado().errorGuardar).toEqual({ mensaje: 'Sin conexión', tipo: 'red' })
  })

  it('pide el cambio de correo y lo deja pendiente hasta que se confirme', async () => {
    const gateway = gatewayFalso()
    const { perfil } = crearModelosPerfil(gateway, sesionFalsa())
    await perfil.obtenerPerfil()
    expect(await perfil.solicitarCambioCorreo(' Ana.Nueva@Correo.mx ')).toBe(true)
    expect(gateway.solicitarCambioCorreo).toHaveBeenCalledWith('ana.nueva@correo.mx')
    expect(perfil.obtenerEstado()).toMatchObject({ mensajeCorreo: 'Te enviamos un enlace a ana.nueva@correo.mx.', perfil: { correo: 'ana@correo.mx', correoPendiente: 'ana.nueva@correo.mx' } })
  })

  it('cambia la contraseña y muestra el rechazo del backend', async () => {
    const gateway = gatewayFalso()
    const { perfil } = crearModelosPerfil(gateway, sesionFalsa())
    expect(await perfil.cambiarContrasena('Actual123', 'Nueva1234', 'Nueva1234')).toBe(true)
    expect(gateway.cambiarContrasena).toHaveBeenCalledWith('Actual123', 'Nueva1234')
    vi.mocked(gateway.cambiarContrasena).mockRejectedValueOnce(new Error('La contraseña actual no es correcta'))
    expect(await perfil.cambiarContrasena('Mala1234', 'Nueva1234', 'Nueva1234')).toBe(false)
    expect(perfil.obtenerEstado().errorContrasena).toBe('La contraseña actual no es correcta')
  })

  it('cerrar sesión en todos lados deja la sesión local anónima y limpia el perfil', async () => {
    const sesion = sesionFalsa()
    const { perfil } = crearModelosPerfil(gatewayFalso(), sesion)
    await perfil.obtenerPerfil()
    expect(await perfil.cerrarSesionGlobal()).toBe(true)
    expect(sesion.establecerAnonimo).toHaveBeenCalled()
    expect(perfil.obtenerEstado().perfil).toBeNull()
  })
})

describe('DireccionesModel', () => {
  it('lista, cambia la predeterminada, la quita y elimina', async () => {
    const gateway = gatewayFalso()
    const { direcciones } = crearModelosPerfil(gateway, sesionFalsa())
    await direcciones.listarDirecciones()
    expect(direcciones.obtenerEstado().direcciones?.map((d) => d.predeterminada)).toEqual([true, false])

    await direcciones.marcarPredeterminada(2)
    expect(direcciones.obtenerEstado().direcciones?.find((d) => d.id === 2)?.predeterminada).toBe(true)
    expect(direcciones.obtenerEstado().mensaje).toContain('predeterminada')

    await direcciones.quitarPredeterminada()
    expect(direcciones.obtenerEstado().direcciones?.some((d) => d.predeterminada)).toBe(false)

    await direcciones.eliminarDireccion(1)
    expect(direcciones.obtenerEstado().direcciones?.map((d) => d.id)).toEqual([2])
  })

  it('no permite dos acciones a la vez y muestra el error', async () => {
    const gateway = gatewayFalso()
    const { direcciones } = crearModelosPerfil(gateway, sesionFalsa())
    let terminar: () => void = () => {}
    vi.mocked(gateway.marcarPredeterminada).mockImplementationOnce(() => new Promise((resolver) => { terminar = () => resolver([direccionDTO(2, true)]) }))
    const primera = direcciones.marcarPredeterminada(2)
    expect(await direcciones.eliminarDireccion(1)).toBe(false)
    terminar()
    await primera
    vi.mocked(gateway.eliminarDireccion).mockRejectedValueOnce(new Error('No encontramos esa dirección'))
    await direcciones.eliminarDireccion(9)
    expect(direcciones.obtenerEstado().errorAccion).toBe('No encontramos esa dirección')
  })
})
