/**
 * ErrorBoundary - Captura errores de renderizado de React
 * Muestra una pantalla de error amigable en lugar de pantalla negra
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  tieneError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { tieneError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { tieneError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  private recargar = () => {
    window.location.reload()
  }

  render() {
    if (this.state.tieneError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--fly-fondo)',
            color: 'var(--fly-texto-1)',
            fontFamily: 'Inter, sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '500px' }}>
            <h1
              style={{
                fontSize: '48px',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--fly-error)',
              }}
            >
              ¡Ups!
            </h1>
            <p
              style={{
                fontSize: '16px',
                lineHeight: '1.5',
                marginBottom: '24px',
                color: 'var(--fly-texto-2)',
              }}
            >
              Algo salió mal. Por favor, recarga la página para intentarlo de nuevo.
            </p>
            {this.state.error && import.meta.env.DEV && (
              <details
                style={{
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: 'var(--fly-texto-3)',
                  backgroundColor: 'var(--fly-fondo-2)',
                  padding: '16px',
                  borderRadius: '8px',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.recargar}
              style={{
                backgroundColor: 'var(--fly-primario)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
