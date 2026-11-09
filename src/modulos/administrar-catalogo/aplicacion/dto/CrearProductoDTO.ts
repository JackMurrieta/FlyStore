export interface CrearProductoDTO {
  clave: string;
  nombre: string;
  descripcion: string;
  idCategoria: string;
  idSubcategoria: string;
  idMarca: string;
  imagenes: File;
  estado: string;
}