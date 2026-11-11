import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { DatosProductoTs } from '../dominio/DatosProductoTs'
import type { VarianteProductoTs } from '../dominio/VarianteProductoTs'
import type { PrecioProductoTs } from '../dominio/PrecioProductoTs'
import { TipoPrecio } from '../dominio/TipoPrecio'

export class ProductoModel {
  private readonly productoService: IProductoService
  constructor(productoService: IProductoService) { this.productoService = productoService }

  validarDatosCompletos(datos: DatosProductoTs): Record<string, string> {
    const errores: Record<string, string> = {}
    for (const campo of ['clave', 'nombre', 'descripcion', 'idCategoria', 'idSubcategoria', 'idMarca'] as const) {
      if (!datos[campo].trim()) errores[campo] = 'Este campo es obligatorio'
    }
    if (!datos.imagenes) errores.imagenes = 'Selecciona una imagen'
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

  crearProductoDTO(datos: DatosProductoTs) {
    if (!datos.imagenes) throw new Error('Selecciona una imagen')
    return { clave: datos.clave.trim(), nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
      idCategoria: datos.idCategoria, idSubcategoria: datos.idSubcategoria,
      idMarca: datos.idMarca, imagenes: datos.imagenes, estado: datos.estado }
  }

  private progreso: { datos: DatosProductoTs; idProducto: string; variantes: number } | null = null

  tieneRegistroPendiente(): boolean { return this.progreso !== null }

  async registrarProducto(datos: DatosProductoTs): Promise<void> {
    if (Object.keys(this.validarDatosCompletos(datos)).length) throw new Error('Revisa los datos del producto')
    if (!this.progreso) {
      const creado = await this.productoService.crearProducto(this.crearProductoDTO(datos))
      this.progreso = { datos, idProducto: creado.idProducto, variantes: 0 }
    }
    if (this.progreso.datos !== datos) throw new Error('Reintenta el registro pendiente antes de cambiar los datos')
    const progreso = this.progreso
    while (progreso.variantes < datos.variantes.length) {
      const variante = datos.variantes[progreso.variantes]!
      await this.productoService.agregarVariante(progreso.idProducto, variante)
      progreso.variantes++
    }
    await this.productoService.crearPrecios(progreso.idProducto, { preciosProducto: datos.precios })
    this.progreso = null
  }
}
