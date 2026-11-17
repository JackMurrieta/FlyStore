import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { DatosProductoTs } from '../dominio/DatosProductoTs'
import type { VarianteProductoTs } from '../dominio/VarianteProductoTs'
import type { PrecioProductoTs } from '../dominio/PrecioProductoTs'
import { TipoPrecio } from '../dominio/TipoPrecio'

export class ProductoModel {
  private readonly productoService: Pick<IProductoService, 'crearProducto'>
  constructor(productoService: Pick<IProductoService, 'crearProducto'>) { this.productoService = productoService }

  validarDatosCompletos(datos: DatosProductoTs): Record<string, string> {
    const errores: Record<string, string> = {}
    for (const campo of ['clave', 'nombre', 'descripcion', 'idCategoria', 'idSubcategoria', 'idMarca'] as const) {
      if (!datos[campo].trim()) errores[campo] = 'Este campo es obligatorio'
    }
    if (!datos.imagenes) errores.imagenes = 'Selecciona una imagen'
    else if (!['image/jpeg','image/png','image/webp'].includes(datos.imagenes.type) || !datos.imagenes.size || datos.imagenes.size > 5*1024*1024) errores.imagenes = 'Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB'
    const claves = datos.variantes.map(v => v.talla.trim().toLowerCase() + ':' + v.color.trim().toLowerCase())
    if (new Set(claves).size !== claves.length) errores.variantes = 'La combinación de talla y color ya existe'
    if (new Set(datos.precios.map(p=>p.tipoPrecio)).size !== datos.precios.length) errores.precios = 'No repitas tipos de precio'
    const base = datos.precios.find(p=>p.tipoPrecio === TipoPrecio.BASE)
    if (base && (base.minPiezas !== 1 || datos.precios.some(p=>p.precio > base.precio))) errores.precios = 'BASE debe aplicar desde una pieza y los precios por volumen no pueden superarlo'
    if (!datos.variantes.length) errores.variantes = 'Agrega al menos una variante'
    if (datos.variantes.some(v => this.validarVariante(v))) errores.variantes = 'Revisa las variantes'
    if (!datos.precios.some(p => p.tipoPrecio === TipoPrecio.BASE)) errores.precios = 'Agrega el precio base'
    if (datos.precios.some(p => this.validarPrecio(p))) errores.precios = 'Revisa los precios'
    return errores
  }

  validarVariante(variante: VarianteProductoTs): string | null {
    return !variante.talla.trim() || !variante.color.trim() || !Number.isInteger(variante.stock) || variante.stock < 0
      ? 'Indica talla, color y existencias enteras no negativas' : null
  }

  validarPrecio(precio: PrecioProductoTs): string | null {
    return !Object.values(TipoPrecio).includes(precio.tipoPrecio) || !Number.isFinite(precio.precio) || precio.precio <= 0 || !Number.isInteger(precio.minPiezas) || precio.minPiezas < 1
      ? 'Indica un precio positivo y una cantidad mínima entera mayor que cero' : null
  }

  aCrearProductoDTO(datos: DatosProductoTs) {
    if (!datos.imagenes) throw new Error('Selecciona una imagen')
    return { clave: datos.clave.trim(), nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
      idCategoria: datos.idCategoria, idSubcategoria: datos.idSubcategoria,
      idMarca: datos.idMarca, imagenes: datos.imagenes, estado: datos.estado, variantes: datos.variantes, preciosProducto: datos.precios }
  }

  async registrarProducto(datos: DatosProductoTs): Promise<void> {
    if (Object.keys(this.validarDatosCompletos(datos)).length) throw new Error('Revisa los datos del producto')
    await this.productoService.crearProducto(this.aCrearProductoDTO(datos))
  }
}
