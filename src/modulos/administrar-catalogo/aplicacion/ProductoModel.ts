import type { IProductoService } from '../dominio/puertos/IProductoService'
import {
  grupoActivo, type DatosProductoTs, type FotoProductoTs, type GrupoColorTs, type ModoFormulario,
  type ProductoEdicionTs, type VarianteFormularioTs,
} from '../dominio/DatosProductoTs'
import type { PrecioProductoTs } from '../dominio/PrecioProductoTs'
import { EstadoProducto } from '../dominio/EstadoProducto'
import { TipoPrecio } from '../dominio/TipoPrecio'
import type { CrearProductoDTO } from './dto/CrearProductoDTO'
import type { EditarProductoDTO } from './dto/EditarProductoDTO'
import type { ImagenColorDTO } from './dto/ImagenColorDTO'
import type { ProductoEdicionDTO } from './dto/ProductoEdicionDTO'
import type { VarianteEdicionDTO } from './dto/VarianteEdicionDTO'

/** Límites del backend (ver CATALOGO.md): hasta 10 archivos nuevos por petición, JPG/PNG/WEBP de hasta 5 MB. */
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'] as const
export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024
export const MAXIMO_ARCHIVOS_NUEVOS = 10

/** Clave del error de un color concreto dentro de `erroresPorCampo`. */
export const errorDeGrupo = (claveGrupo: string) => `grupo.${claveGrupo}`

/** Error de la petición traducido para el formulario: `campo` indica dónde mostrarlo. */
export class ErrorGuardarProducto extends Error {
  readonly campo: string | null
  constructor(mensaje: string, campo: string | null = null) {
    super(mensaje)
    this.name = 'ErrorGuardarProducto'
    this.campo = campo
  }
}

let consecutivo = 0
/** Llaves locales estables para las listas del formulario. */
export const nuevaClave = (prefijo: string) => `${prefijo}-${++consecutivo}`

const normalizar = (texto: string) => texto.trim().toLocaleLowerCase('es-MX')
const estadoHttp = (error: unknown) =>
  typeof error === 'object' && error !== null && 'statusHTTP' in error ? (error as { statusHTTP?: number }).statusHTTP : undefined

export class ProductoModel {
  private readonly productoService: Pick<IProductoService, 'crearProducto' | 'obtenerProductoParaEditar' | 'editarProducto'>
  constructor(productoService: Pick<IProductoService, 'crearProducto' | 'obtenerProductoParaEditar' | 'editarProducto'>) {
    this.productoService = productoService
  }

  /** Archivo aceptable para subir; devuelve el motivo si no. */
  validarArchivo(archivo: File): string | null {
    if (!(TIPOS_IMAGEN as readonly string[]).includes(archivo.type)) return `«${archivo.name}» no es JPG, PNG ni WEBP.`
    if (!archivo.size) return `«${archivo.name}» está vacío.`
    if (archivo.size > TAMANO_MAXIMO_IMAGEN) return `«${archivo.name}» pesa más de 5 MB.`
    return null
  }

  /** Fotos nuevas (archivos) que se enviarían al guardar. */
  contarArchivosNuevos(datos: DatosProductoTs): number {
    return datos.grupos.filter(grupoActivo).reduce((total, grupo) => total + grupo.fotos.filter(foto => foto.archivo).length, 0)
  }

  /**
   * Reglas del formulario (las mismas que aplica el backend, para avisar antes de enviar).
   * Las claves de error son los campos de `DatosProductoTs`, `variantes`, `fotos`, `precios` y `grupo.<clave>`.
   */
  validarDatosCompletos(datos: DatosProductoTs, modo: ModoFormulario = 'ALTA', estadoOriginal?: EstadoProducto, colores?: string[]): Record<string, string> {
    const errores: Record<string, string> = {}
    for (const campo of ['clave', 'nombre', 'descripcion', 'idCategoria', 'idSubcategoria', 'idMarca'] as const) {
      if (!datos[campo].trim()) errores[campo] = 'Este campo es obligatorio'
    }
    const estadosValidos: string[] = [EstadoProducto.PUBLICADO, EstadoProducto.BORRADOR, EstadoProducto.INACTIVO]
    if (modo === 'EDICION' && estadoOriginal === EstadoProducto.STOCK_BAJO) estadosValidos.push(EstadoProducto.STOCK_BAJO)
    if (!estadosValidos.includes(datos.estado)) {
      errores.estado = modo === 'ALTA'
        ? 'El stock bajo no es un estado de alta; selecciona publicado, borrador o inactivo'
        : 'Selecciona publicado, borrador o inactivo'
    }

    const activos = datos.grupos.filter(grupoActivo)
    if (!activos.length) errores.variantes = 'Agrega al menos un color con su talla y existencia'
    const vistos = new Set<string>()
    for (const grupo of datos.grupos) {
      const error = this.validarGrupo(grupo, colores)
      if (error) errores[errorDeGrupo(grupo.clave)] = error
      else if (grupoActivo(grupo)) {
        if (vistos.has(normalizar(grupo.color))) errores[errorDeGrupo(grupo.clave)] = `El color ${grupo.color} ya está en otro grupo; agrega ahí sus tallas`
        vistos.add(normalizar(grupo.color))
      }
    }
    if (!errores.variantes && datos.grupos.some(grupo => errores[errorDeGrupo(grupo.clave)])) errores.variantes = 'Revisa los colores, tallas y fotos señalados'

    const coloresActivos = new Set(activos.map(grupo => normalizar(grupo.color)))
    if (datos.fotosSinColor.some(foto => !coloresActivos.has(normalizar(foto.color)))) {
      errores.fotos = 'Asigna a cada foto sin color uno de los colores del producto o quítala'
    }
    const nuevos = this.contarArchivosNuevos(datos)
    if (nuevos > MAXIMO_ARCHIVOS_NUEVOS) {
      errores.fotos = `Puedes subir hasta ${MAXIMO_ARCHIVOS_NUEVOS} fotos nuevas por guardado; hay ${nuevos}. Guarda y agrega el resto después.`
    }

    const errorPrecios = this.validarPrecios(datos.precios)
    if (errorPrecios) errores.precios = errorPrecios
    return errores
  }

  /** Un color: nombre válido, tallas sin repetir con existencias enteras y al menos una foto. */
  validarGrupo(grupo: GrupoColorTs, colores?: string[]): string | null {
    if (!grupoActivo(grupo)) return null
    if (!grupo.color.trim()) return 'Selecciona el color predominante'
    const esNuevo = grupo.variantes.every(variante => !variante.idVariante)
    if (esNuevo && colores && !colores.some(color => normalizar(color) === normalizar(grupo.color))) return 'Selecciona un color de la lista'
    const tallas = new Set<string>()
    for (const variante of grupo.variantes) {
      const error = this.validarVariante(variante)
      if (error) return error
      const talla = normalizar(variante.talla)
      // Una talla nueva no puede repetir otra del color, aunque esa se esté quitando (se usa «Deshacer»).
      if (tallas.has(talla) && (!variante.quitada || !variante.idVariante)) return `La talla ${variante.talla} está repetida en ${grupo.color}`
      tallas.add(talla)
    }
    if (!grupo.fotos.length) return `Agrega al menos una foto de ${grupo.color}`
    return null
  }

  validarVariante(variante: Pick<VarianteFormularioTs, 'talla' | 'stock' | 'quitada'>): string | null {
    if (variante.quitada) return null
    if (!variante.talla.trim()) return 'Selecciona la talla'
    return !Number.isInteger(variante.stock) || variante.stock < 0 ? 'La existencia debe ser un número entero, 0 o mayor' : null
  }

  validarPrecio(precio: PrecioProductoTs): string | null {
    return !Object.values(TipoPrecio).includes(precio.tipoPrecio) || !Number.isFinite(precio.precio) || precio.precio <= 0 || !Number.isInteger(precio.minPiezas) || precio.minPiezas < 1
      ? 'Indica un precio positivo y una cantidad mínima entera mayor que cero' : null
  }

  validarPrecios(precios: PrecioProductoTs[]): string | null {
    const base = precios.find(precio => precio.tipoPrecio === TipoPrecio.BASE)
    if (!base) return 'Agrega el precio base'
    if (precios.some(precio => this.validarPrecio(precio))) return 'Revisa los precios: importes positivos y mínimos enteros desde 1'
    if (new Set(precios.map(precio => precio.tipoPrecio)).size !== precios.length) return 'No repitas tipos de precio'
    if (base.minPiezas !== 1) return 'El precio base aplica desde una pieza'
    if (precios.some(precio => precio.precio > base.precio)) return 'Los precios por volumen no pueden superar al precio base'
    return null
  }

  /** Arma la parte `producto` del alta y la lista de archivos en el orden de sus índices. */
  aCrearProductoDTO(datos: DatosProductoTs): { dto: CrearProductoDTO; archivos: File[] } {
    const archivos: File[] = []
    const activos = datos.grupos.filter(grupoActivo)
    const dto: CrearProductoDTO = {
      clave: datos.clave.trim(), nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
      idCategoria: datos.idCategoria, idSubcategoria: datos.idSubcategoria, idMarca: datos.idMarca, estado: datos.estado,
      variantes: activos.flatMap(grupo => grupo.variantes.filter(variante => !variante.quitada)
        .map(variante => ({ talla: variante.talla, color: grupo.color, stock: variante.stock }))),
      imagenes: activos.flatMap(grupo => grupo.fotos.map(foto => this.aImagenColor(foto, grupo.color, archivos))),
      preciosProducto: this.ordenarPrecios(datos.precios),
    }
    return { dto, archivos }
  }

  /**
   * Arma el PUT: las variantes guardadas solo envían su existencia; las quitadas no se envían
   * (el backend borra o deja en 0 las que tienen pedidos). La galería va color por color.
   */
  aEditarProductoDTO(datos: DatosProductoTs): { dto: EditarProductoDTO; archivos: File[] } {
    const archivos: File[] = []
    const activos = datos.grupos.filter(grupoActivo)
    const variantes: VarianteEdicionDTO[] = activos.flatMap(grupo => grupo.variantes.filter(variante => !variante.quitada)
      .map(variante => variante.idVariante
        ? { idVariante: variante.idVariante, stock: variante.stock }
        : { talla: variante.talla, color: grupo.color, stock: variante.stock }))
    const imagenes: ImagenColorDTO[] = activos.flatMap(grupo => [
      ...grupo.fotos.map(foto => this.aImagenColor(foto, grupo.color, archivos)),
      ...datos.fotosSinColor.filter(foto => normalizar(foto.color) === normalizar(grupo.color))
        .map(foto => this.aImagenColor(foto, grupo.color, archivos)),
    ])
    const dto: EditarProductoDTO = {
      clave: datos.clave.trim(), nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
      idSubcategoria: datos.idSubcategoria, idMarca: datos.idMarca, estado: datos.estado,
      variantes, imagenes, preciosProducto: this.ordenarPrecios(datos.precios),
    }
    return { dto, archivos }
  }

  /** Convierte la respuesta del backend en el formulario: agrupa variantes y fotos por color. */
  aProductoEdicion(dto: ProductoEdicionDTO): ProductoEdicionTs {
    const estado = Object.values(EstadoProducto).find(valor => valor === dto.estado) ?? EstadoProducto.BORRADOR
    const grupos: GrupoColorTs[] = []
    for (const variante of dto.variantes) {
      let grupo = grupos.find(item => normalizar(item.color) === normalizar(variante.color))
      if (!grupo) {
        grupo = { clave: nuevaClave('color'), color: variante.color, hex: variante.hex ?? null, variantes: [], fotos: [] }
        grupos.push(grupo)
      }
      grupo.variantes.push({ clave: nuevaClave('variante'), idVariante: variante.idVariante, sku: variante.sku ?? null,
        talla: variante.talla, stock: variante.stock, conPedidos: variante.conPedidos, quitada: false })
    }
    const fotosSinColor: ProductoEdicionTs['datos']['fotosSinColor'] = []
    const imagenes = [...dto.imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    for (const imagen of imagenes) {
      const foto: FotoProductoTs = { clave: nuevaClave('foto'), idImagen: imagen.idImagen, url: imagen.url, archivo: null, vistaPrevia: null }
      const grupo = imagen.color ? grupos.find(item => normalizar(item.color) === normalizar(imagen.color ?? '')) : undefined
      if (grupo) grupo.fotos.push(foto)
      else fotosSinColor.push({ ...foto, color: '' })
    }
    const precios = dto.preciosProducto.flatMap(precio => {
      const tipoPrecio = Object.values(TipoPrecio).find(valor => valor === precio.tipoPrecio)
      return tipoPrecio ? [{ tipoPrecio, precio: precio.precio, minPiezas: precio.minPiezas }] : []
    })
    return {
      idProducto: dto.idProducto, categoria: dto.categoria, estadoOriginal: estado,
      datos: {
        clave: dto.clave, nombre: dto.nombre, descripcion: dto.descripcion ?? '', idCategoria: dto.idCategoria,
        idSubcategoria: dto.idSubcategoria, idMarca: dto.idMarca, estado, grupos, fotosSinColor, precios,
      },
    }
  }

  async registrarProducto(datos: DatosProductoTs, colores?: string[]): Promise<void> {
    if (Object.keys(this.validarDatosCompletos(datos, 'ALTA', undefined, colores)).length) throw new Error('Revisa los datos del producto')
    const { dto, archivos } = this.aCrearProductoDTO(datos)
    try {
      await this.productoService.crearProducto(dto, archivos)
    } catch (error) {
      throw this.traducirError(error)
    }
  }

  async obtenerParaEditar(idProducto: string): Promise<ProductoEdicionTs> {
    try {
      return this.aProductoEdicion(await this.productoService.obtenerProductoParaEditar(idProducto))
    } catch (error) {
      if (estadoHttp(error) === 404) throw new ErrorGuardarProducto('Este producto ya no existe. Pudo haberse eliminado.')
      throw error
    }
  }

  async guardarCambios(idProducto: string, datos: DatosProductoTs, estadoOriginal: EstadoProducto): Promise<ProductoEdicionTs> {
    if (Object.keys(this.validarDatosCompletos(datos, 'EDICION', estadoOriginal)).length) throw new Error('Revisa los datos del producto')
    const { dto, archivos } = this.aEditarProductoDTO(datos)
    try {
      return this.aProductoEdicion(await this.productoService.editarProducto(idProducto, dto, archivos))
    } catch (error) {
      throw this.traducirError(error)
    }
  }

  private aImagenColor(foto: FotoProductoTs, color: string, archivos: File[]): ImagenColorDTO {
    if (foto.idImagen) return { idImagen: foto.idImagen, color }
    if (foto.archivo) {
      archivos.push(foto.archivo)
      return { archivo: archivos.length - 1, color }
    }
    return { url: foto.url ?? '', color }
  }

  /** Siempre en el orden de los esquemas (BASE primero) para que el contrato sea predecible. */
  private ordenarPrecios(precios: PrecioProductoTs[]): PrecioProductoTs[] {
    const orden = Object.values(TipoPrecio)
    return [...precios].sort((a, b) => orden.indexOf(a.tipoPrecio) - orden.indexOf(b.tipoPrecio))
  }

  /** 409 → clave repetida; 413 → fotos demasiado pesadas; 404 → el producto ya no existe. */
  private traducirError(error: unknown): unknown {
    const estado = estadoHttp(error)
    const mensaje = error instanceof Error ? error.message : ''
    if (estado === 409) return new ErrorGuardarProducto(mensaje || 'La clave / SKU ya pertenece a otro producto. Usa una diferente.', 'clave')
    if (estado === 413) return new ErrorGuardarProducto('Las fotos superan el tamaño permitido (5 MB cada una). Quita o reduce alguna.', 'fotos')
    if (estado === 404) return new ErrorGuardarProducto('Este producto ya no existe. Pudo haberse eliminado mientras lo editabas.')
    return error
  }
}
