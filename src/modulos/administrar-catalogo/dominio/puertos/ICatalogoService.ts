import type { OpcionesCatalogoDTO } from '../../aplicacion/dto/OpcionesCatalogoDTO'
import type { TallaDTO } from '../../aplicacion/dto/TallaDTO'

export interface ICatalogoService {
  obtenerFiltrosDisponibles(): Promise<OpcionesCatalogoDTO>
  obtenerTallasPorCategoria(idCategoria: string): Promise<TallaDTO[]>
}
