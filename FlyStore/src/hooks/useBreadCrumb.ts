// hooks/useLocationBreadcrumb.ts

import { useLocation } from "react-router-dom";
import { catalogos } from "../data/catalogos";

export interface BreadcrumbItem {

  name: string;

  slug: string;

  path: string;

  isCurrent: boolean;

}

export function useBreadcrumb(): BreadcrumbItem[] {

  const { pathname } = useLocation();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const breadcrumb: BreadcrumbItem[] = [
    {
      name: "Inicio",
      slug: "",
      path: "/",
      isCurrent: segments.length === 0,
    },
  ];

  segments.forEach((segment, index) => {

    const catalogo =
      catalogos[
      segment as keyof typeof catalogos
      ];

    breadcrumb.push({

      slug: segment,

      name:
        catalogo?.nombre ??
        decodeURIComponent(segment),

      path:
        "/" +
        segments
          .slice(0, index + 1)
          .join("/"),

      isCurrent:
        index === segments.length - 1,

    });

  });

  return breadcrumb;

}
