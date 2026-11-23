import type { HttpClient } from '@infraestructura/http/HttpClient'
import { catalogoAdmin, pedidos } from '@infraestructura/http/endpoints'
import type { PaginaProductosResumenDTO, PedidoPorConfirmarDTO } from '../aplicacion/dto/ResumenTiendaDTO'
import type { EstadoProductoContado, IResumenTiendaGateway } from '../dominio/puertos/IResumenTiendaGateway'

export class ResumenTiendaHttpGateway implements IResumenTiendaGateway {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  obtenerPagosPorConfirmar(): Promise<PedidoPorConfirmarDTO[]> {
    return this.http.get<PedidoPorConfirmarDTO[]>(pedidos.porConfirmar())
  }

  obtenerProductosPorEstado(estado: EstadoProductoContado, tamano: number): Promise<PaginaProductosResumenDTO> {
    const url = catalogoAdmin.buscarProductos({ texto: '', idCategoria: '', idSubcategoria: '', idMarca: '', estado })
    return this.http.get<PaginaProductosResumenDTO>(`${url}&pagina=0&tamano=${tamano}`)
  }
}
