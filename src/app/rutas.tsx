/**
 * Configuración de rutas de la aplicación
 * Usa lazy loading para los módulos
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RutaProtegida } from '@compartido/sesion'
import { contenedor } from './contenedor'
import { CargaPagina } from '@compartido/ui/carga'

// Lazy loading de módulos (se cargan solo cuando se necesitan)
const IniciarSesionVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.IniciarSesionVista })))
const RegistroVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.RegistroVista })))
const CallbackAuthVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.CallbackAuthVista })))
const RecuperarContrasenaVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.RecuperarContrasenaVista })))
const RestablecerContrasenaVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.RestablecerContrasenaVista })))
const ConfirmarCuentaVista = lazy(() => import('@modulos/iniciar-sesion').then(m => ({ default: m.ConfirmarCuentaVista })))
const EditarPerfil = lazy(() => import('@modulos/editar-perfil').then(m => ({ default: m.EditarPerfil })))

// Páginas públicas de información (Google OAuth pide Privacidad y Términos en el mismo dominio)
const PrivacidadVista = lazy(() => import('./vistas/informacion/PrivacidadVista'))
const TerminosVista = lazy(() => import('./vistas/informacion/TerminosVista'))
const PreguntasFrecuentesVista = lazy(() => import('./vistas/informacion/PreguntasFrecuentesVista'))
const GestionarVenta = lazy(() => import('@modulos/gestionar-venta').then(m => ({ default: m.GestionarVenta })))
const MisPedidos = lazy(() => import('@modulos/gestionar-venta').then(m => ({ default: m.MisPedidos })))
// CU-01 Consultar catálogo (público)
const CatalogoTienda = lazy(() => import('@modulos/consultar-catalogo').then(m => ({ default: m.CatalogoTienda })))

// CU-04 Administrar Pedidos (solo ADMIN y EMPLEADO)
const PedidosAdminVista = lazy(() => import('@modulos/administrar-pedidos').then(m => ({ default: m.PedidosAdminVista })))
const DetallePedidoVista = lazy(() => import('@modulos/administrar-pedidos').then(m => ({ default: m.DetallePedidoVista })))

// Panel «Administrar tienda» (ADMIN y EMPLEADO): layout de /admin/* con todas las secciones
const PanelTienda = lazy(() => import('@modulos/administrar-tienda').then(m => ({ default: m.PanelTienda })))
const InicioPanelView = lazy(() => import('@modulos/administrar-tienda').then(m => ({ default: m.InicioPanelView })))
const ProximamenteView = lazy(() => import('@modulos/administrar-tienda').then(m => ({ default: m.ProximamenteView })))
// CU-03 Administrar catálogo (dentro del panel)
const CatalogoAdminVista = lazy(() => import('./vistas/CatalogoAdminVista'))
const ProductoFormularioVista = lazy(() => import('./vistas/ProductoFormularioVista'))
// Vista temporal de inicio
const InicioVista = lazy(() => import('./vistas/InicioVista'))
// El import y la ruta se eliminan de la compilación de producción.
const AdministrarCatalogoDemo = import.meta.env.DEV
  ? lazy(() => import('./desarrollo/AdministrarCatalogoDemo'))
  : null
const GestionarVentaDemo = import.meta.env.DEV
  ? lazy(() => import('./desarrollo/GestionarVentaDemo'))
  : null

/** Mientras llega el código de una ruta: barra superior + esqueleto de página. */
function CargandoRuta() {
  return <CargaPagina texto="Cargando la página…" />
}

export function Rutas() {
  return (
    <Suspense fallback={<CargandoRuta />}>
      <Routes>
        {/* Ruta raíz */}
        <Route path="/" element={<InicioVista />} />
        {AdministrarCatalogoDemo && <Route path="/dev/administrar-catalogo" element={<AdministrarCatalogoDemo />} />}
        {GestionarVentaDemo && <Route path="/dev/gestionar-venta/*" element={<GestionarVentaDemo />} />}

        {/* CU-01 Consultar catálogo (público): marcas de la línea → catálogo → ficha; búsqueda en toda la tienda */}
        <Route path="/categoria/:linea" element={<CatalogoTienda modelos={contenedor.modelosCatalogo} vista="marcas" />} />
        <Route path="/categoria/:linea/productos" element={<CatalogoTienda modelos={contenedor.modelosCatalogo} vista="catalogo" />} />
        <Route path="/buscar" element={<CatalogoTienda modelos={contenedor.modelosCatalogo} vista="busqueda" />} />
        <Route path="/producto/:id" element={<CatalogoTienda modelos={contenedor.modelosCatalogo} vista="detalle" />} />
        <Route path="/catalogo" element={<Navigate to="/categoria/caps" replace />} />
        <Route path="/productos" element={<Navigate to="/categoria/caps" replace />} />

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

        {/* Gestionar perfil (protegido): Datos personales · Direcciones · Seguridad */}
        <Route
          path="/perfil/*"
          element={
            <RutaProtegida>
              <EditarPerfil modelos={contenedor.modelosPerfil} rutaBase="/perfil" />
            </RutaProtegida>
          }
        />

        {/* Rutas del módulo iniciar-sesion */}
        <Route path="/iniciar-sesion" element={<IniciarSesionVista />} />
        <Route path="/registro" element={<RegistroVista />} />
        <Route path="/auth/callback" element={<CallbackAuthVista />} />
        <Route path="/auth/confirmar" element={<ConfirmarCuentaVista />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasenaVista />} />
        <Route path="/restablecer-contrasena" element={<RutaProtegida><RestablecerContrasenaVista /></RutaProtegida>} />

        {/* Información pública */}
        <Route path="/privacidad" element={<PrivacidadVista />} />
        <Route path="/terminos" element={<TerminosVista />} />
        <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesVista />} />

        {/* Panel «Administrar tienda» (solo personal): pedidos, catálogo y secciones «Pronto» */}
        <Route
          path="/admin"
          element={
            <RutaProtegida roles={['ADMIN', 'EMPLEADO']}>
              <PanelTienda modelos={contenedor.modelosPanel} />
            </RutaProtegida>
          }
        >
          <Route index element={<InicioPanelView />} />
          {/* CU-04 Administrar pedidos */}
          <Route path="pedidos" element={<PedidosAdminVista />} />
          <Route path="pedidos/:folio" element={<DetallePedidoVista />} />
          {/* CU-03 Administrar catálogo */}
          <Route path="catalogo" element={<CatalogoAdminVista />} />
          <Route path="catalogo/nuevo" element={<ProductoFormularioVista />} />
          <Route path="catalogo/:idProducto/editar" element={<ProductoFormularioVista />} />
          {/* Secciones sin backend todavía */}
          <Route path="inventario" element={<ProximamenteView seccion="inventario" />} />
          <Route path="codigos-descuento" element={<ProximamenteView seccion="codigos" />} />
          <Route path="clientes" element={<ProximamenteView seccion="clientes" />} />
          <Route path="empleados" element={<ProximamenteView seccion="empleados" />} />
          <Route path="reportes" element={<ProximamenteView seccion="reportes" />} />
          <Route path="configuracion" element={<ProximamenteView seccion="configuracion" />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
