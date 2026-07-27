import { useState } from 'react'
import { useAuth } from '../../hooks/auth/useAuth'
import type { LoginDto } from '../../models/DTO/LoginDto'
import type { RegisterDto } from '../../models/DTO/RegisterDto'
import './login.css'

type Mode = 'login' | 'register'

function getInitials(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export function LoginPage() {
  const { login, register, loginWithGoogle, submitting, error, registerResult, clearError } = useAuth()

  const [mode, setMode]           = useState<Mode>('login')
  const [nombre, setNombre]       = useState('')
  const [telefono, setTelefono]   = useState('')
  const [direccion, setDireccion] = useState('')
  const [correo, setCorreo]       = useState('')
  const [pin, setPin]             = useState('')

  const isRegister = mode === 'register'
  const initials   = getInitials(nombre)

  const switchMode = (next: Mode) => {
    setMode(next)
    setPin('')
    clearError()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isRegister) {
      const dto: RegisterDto = { nombre: nombre.trim(), telefono, direccion, correo: correo.trim(), pin }
      await register(dto)
    } else {
      const dto: LoginDto = { correo: correo.trim(), pin }
      await login(dto)
    }
  }

  /* ── Pantalla de confirmación de correo ── */
  if (registerResult === 'confirm_email') {
    return (
      <div className="lp-root">
        <div className="lp-card">
          <img src="/logos/fly-logo.png" alt="FLY Store" className="lp-logo" />
          <div className="lp-confirm-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="lp-title">Revisa tu correo</h1>
          <p className="lp-sub">
            Enviamos un enlace de confirmación a <strong style={{ color: '#fff' }}>{correo}</strong>.
            Ábrelo para activar tu cuenta.
          </p>
          <button className="lp-switch-btn" type="button" onClick={() => switchMode('login')}>
            Volver al inicio de sesión
          </button>
          <span className="lp-footer">FLY Store · Ciudad Obregón</span>
        </div>
      </div>
    )
  }

  return (
    <div className="lp-root">
      <div className="lp-card" role="main">

        {/* Logo */}
        <img src="/logos/fly-logo.png" alt="FLY Store" className="lp-logo" />

        {/* Avatar — solo en registro, muestra iniciales al escribir nombre */}
        {isRegister && (
          <div className={`lp-avatar${initials ? ' filled' : ''}`} aria-hidden="true">
            {initials || (
              <svg viewBox="0 0 22 22" fill="none" stroke="currentColor"
                strokeWidth="1.3" strokeLinecap="round">
                <circle cx="11" cy="7" r="4" />
                <path d="M3 20c0-4.418 3.582-7 8-7s8 2.582 8 7" />
              </svg>
            )}
          </div>
        )}

        <h1 className="lp-title">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="lp-sub">
          {isRegister
            ? 'Guarda tu historial, favoritos y datos para comprar más rápido.'
            : 'Accede a tu cuenta para ver tus pedidos y favoritos.'}
        </p>

        {/* Google OAuth */}
        <button
          className="lp-google-btn"
          type="button"
          onClick={loginWithGoogle}
          disabled={submitting}
          aria-label="Continuar con Google"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="lp-separator" aria-hidden="true"><span>o</span></div>

        {/* Formulario */}
        <form
          key={mode}
          className="lp-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label={isRegister ? 'Formulario de registro' : 'Formulario de inicio de sesión'}
        >
          {isRegister && (
            <>
              <input
                className="lp-input lp-field-animated"
                type="text"
                placeholder="Nombre completo"
                aria-label="Nombre completo"
                autoComplete="name"
                value={nombre}
                onChange={e => { setNombre(e.target.value); clearError() }}
                required
                minLength={3}
              />
              <input
                className="lp-input lp-field-animated"
                type="tel"
                placeholder="Teléfono"
                aria-label="Teléfono"
                autoComplete="tel"
                value={telefono}
                onChange={e => { setTelefono(e.target.value); clearError() }}
                required
              />
              <input
                className="lp-input lp-field-animated"
                type="text"
                placeholder="Dirección"
                aria-label="Dirección"
                autoComplete="street-address"
                value={direccion}
                onChange={e => { setDireccion(e.target.value); clearError() }}
                required
              />
            </>
          )}

          <input
            className="lp-input"
            type="email"
            placeholder="Correo electrónico"
            aria-label="Correo electrónico"
            autoComplete={isRegister ? 'email' : 'username'}
            value={correo}
            onChange={e => { setCorreo(e.target.value); clearError() }}
            required
          />

          <input
            className="lp-input"
            type="password"
            placeholder={isRegister ? 'Pin (mín. 6 caracteres)' : 'Pin'}
            aria-label="Pin de acceso"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={pin}
            onChange={e => { setPin(e.target.value); clearError() }}
            required
            minLength={6}
          />

          {error && (
            <p className="lp-error" role="alert" aria-live="polite">{error}</p>
          )}

          <button
            className="lp-btn"
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? <span className="lp-spinner" aria-label="Cargando..." />
              : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="lp-divider" />

        <p className="lp-switch">
          {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <button
            className="lp-switch-btn"
            type="button"
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>

        <span className="lp-footer">FLY Store · Ciudad Obregón</span>
      </div>
    </div>
  )
}
