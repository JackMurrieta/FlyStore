import type { HttpClient } from '@infraestructura/http/HttpClient'
import { catalogoAdmin } from '@infraestructura/http/endpoints'
import type { ICatalogoService } from '../dominio/puertos/ICatalogoService'
import type { OpcionesCatalogoDTO } from '../aplicacion/dto/OpcionesCatalogoDTO'
import type { TallaDTO } from '../aplicacion/dto/TallaDTO'
export class CatalogoService implements ICatalogoService {
 private readonly http: HttpClient
 constructor(http: HttpClient) { this.http = http }
 obtenerFiltrosDisponibles(): Promise<OpcionesCatalogoDTO> { return this.http.get(catalogoAdmin.filtros()) }
 obtenerTallasPorCategoria(id: string): Promise<TallaDTO[]> { return this.http.get(catalogoAdmin.tallas(id)) }
}
