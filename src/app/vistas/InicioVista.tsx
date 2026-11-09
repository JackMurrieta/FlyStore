/**
 * Vista de inicio / Landing page
 * Página principal que ve el usuario al entrar al sitio
 */

import { Header } from '@compartido/layout/Header'
import { Footer } from '@compartido/layout/Footer'
import { HeroSection } from './inicio/HeroSection'
import { ProductGrid } from './inicio/ProductGrid'
import { PromoBanners } from './inicio/PromoBanners'
import styles from './InicioVista.module.css'

export default function InicioVista() {
  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        {/* Sección Hero */}
        <div className={styles.seccion}>
          <HeroSection />
        </div>

        {/* Grid de productos destacados */}
        <div className={styles.seccion}>
          <ProductGrid />
        </div>

        {/* Banners promocionales */}
        <div className={styles.seccion}>
          <PromoBanners />
        </div>
      </main>

      <Footer />
    </div>
  )
}
