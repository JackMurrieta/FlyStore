/**
 * Datos públicos de la marca: los usan el Header, el Footer y las páginas legales.
 * Un solo lugar para cambiarlos.
 */

export const MARCA = {
  nombre: 'FlyStore',
  /** Nombre comercial que aparece como responsable en Privacidad y Términos. */
  nombreComercial: 'FLY Store',
  sitio: 'flystore.mx',
  correoContacto: 'flycontact555@gmail.com',
  ciudad: 'Ciudad Obregón, Sonora, México',
  descripcion: 'Gorras, ropa, perfumes y tenis. Ciudad Obregón, Sonora.',
  /**
   * WhatsApp de la tienda con lada de país y sin «+» (ej. 526441234567).
   * Vacío = no se muestra el botón de WhatsApp en el Footer.
   */
  telefonoWhatsapp: '',
} as const

/** Categorías de la tienda (tabla categoria). Las rutas son del catálogo (CU-01). */
export const CATEGORIAS = [
  { nombre: 'CAPS', ruta: '/categoria/caps' },
  { nombre: 'ESSENCE', ruta: '/categoria/essence' },
  { nombre: 'CLOTHES', ruta: '/categoria/clothes' },
  { nombre: 'SHOES', ruta: '/categoria/shoes' },
] as const

/** Rutas públicas de ayuda y legales. */
export const RUTAS_AYUDA = {
  preguntasFrecuentes: '/preguntas-frecuentes',
  terminos: '/terminos',
  privacidad: '/privacidad',
} as const

/** Rutas de la cuenta del cliente. */
export const RUTAS_CUENTA = {
  perfil: '/perfil',
  direcciones: '/perfil/direcciones',
  seguridad: '/perfil/seguridad',
  misPedidos: '/mis-pedidos',
  carrito: '/carrito',
  iniciarSesion: '/iniciar-sesion',
  registro: '/registro',
} as const

/** Enlace wa.me con un mensaje inicial; null si la tienda aún no configura su número. */
export function enlaceWhatsapp(mensaje = 'Hola, tengo una duda sobre FlyStore'): string | null {
  return MARCA.telefonoWhatsapp ? `https://wa.me/${MARCA.telefonoWhatsapp}?text=${encodeURIComponent(mensaje)}` : null
}
