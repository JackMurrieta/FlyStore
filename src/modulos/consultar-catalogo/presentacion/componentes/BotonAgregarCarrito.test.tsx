import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { BotonAgregarCarrito, type BotonAgregarCarritoProps } from './BotonAgregarCarrito'

const base: BotonAgregarCarritoProps = { disponible: true, deshabilitado: false, agregando: false, agregado: false, alAgregar: () => {} }

function montar(props: Partial<BotonAgregarCarritoProps> = {}) {
  const alAgregar = vi.fn()
  const vista = render(<BotonAgregarCarrito {...base} alAgregar={alAgregar} {...props} />)
  const actualizar = (cambios: Partial<BotonAgregarCarritoProps>) =>
    vista.rerender(<BotonAgregarCarrito {...base} alAgregar={alAgregar} {...props} {...cambios} />)
  return { alAgregar, actualizar, boton: () => screen.getByRole('button') }
}

const avanzar = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })

describe('BotonAgregarCarrito · animación de producto agregado', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('éxito: carga (cae el producto), sale a la derecha, «Agregado ✓» 2 s y regresa', () => {
    const { alAgregar, actualizar, boton } = montar()
    expect(boton()).toHaveAccessibleName('Agregar al carrito')
    expect(boton()).toHaveAttribute('data-fase', 'reposo')
    fireEvent.click(boton())
    expect(alAgregar).toHaveBeenCalledTimes(1)

    actualizar({ agregando: true })
    expect(boton()).toHaveAttribute('data-fase', 'cargando')
    expect(boton()).toHaveAttribute('aria-busy', 'true')
    expect(boton()).toHaveAccessibleName('Agregando…')
    expect(boton()).toBeEnabled()
    fireEvent.click(boton())
    expect(alAgregar).toHaveBeenCalledTimes(1)

    // El backend responde rápido: el carrito espera a que el producto termine de caer.
    actualizar({ agregando: false, agregado: true })
    expect(boton()).toHaveAttribute('data-fase', 'cargando')
    avanzar(760)
    expect(boton()).toHaveAttribute('data-fase', 'saliendo')
    avanzar(560)
    expect(boton()).toHaveAttribute('data-fase', 'agregado')
    expect(boton()).toHaveAccessibleName('Agregado')
    avanzar(2000)
    expect(boton()).toHaveAttribute('data-fase', 'reposo')
    expect(boton()).toHaveAccessibleName('Agregar al carrito')
  })

  it('backend lento: el carrito sale en cuanto responde', () => {
    const { actualizar, boton } = montar()
    actualizar({ agregando: true })
    avanzar(3000)
    expect(boton()).toHaveAttribute('data-fase', 'cargando')
    actualizar({ agregando: false, agregado: true })
    expect(boton()).toHaveAttribute('data-fase', 'saliendo')
  })

  it('error: el carrito sale sin el producto y vuelve a «Agregar al carrito»', () => {
    const { actualizar, boton } = montar()
    actualizar({ agregando: true })
    actualizar({ agregando: false, agregado: false })
    avanzar(760)
    expect(boton()).toHaveAttribute('data-fase', 'fallo')
    avanzar(480)
    expect(boton()).toHaveAttribute('data-fase', 'reposo')
    expect(boton()).toHaveAccessibleName('Agregar al carrito')
  })

  it('variante agotada: «Agotado» y deshabilitado', () => {
    const { boton } = montar({ disponible: false })
    expect(boton()).toHaveAccessibleName('Agotado')
    expect(boton()).toBeDisabled()
  })
})
