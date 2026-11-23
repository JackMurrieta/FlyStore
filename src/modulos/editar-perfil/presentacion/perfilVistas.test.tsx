import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SesionProvider, type EstadoSesionTs, type ISesion } from '@compartido/sesion'
import { crearModelosPerfil } from '../aplicacion/ModelosPerfil'
import type { IPerfilGateway } from '../dominio/puertos/IPerfilGateway'
import { gatewayFalso, perfilDTO, sesionFalsa } from '../pruebas/fixturesPerfil'
import { EditarPerfil } from './EditarPerfil'

const ESTADO: EstadoSesionTs = {
  estado: 'autenticado',
  usuario: { id: 7, nombre: 'Ana Torres', correo: 'ana@correo.mx', telefono: null, rol: 'CLIENTE', perfilCompleto: true, iniciales: 'AT' },
}
const sesion: ISesion = { suscribir: () => () => {}, obtenerEstado: () => ESTADO, iniciarConGoogle: vi.fn(), cerrarSesion: vi.fn() }

function Ubicacion() {
  return <span data-testid="ruta">{useLocation().pathname}</span>
}

function abrir(ruta: string, gateway: IPerfilGateway = gatewayFalso()) {
  const modelos = crearModelosPerfil(gateway, sesionFalsa())
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider sesion={sesion}>
        <Routes>
          <Route path="/perfil/*" element={<EditarPerfil modelos={modelos} />} />
          <Route path="*" element={<Ubicacion />} />
        </Routes>
        <Ubicacion />
      </SesionProvider>
    </MemoryRouter>
  )
  return { gateway, modelos }
}

describe('Mi perfil', () => {
  it('Datos personales: muestra los datos, habilita guardar solo con cambios y confirma', async () => {
    const { gateway } = abrir('/perfil')
    const nombre = await screen.findByLabelText('Nombre')
    expect(nombre).toHaveValue('Ana')
    const guardar = screen.getByRole('button', { name: /Guardar cambios/ })
    expect(guardar).toBeDisabled()
    await userEvent.clear(nombre)
    await userEvent.type(nombre, 'Ana María')
    expect(guardar).toBeEnabled()
    await userEvent.click(guardar)
    expect(gateway.actualizarPerfil).toHaveBeenCalledWith({ nombre: 'Ana María', apellidos: 'Torres', telefono: '6441234567' })
    expect(await screen.findByText('Guardamos tus datos')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Mis pedidos/ }).every((enlace) => enlace.getAttribute('href') === '/mis-pedidos')).toBe(true)
  })

  it('Direcciones: el interruptor cambia la predeterminada y eliminar pide confirmación', async () => {
    const { gateway } = abrir('/perfil/direcciones')
    const interruptores = await screen.findAllByRole('switch', { name: /Predeterminada/ })
    expect(interruptores.map((i) => i.getAttribute('aria-checked'))).toEqual(['true', 'false'])
    await userEvent.click(interruptores[1]!)
    expect(gateway.marcarPredeterminada).toHaveBeenCalledWith(2)
    expect(await screen.findByText(/es tu dirección predeterminada/)).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: /Eliminar la dirección/ })[0]!)
    const dialogo = await screen.findByRole('dialog')
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(gateway.eliminarDireccion).toHaveBeenCalled())
  })

  it('Seguridad: cuenta solo de Google no muestra formularios de correo ni contraseña', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.obtenerPerfil).mockResolvedValue(perfilDTO({ proveedores: ['google'], tieneContrasena: false }))
    abrir('/perfil/seguridad', gateway)
    expect(await screen.findByText(/no tiene contraseña de FlyStore/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Nuevo correo')).not.toBeInTheDocument()
  })

  it('Seguridad: cambia la contraseña validando antes de enviar', async () => {
    const { gateway } = abrir('/perfil/seguridad')
    await userEvent.type(await screen.findByLabelText('Contraseña actual'), 'Actual123')
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'corta')
    await userEvent.click(screen.getByRole('button', { name: /Cambiar contraseña/ }))
    expect(await screen.findByText('Usa al menos 8 caracteres')).toBeInTheDocument()
    expect(gateway.cambiarContrasena).not.toHaveBeenCalled()
  })

  it('El personal no tiene pestaña de Direcciones', async () => {
    const gateway = gatewayFalso()
    vi.mocked(gateway.obtenerPerfil).mockResolvedValue(perfilDTO({ tipoUsuario: 'admin', tipoCliente: null }))
    abrir('/perfil/direcciones', gateway)
    await waitFor(() => expect(screen.getAllByTestId('ruta')[0]?.textContent).toBe('/perfil'))
    expect(screen.queryByRole('link', { name: /Direcciones/ })).not.toBeInTheDocument()
  })
})
