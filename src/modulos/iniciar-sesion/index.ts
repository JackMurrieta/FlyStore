/**
 * Exportaciones públicas del módulo iniciar-sesion
 * Solo exporta lo que otros módulos deben consumir
 */

// Vistas (para lazy loading en rutas)
export { default as IniciarSesionVista } from './presentacion/vistas/IniciarSesionVista'
export { default as RegistroVista } from './presentacion/vistas/RegistroVista'
export { default as CallbackAuthVista } from './presentacion/vistas/CallbackAuthVista'
export { default as RecuperarContrasenaVista } from './presentacion/vistas/RecuperarContrasenaVista'
export { default as RestablecerContrasenaVista } from './presentacion/vistas/RestablecerContrasenaVista'
export { default as ConfirmarCuentaVista } from './presentacion/vistas/ConfirmarCuentaVista'

// Servicios (para contenedor)
export { AutenticacionHttpService } from './infraestructura/AutenticacionHttpService'
export { UsuarioHttpService } from './infraestructura/UsuarioHttpService'

// Modelo (para contenedor)
export { SesionModel } from './aplicacion/SesionModel'
