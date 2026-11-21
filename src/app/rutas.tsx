/**
 * Configuración de rutas de la aplicación
 * Usa lazy loading para los módulos
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RutaProtegida } from '@compartido/sesion'
import { contenedor } from './contenedor'

// Lazy loading de módulos (se cargan solo cuando se necesitan)
const IniciarSesionVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.IniciarSesionVista })))
const RegistroVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.RegistroVista })))
const CallbackAuthVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.CallbackAuthVista })))
const GestionarVenta = lazy(() => import('@modulos/gestionar-venta').then(m => ({ default: m.GestionarVenta })))
const MisPedidos = lazy(() => import('@modulos/gestionar-venta').then(m => ({ default: m.MisPedidos })))

// CU-04 Administrar Pedidos (solo ADMIN y EMPLEADO)
const PedidosAdminVista = lazy(() => import('@modulos/administrar-pedidos').then(m => ({ default: m.PedidosAdminVista })))
const DetallePedidoVista = lazy(() => import('@modulos/administrar-pedidos').then(m => ({ default: m.DetallePedidoVista })))

// Vista temporal de inicio
const CatalogoAdminVista = lazy(() => import('./vistas/CatalogoAdminVista'))
const InicioVista = lazy(() => import('./vistas/InicioVista'))
// El import y la ruta se eliminan de la compilación de producción.
const AdministrarCatalogoDemo = import.meta.env.DEV
  ? lazy(() => import('./desarrollo/AdministrarCatalogoDemo'))
  : null
const GestionarVentaDemo = import.meta.env.DEV
  ? lazy(() => import('./desarrollo/GestionarVentaDemo'))
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
        <Route path="/admin/catalogo" element={<RutaProtegida roles={['ADMIN', 'EMPLEADO']}><CatalogoAdminVista /></RutaProtegida>} />
        {AdministrarCatalogoDemo && <Route path="/dev/administrar-catalogo" element={<AdministrarCatalogoDemo />} />}
        {GestionarVentaDemo && <Route path="/dev/gestionar-venta/*" element={<GestionarVentaDemo />} />}

        {/* CU-02 Gestionar venta (protegido): carrito → entrega → pago → confirmación → pedido registrado */}
        <Route
          path="/carrito/*"
          element={
            <RutaProtegida>
              <GestionarVenta modelos={contenedor.modelosVenta} rutaBase="/carrito" rutaMisPedidos="/mis-pedidos" />
            </RutaProtegida>
          }
        />
        {/* CU-02 · S6 Mis pedidos (protegido): estado de los pedidos y subir el comprobante después */}
        <Route
          path="/mis-pedidos"
          element={
            <RutaProtegida>
              <MisPedidos modelos={contenedor.modelosVenta} rutaCarrito="/carrito" rutaMisPedidos="/mis-pedidos" />
            </RutaProtegida>
          }
        />

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
