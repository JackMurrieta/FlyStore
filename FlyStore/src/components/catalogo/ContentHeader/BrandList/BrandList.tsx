import { useCurrentCatalog } from "../../../../hooks/useCurrentCatalog";

import "./BrandList.css";

export function BrandList() {
  const catalog = useCurrentCatalog();

  if (!catalog) return null;

  return (
    <div className="brand-list">
      {catalog.marcas.map((brand) => (
        <button key={brand.id} className="brand-list__item" type="button">
          <img
            src={brand.icon}
            alt={brand.nombre}
            className="brand-list__icon"
          />

          <span className="brand-list__name">{brand.nombre}</span>
        </button>
      ))}
    </div>
  );
}