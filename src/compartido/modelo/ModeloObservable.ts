/**
 * Clase base para modelos con estado observable
 * Patrón Observer para suscripción de cambios
 *
 * Los hooks de React se suscriben con useSyncExternalStore
 */

export abstract class ModeloObservable<E> {
  private readonly oyentes = new Set<() => void>()
  private estado: E

  protected constructor(estadoInicial: E) {
    this.estado = estadoInicial
  }

  /**
   * Suscribe un oyente a cambios de estado
   * Devuelve función para desuscribirse
   */
  public readonly suscribir = (oyente: () => void): (() => void) => {
    this.oyentes.add(oyente)
    return () => {
      this.oyentes.delete(oyente)
    }
  }

  /**
   * Obtiene el estado actual (inmutable)
   */
  public readonly obtenerEstado = (): E => this.estado

  /**
   * Actualiza el estado y notifica a los oyentes
   * Crea un nuevo objeto (inmutabilidad)
   */
  protected actualizar(cambios: Partial<E>): void {
    this.estado = { ...this.estado, ...cambios }
    this.notificar()
  }

  /**
   * Reemplaza completamente el estado
   */
  protected establecer(nuevoEstado: E): void {
    this.estado = nuevoEstado
    this.notificar()
  }

  /**
   * Notifica a todos los oyentes suscritos
   */
  private notificar(): void {
    this.oyentes.forEach((oyente) => oyente())
  }
}
