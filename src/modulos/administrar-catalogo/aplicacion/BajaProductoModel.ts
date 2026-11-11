import type { IProductoService } from '../dominio/puertos/IProductoService'
import { TipoBaja } from '../dominio/TipoBaja'
import type { ResultadoBajaTs } from '../dominio/ResultadoBajaTs'

export class BajaProductoModel {
  private readonly productoService: IProductoService
  constructor(productoService: IProductoService) { this.productoService = productoService }

  async darDeBaja(idProducto: string): Promise<ResultadoBajaTs> {
    const dto = await this.productoService.darDeBajaProducto(idProducto)
    const tipoBaja = Object.values(TipoBaja).find(valor => valor === dto.tipoBaja)
    if (!tipoBaja) throw new Error('Resultado de baja desconocido')
    return { idProducto: dto.idProducto, tipoBaja }
  }
}
