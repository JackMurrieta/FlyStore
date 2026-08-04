import { useCurrentCatalog } from "../../../../hooks/useCurrentCatalog";

import "./CatalogHero.css";

export function CatalogHero() {
  const catalog = useCurrentCatalog();

  if (!catalog) return null;

  return (
    <section className="catalog-hero">
      <div className="catalog-hero__main">
        <p className="catalog-hero__title">{catalog.mainText}</p>
      </div>

      <div className="catalog-hero__description">
        <p>{catalog.descripcion}</p>
      </div>
    </section>
  );
}
