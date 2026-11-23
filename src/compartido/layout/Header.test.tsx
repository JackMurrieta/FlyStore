import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { SesionProvider, type EstadoSesionTs, type ISesion, type RolTs } from '@compartido/sesion'
import { Header } from './Header'
import { Footer } from './Footer'

function sesionCon(rol: RolTs | null): ISesion {
  const estado: EstadoSesionTs = rol
    ? { estado: 'autenticado', usuario: { id: 1, nombre: 'Ana Torres', correo: 'ana@correo.mx', telefono: null, rol, perfilCompleto: true, iniciales: 'AT' } }
    : { estado: 'anonimo', usuario: null }
  return { suscribir: () => () => {}, obtenerEstado: () => estado, iniciarConGoogle: vi.fn(), cerrarSesion: vi.fn().mockResolvedValue(undefined) }
}

function abrir(rol: RolTs | null) {
  const sesion = sesionCon(rol)
  render(<MemoryRouter><SesionProvider sesion={sesion}><Header /><Footer /></SesionProvider></MemoryRouter>)
  return sesion
}

function Ubicacion() {
  const { pathname, search } = useLocation()
  return <output data-testid="ubicacion">{pathname + search}</output>
}

describe('Header', () => {
  it('el buscador busca en toda la tienda (CU-01 · S1) y muestra el texto buscado', async () => {
    render(<MemoryRouter initialEntries={['/buscar?texto=new%20era']}><SesionProvider sesion={sesionCon(null)}><Header /><Ubicacion /></SesionProvider></MemoryRouter>)
    const campo = screen.getAllByRole('searchbox', { name: 'Buscar productos' })[0]!
    expect(campo).toHaveValue('new era')
    await userEvent.clear(campo)
    await userEvent.type(campo, ' 9forty negra {Enter}')
    expect(screen.getByTestId('ubicacion').textContent).toBe('/buscar?texto=9forty%20negra')
    expect(screen.getAllByRole('searchbox', { name: 'Buscar productos' })[0]).toHaveValue('9forty negra')
  })


  it('menú de cuenta del cliente: Mi perfil y Mis pedidos; se cierra con Esc y devuelve el foco', async () => {
    abrir('CLIENTE')
    const boton = screen.getByRole('button', { name: /Ana.*abrir menú de tu cuenta/ })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('link', { name: /Mi perfil/ })[0]).toHaveAttribute('href', '/perfil')
    expect(screen.getAllByRole('link', { name: /Mis pedidos/ }).some((a) => a.getAttribute('href') === '/mis-pedidos')).toBe(true)
    expect(screen.queryByRole('link', { name: /Administrar/ })).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveFocus()
  })

  it('el personal ve Administrar y no Mis pedidos en su menú', async () => {
    abrir('ADMIN')
    await userEvent.click(screen.getByRole('button', { name: /abrir menú de tu cuenta/ }))
    expect(screen.getByRole('link', { name: /Administrar tienda/ })).toHaveAttribute('href', '/admin')
    expect(screen.queryByRole('link', { name: /Administrar catálogo|Administrar pedidos/ })).not.toBeInTheDocument()
  })

  it('cerrar sesión desde el menú', async () => {
    const sesion = abrir('CLIENTE')
    await userEvent.click(screen.getByRole('button', { name: /abrir menú de tu cuenta/ }))
    await userEvent.click(screen.getByRole('button', { name: /Cerrar sesión/ }))
    expect(sesion.cerrarSesion).toHaveBeenCalled()
  })

  it('panel lateral (móvil): categorías, cuenta y ayuda; Esc lo cierra y devuelve el foco al ☰', async () => {
    abrir(null)
    const menu = screen.getByRole('button', { name: 'Abrir menú' })
    await userEvent.click(menu)
    const panel = screen.getByRole('dialog', { name: 'Menú' })
    expect(within(panel).getByRole('button', { name: 'Cerrar menú' })).toHaveFocus()
    for (const categoria of ['CAPS', 'ESSENCE', 'CLOTHES', 'SHOES']) expect(within(panel).getByRole('link', { name: categoria })).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro')
    expect(within(panel).getByRole('link', { name: /Aviso de privacidad/ })).toHaveAttribute('href', '/privacidad')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menu).toHaveFocus()
  })

  it('sin sesión muestra Iniciar sesión', () => {
    abrir(null)
    expect(screen.getAllByRole('link', { name: 'Iniciar sesión' })[0]).toHaveAttribute('href', '/iniciar-sesion')
  })
})

describe('Footer', () => {
  it('enlaza solo a rutas planeadas: categorías, ayuda, legales y el correo de contacto', () => {
    abrir(null)
    const pie = screen.getByRole('contentinfo')
    expect(within(pie).getByRole('link', { name: 'Preguntas frecuentes' })).toHaveAttribute('href', '/preguntas-frecuentes')
    expect(within(pie).getByRole('link', { name: 'Términos y condiciones' })).toHaveAttribute('href', '/terminos')
    expect(within(pie).getByRole('link', { name: 'Aviso de privacidad' })).toHaveAttribute('href', '/privacidad')
    expect(within(pie).getByRole('link', { name: /flycontact555@gmail.com/ })).toHaveAttribute('href', 'mailto:flycontact555@gmail.com')
    expect(within(pie).getByText(/Todos los precios en MXN/)).toBeInTheDocument()
  })
})
