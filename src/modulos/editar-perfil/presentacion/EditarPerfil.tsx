/**
 * Raíz del módulo Gestionar perfil («Mi perfil»). Recibe los modelos ya creados (app/contenedor.ts)
 * y define las pestañas, cada una con su ruta:
 *   {rutaBase}              → Datos personales
 *   {rutaBase}/direcciones  → Direcciones (solo clientes)
 *   {rutaBase}/seguridad    → Correo, contraseña y sesiones
 * Montar dentro de <RutaProtegida> en una ruta con comodín (ej. "/perfil/*").
 */

import { useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Aviso, Boton, CuerpoCarga, Icono } from '@compartido/ui'
import type { ModelosPerfil } from '../aplicacion/ModelosPerfil'
import { ModelosPerfilContext, useModelosPerfil, type ContextoPerfil } from './ModelosPerfilContext'
import { usePerfil } from './hooks/usePerfil'
import { PaginaPerfil } from './componentes/PaginaPerfil'
import DatosPersonalesView from './vistas/DatosPersonalesView'
import DireccionesView from './vistas/DireccionesView'
import SeguridadView from './vistas/SeguridadView'
import estilos from './componentes/perfil.module.css'

export interface EditarPerfilProps {
  readonly modelos: ModelosPerfil
  readonly rutaBase?: string
}

export function EditarPerfil({ modelos, rutaBase = '/perfil' }: EditarPerfilProps) {
  const contexto = useMemo<ContextoPerfil>(() => ({ modelos, rutaBase }), [modelos, rutaBase])
  return (
    <ModelosPerfilContext.Provider value={contexto}>
      <PestanasPerfil />
    </ModelosPerfilContext.Provider>
  )
}

function PestanasPerfil() {
  const { perfil, cargando, error, reintentar } = usePerfil()
  const { rutaBase } = useModelosPerfil()

  if (!perfil) {
    return (
      <PaginaPerfil perfil={null}>
        {cargando && <div role="status" aria-busy="true"><span className={estilos.oculto}>Cargando tu perfil…</span><CuerpoCarga diseno="formulario" /></div>}
        {error && (
          <div className={estilos.estadoError}>
            <Aviso tono="error" titulo="No pudimos cargar tu perfil">{error.mensaje}</Aviso>
            <Boton variante="secundario" icono={<Icono nombre="refresh" tamano={18} />} onClick={reintentar}>Reintentar</Boton>
          </div>
        )}
      </PaginaPerfil>
    )
  }

  const esCliente = perfil.tipoUsuario === 'cliente'
  return (
    <PaginaPerfil perfil={perfil}>
      <Routes>
        <Route index element={<DatosPersonalesView perfil={perfil} />} />
        <Route path="direcciones" element={esCliente ? <DireccionesView /> : <Navigate to={rutaBase} replace />} />
        <Route path="seguridad" element={<SeguridadView perfil={perfil} />} />
        <Route path="*" element={<Navigate to={rutaBase} replace />} />
      </Routes>
    </PaginaPerfil>
  )
}

export default EditarPerfil
