import type { ICatalogoService, IProductoService } from '@modulos/administrar-catalogo'
import type { ProductoCatalogoDTO } from '@modulos/administrar-catalogo/aplicacion/dto/ProductoCatalogoDTO'
import type { OpcionesCatalogoDTO } from '@modulos/administrar-catalogo/aplicacion/dto/OpcionesCatalogoDTO'
import type { ProductoEdicionDTO } from '@modulos/administrar-catalogo/aplicacion/dto/ProductoEdicionDTO'
import type { ImagenColorDTO } from '@modulos/administrar-catalogo/aplicacion/dto/ImagenColorDTO'

const opciones: OpcionesCatalogoDTO = {
  categorias: [{ id: 'gorras', nombre: 'FlyCaps' }, { id: 'ropa', nombre: 'FlyClothes' }, { id: 'tenis', nombre: 'FlyShoes' }],
  subcategorias: [{ id: 'gorra', nombre: 'Gorra' }, { id: 'playera', nombre: 'Playera' }, { id: 'deportivo', nombre: 'Deportivo' }],
  colores: ['Rojo', 'Negro', 'Gris', 'Verde', 'Azul'],
  marcas: [{ id: 'new-era', nombre: 'New Era' }, { id: 'fly', nombre: 'FLY' }, { id: 'nike', nombre: 'Nike' }],
}

function productosIniciales(): ProductoCatalogoDTO[] {
  return [
    { idProducto: 'demo-1', clave: 'NE-940-LAD-NEG', nombre: '9FORTY LA Dodgers Negro', img: '',
      categoria: 'FlyCaps', subcategoria: 'Gorra', marca: 'New Era', estado: 'PUBLICADO',
      variantes: [{ talla: 'Ajustable', color: 'Negro', stock: 18 }],
      preciosProducto: [{ tipoPrecio: 'BASE', precio: 250, minPiezas: 1 }, { tipoPrecio: 'MAYOREO', precio: 210, minPiezas: 6 }, { tipoPrecio: 'DISTRIBUIDOR', precio: 190, minPiezas: 12 }] },
    { idProducto: 'demo-2', clave: 'FL-OVS-NEG', nombre: 'Playera Oversize FLY Negra', img: '',
      categoria: 'FlyClothes', subcategoria: 'Playera', marca: 'FLY', estado: 'BORRADOR',
      variantes: [{ talla: 'M', color: 'Negro', stock: 0 }], preciosProducto: [{ tipoPrecio: 'BASE', precio: 390, minPiezas: 1 }] },
    { idProducto: 'demo-3', clave: 'NK-AF1-NEG', nombre: 'Air Force 1 Negro', img: '',
      categoria: 'FlyShoes', subcategoria: 'Deportivo', marca: 'Nike', estado: 'PUBLICADO',
      variantes: [{ talla: '27', color: 'Negro', stock: 7 }], preciosProducto: [{ tipoPrecio: 'BASE', precio: 1850, minPiezas: 1 }] },
    { idProducto: 'demo-4', clave: 'NE-SNP-RAI-GRS', nombre: 'Snapback Raiders Gris', img: '',
      categoria: 'FlyCaps', subcategoria: 'Gorra', marca: 'New Era', estado: 'INACTIVO',
      variantes: [{ talla: 'Ajustable', color: 'Gris', stock: 12 }], preciosProducto: [{ tipoPrecio: 'BASE', precio: 300, minPiezas: 1 }] },
  ]
}

/** Adaptadores de desarrollo: no realizan peticiones ni guardan datos en el navegador. */
export function crearServiciosCatalogoDemo() {
  const productos = productosIniciales()
  const imagenes = new Set<string>()
  /** Lo que el formulario necesita para editar (variantes con id y fotos por color), por producto. */
  const ediciones = new Map<string, ProductoEdicionDTO>()
  let consecutivo = 0
  const nuevoId = (prefijo: string) => `${prefijo}-${++consecutivo}`
  const obtenerProducto = (id: string) => {
    const producto = productos.find(item => item.idProducto === id)
    if (!producto) throw new Error('El producto no existe en esta prueba')
    return producto
  }
  const nombreOpcion = (grupo: 'categorias' | 'subcategorias' | 'marcas', id: string) => {
    const opcion = opciones[grupo].find(item => item.id === id)
    if (!opcion) throw new Error('Selecciona una opción válida')
    return opcion.nombre
  }
  const idOpcion = (grupo: 'categorias' | 'subcategorias' | 'marcas', nombre: string) =>
    opciones[grupo].find(item => item.nombre === nombre)?.id ?? ''
  const edicionDe = (producto: ProductoCatalogoDTO): ProductoEdicionDTO => {
    const guardada = ediciones.get(producto.idProducto)
    if (guardada) return guardada
    const edicion: ProductoEdicionDTO = {
      idProducto: producto.idProducto, clave: producto.clave, nombre: producto.nombre, descripcion: `${producto.nombre} (demostración)`,
      idCategoria: idOpcion('categorias', producto.categoria), categoria: producto.categoria,
      idSubcategoria: idOpcion('subcategorias', producto.subcategoria), subcategoria: producto.subcategoria,
      idMarca: idOpcion('marcas', producto.marca), marca: producto.marca, estado: producto.estado,
      variantes: producto.variantes.map(variante => ({ idVariante: nuevoId('variante'), sku: `${producto.clave}-${variante.talla}`, idTalla: null,
        talla: variante.talla, idColor: null, color: variante.color, hex: null, stock: variante.stock, conPedidos: false })),
      preciosProducto: structuredClone(producto.preciosProducto),
      imagenes: producto.img ? [{ idImagen: nuevoId('imagen'), url: producto.img, idColor: null, color: producto.variantes[0]?.color ?? null, orden: 0 }] : [],
    }
    ediciones.set(producto.idProducto, edicion)
    return edicion
  }
  /** Convierte la galería del contrato en URLs locales para la demostración. */
  const urlsDe = (imagenesDto: ImagenColorDTO[], archivos: File[], anteriores: ProductoEdicionDTO['imagenes'] = []) =>
    imagenesDto.map((imagen, orden) => {
      const previa = imagen.idImagen ? anteriores.find(item => item.idImagen === imagen.idImagen) : undefined
      let url = previa?.url ?? imagen.url ?? ''
      if (imagen.archivo !== undefined) {
        url = URL.createObjectURL(archivos[imagen.archivo]!)
        imagenes.add(url)
      }
      return { idImagen: previa?.idImagen ?? nuevoId('imagen'), url, idColor: null, color: imagen.color, orden }
    })

  const catalogoService: ICatalogoService = {
    async obtenerFiltrosDisponibles() { return structuredClone(opciones) },
    async obtenerTallasPorCategoria(idCategoria) {
      const tallas = idCategoria === 'gorras' ? ['Ajustable', 'Unitalla']
        : idCategoria === 'ropa' ? ['S', 'M', 'L', 'XL'] : idCategoria === 'tenis' ? ['25', '26', '27', '28', '29'] : []
      return tallas.map(nombre => ({ idTalla: `${idCategoria}-${nombre}`, nombre }))
    },
  }
  const productoService: IProductoService = {
    async obtenerProductos() { return structuredClone(productos) },
    async buscarProductos(filtros) {
      const texto = filtros.texto.trim().toLocaleLowerCase('es-MX')
      const filtrados = productos.filter(producto =>
        (!texto || `${producto.nombre} ${producto.clave} ${producto.marca}`.toLocaleLowerCase('es-MX').includes(texto)) &&
        (!filtros.idCategoria || producto.categoria === nombreOpcion('categorias', filtros.idCategoria)) &&
        (!filtros.idSubcategoria || producto.subcategoria === nombreOpcion('subcategorias', filtros.idSubcategoria)) &&
        (!filtros.idMarca || producto.marca === nombreOpcion('marcas', filtros.idMarca)) &&
        (!filtros.estado || producto.estado === filtros.estado))
      return structuredClone(filtrados)
    },
    async crearProducto(datos, archivos) {
      if (productos.some(producto => producto.clave.toLocaleLowerCase('es-MX') === datos.clave.toLocaleLowerCase('es-MX'))) {
        throw new Error('La clave / SKU ya existe. Utiliza una diferente.')
      }
      const categoria = nombreOpcion('categorias', datos.idCategoria)
      const subcategoria = nombreOpcion('subcategorias', datos.idSubcategoria)
      const marca = nombreOpcion('marcas', datos.idMarca)
      const idProducto = crypto.randomUUID()
      const galeria = urlsDe(datos.imagenes, archivos)
      const producto: ProductoCatalogoDTO = { idProducto, clave: datos.clave, nombre: datos.nombre, img: galeria[0]?.url ?? '', categoria, subcategoria, marca,
        estado: datos.estado, variantes: structuredClone(datos.variantes), preciosProducto: structuredClone(datos.preciosProducto) }
      productos.push(producto)
      ediciones.set(idProducto, { ...edicionDe(producto), descripcion: datos.descripcion, imagenes: galeria })
    },
    async obtenerProductoParaEditar(idProducto) {
      return structuredClone(edicionDe(obtenerProducto(idProducto)))
    },
    async editarProducto(idProducto, datos, archivos) {
      const producto = obtenerProducto(idProducto)
      if (productos.some(otro => otro.idProducto !== idProducto && otro.clave.toLocaleLowerCase('es-MX') === datos.clave.toLocaleLowerCase('es-MX'))) {
        throw Object.assign(new Error('La clave / SKU ya pertenece a otro producto.'), { statusHTTP: 409 })
      }
      const anterior = edicionDe(producto)
      const variantes = datos.variantes.map(variante => {
        const previa = variante.idVariante ? anterior.variantes.find(item => item.idVariante === variante.idVariante) : undefined
        return previa ? { ...previa, stock: variante.stock }
          : { idVariante: nuevoId('variante'), sku: `${datos.clave}-${variante.talla}`, idTalla: null, talla: variante.talla ?? '',
            idColor: null, color: variante.color ?? '', hex: null, stock: variante.stock, conPedidos: false }
      })
      const galeria = urlsDe(datos.imagenes, archivos, anterior.imagenes)
      const actualizada: ProductoEdicionDTO = { ...anterior, clave: datos.clave, nombre: datos.nombre, descripcion: datos.descripcion,
        idSubcategoria: datos.idSubcategoria, subcategoria: nombreOpcion('subcategorias', datos.idSubcategoria),
        idMarca: datos.idMarca, marca: nombreOpcion('marcas', datos.idMarca), estado: datos.estado,
        variantes, preciosProducto: structuredClone(datos.preciosProducto), imagenes: galeria }
      ediciones.set(idProducto, actualizada)
      Object.assign(producto, { clave: datos.clave, nombre: datos.nombre, img: galeria[0]?.url ?? '', subcategoria: actualizada.subcategoria,
        marca: actualizada.marca, estado: datos.estado, preciosProducto: structuredClone(datos.preciosProducto),
        variantes: variantes.map(({ talla, color, stock }) => ({ talla, color, stock })) })
      return structuredClone(actualizada)
    },
    async darDeBajaProducto(idProducto) {
      obtenerProducto(idProducto).estado = 'INACTIVO'
      return { idProducto, tipoBaja: 'INACTIVADO' }
    },
  }
  return { catalogoService, productoService, liberarImagenes() {
    for (const imagen of imagenes) URL.revokeObjectURL(imagen)
    imagenes.clear()
  } }
}
