/**
 * Configuración de rutas de la aplicación
 * Usa lazy loading para los módulos
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RutaProtegida } from '@compartido/sesion'

// Lazy loading de módulos (se cargan solo cuando se necesitan)
const IniciarSesionVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.IniciarSesionVista })))
const RegistroVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.RegistroVista })))
const CallbackAuthVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.CallbackAuthVista })))

// CU-04 Administrar Pedidos (solo ADMIN y EMPLEADO)
const PedidosAdminVista = lazy(() => import('@modulos/administrar-pedidos').then(m => ({ default: m.PedidosAdminVista })))
const DetallePedidoVista = lazy(() => import('@modulos/administrar-pedidos').then(m => ({ default: m.DetallePedidoVista })))

// Vista temporal de inicio
const InicioVista = lazy(() => import('./vistas/InicioVista'))
// El import y la ruta se eliminan de la compilación de producción.
const AdministrarCatalogoDemo = import.meta.env.DEV
  ? lazy(() => import('./desarrollo/AdministrarCatalogoDemo'))
  : null

/**
 * Componente de carga para rutas lazy
 */
function CargandoRuta() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--fly-fondo)',
        color: 'var(--fly-texto-2)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
      }}
    >
      Cargando...
    </div>
  )
}

export function Rutas() {
  return (
    <Suspense fallback={<CargandoRuta />}>
      <Routes>
        {/* Ruta raíz */}
        <Route path="/" element={<InicioVista />} />
        {AdministrarCatalogoDemo && <Route path="/dev/administrar-catalogo" element={<AdministrarCatalogoDemo />} />}

        {/* Rutas del módulo iniciar-sesion */}
        <Route path="/iniciar-sesion" element={<IniciarSesionVista />} />
        <Route path="/registro" element={<RegistroVista />} />
        <Route path="/auth/callback" element={<CallbackAuthVista />} />

        {/* CU-04 Administrar Pedidos (protegido por rol) */}
        <Route
          path="/admin/pedidos"
          element={
            <RutaProtegida roles={['ADMIN', 'EMPLEADO']}>
              <PedidosAdminVista />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/pedidos/:folio"
          element={
            <RutaProtegida roles={['ADMIN', 'EMPLEADO']}>
              <DetallePedidoVista />
            </RutaProtegida>
          }
        />

        {/* TODO Fase 3+: Otras rutas de módulos */}
        {/* Consultar catálogo (público) */}
        {/* <Route path="/productos" element={<CatalogoVista />} /> */}
        {/* <Route path="/productos/:id" element={<DetalleProductoVista />} /> */}

        {/* Gestionar venta (protegido) */}
        {/* <Route */}
        {/*   path="/carrito" */}
        {/*   element={ */}
        {/*     <RutaProtegida> */}
        {/*       <CarritoVista /> */}
        {/*     </RutaProtegida> */}
        {/*   } */}
        {/* /> */}

        {/* Admin (protegido por rol) */}
        {/* <Route */}
        {/*   path="/admin/*" */}
        {/*   element={ */}
        {/*     <RutaProtegida roles={['ADMIN', 'EMPLEADO']}> */}
        {/*       <PanelAdminVista /> */}
        {/*     </RutaProtegida> */}
        {/*   } */}
        {/* /> */}

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
