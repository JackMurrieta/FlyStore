// pages/CatalogPage.tsx

import { ContentHeader } from "../../components/catalogo/ContentHeader/ContentHeader";
import "./store.css";

export function CatalogPage() {
  return (
    <main className="store-page">
      <ContentHeader />

      <section className="store-content">
        {/* Aquí irán los productos */}
        <h2>Productos</h2>
      </section>
    </main>
  );
}
