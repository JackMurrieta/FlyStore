import type { ICatalogoService, IProductoService } from '@modulos/administrar-catalogo'
import type { ProductoCatalogoDTO } from '@modulos/administrar-catalogo/aplicacion/dto/ProductoCatalogoDTO'
import type { OpcionesCatalogoDTO } from '@modulos/administrar-catalogo/aplicacion/dto/OpcionesCatalogoDTO'

const opciones: OpcionesCatalogoDTO = {
  categorias: [{ id: 'gorras', nombre: 'FlyCaps' }, { id: 'ropa', nombre: 'FlyClothes' }, { id: 'tenis', nombre: 'FlyShoes' }],
  subcategorias: [{ id: 'gorra', nombre: 'Gorra' }, { id: 'playera', nombre: 'Playera' }, { id: 'deportivo', nombre: 'Deportivo' }],
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
  const obtenerProducto = (id: string) => {
    const producto = productos.find(item => item.idProducto === id)
    if (!producto) throw new Error('El producto no existe en esta prueba')
    return producto
  }
  const nombreOpcion = (grupo: keyof OpcionesCatalogoDTO, id: string) => {
    const opcion = opciones[grupo].find(item => item.id === id)
    if (!opcion) throw new Error('Selecciona una opción válida')
    return opcion.nombre
  }

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
      return structuredClone(productos.filter(producto =>
        (!texto || `${producto.nombre} ${producto.clave} ${producto.marca}`.toLocaleLowerCase('es-MX').includes(texto)) &&
        (!filtros.idCategoria || producto.categoria === nombreOpcion('categorias', filtros.idCategoria)) &&
        (!filtros.idSubcategoria || producto.subcategoria === nombreOpcion('subcategorias', filtros.idSubcategoria)) &&
        (!filtros.idMarca || producto.marca === nombreOpcion('marcas', filtros.idMarca)) &&
        (!filtros.estado || producto.estado === filtros.estado)))
    },
    async crearProducto(datos) {
      if (productos.some(producto => producto.clave.toLocaleLowerCase('es-MX') === datos.clave.toLocaleLowerCase('es-MX'))) {
        throw new Error('La clave / SKU ya existe. Utiliza una diferente.')
      }
      const categoria = nombreOpcion('categorias', datos.idCategoria)
      const subcategoria = nombreOpcion('subcategorias', datos.idSubcategoria)
      const marca = nombreOpcion('marcas', datos.idMarca)
      const idProducto = crypto.randomUUID()
      const img = URL.createObjectURL(datos.imagenes)
      imagenes.add(img)
      productos.push({ idProducto, clave: datos.clave, nombre: datos.nombre, img, categoria, subcategoria, marca,
        estado: datos.estado, variantes: [], preciosProducto: [] })
      return { idProducto, clave: datos.clave }
    },
    async agregarVariante(idProducto, variante) {
      obtenerProducto(idProducto).variantes.push(structuredClone(variante))
    },
    async crearPrecios(idProducto, datos) {
      obtenerProducto(idProducto).preciosProducto = structuredClone(datos.preciosProducto)
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
