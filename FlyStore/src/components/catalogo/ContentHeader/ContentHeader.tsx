import { HeaderNavigation } from "./HeaderNavigation/HeaderNavigation";
import { CatalogHero } from "./CatalogHero/CatalogHero";
import { BrandList } from "./BrandList/BrandList";

import "./ContentHeader.css";

export function ContentHeader() {
  return (
    <section className="content-header">

      <HeaderNavigation />

      <CatalogHero />

      <BrandList />

    </section>
  );
}