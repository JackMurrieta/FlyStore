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

import imagenGorras from '../../assets/index/gorras.webp'
import imagenEssence from '../../assets/index/essentials.webp'
import imagenRopa from '../../assets/index/clothes.webp'
import imagenTenis from '../../assets/index/tenis.webp'

/**
 * Líneas de la tienda (tabla categoria). {@code clave} es el segmento de la ruta del catálogo (CU-01):
 * /categoria/{clave} muestra sus marcas y /categoria/{clave}/productos su catálogo.
 */
export const CATEGORIAS = [
  { nombre: 'CAPS', clave: 'caps', ruta: '/categoria/caps', titulo: 'Gorras', imagen: imagenGorras,
    descripcion: 'Elige una marca para ver sus modelos o mira todas las gorras disponibles.', tipo: 'Tipo de gorra' },
  { nombre: 'ESSENCE', clave: 'essence', ruta: '/categoria/essence', titulo: 'Perfumes', imagen: imagenEssence,
    descripcion: 'Elige una marca para ver sus fragancias o mira todos los perfumes disponibles.', tipo: 'Tipo' },
  { nombre: 'CLOTHES', clave: 'clothes', ruta: '/categoria/clothes', titulo: 'Ropa', imagen: imagenRopa,
    descripcion: 'Elige una marca para ver sus prendas o mira toda la ropa disponible.', tipo: 'Tipo de prenda' },
  { nombre: 'SHOES', clave: 'shoes', ruta: '/categoria/shoes', titulo: 'Tenis', imagen: imagenTenis,
    descripcion: 'Elige una marca para ver sus modelos o mira todos los tenis disponibles.', tipo: 'Tipo' },
] as const

export type CategoriaTienda = (typeof CATEGORIAS)[number]

/** Datos de presentación de una línea por su ruta (caps, essence…); undefined si no es una de las cuatro. */
export function categoriaPorClave(clave: string | null | undefined): CategoriaTienda | undefined {
  const buscada = (clave ?? '').trim().toLowerCase()
  return CATEGORIAS.find(c => c.clave === buscada)
}

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
