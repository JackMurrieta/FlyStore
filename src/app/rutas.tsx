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
        <Route path="/admin/catalogo" element={<RutaProtegida roles={['ADMIN', 'EMPLEADO']}><CatalogoAdminVista /></RutaProtegida>} />
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
