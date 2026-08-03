import { Link } from "react-router-dom";

import { useBreadcrumb } from "../../../../hooks/useBreadCrumb"

export function Breadcrumb() {
  const breadcrumb = useBreadcrumb();

  return (
    <nav className="header-navigation__breadcrumb" aria-label="Breadcrumb">
      {breadcrumb.map((item, index) => (
        <div key={item.path} className="header-navigation__item">
          {index > 0 && <span className="header-navigation__separator">/</span>}

          {item.isCurrent ? (
            <span className="header-navigation__current">{item.name}</span>
          ) : (
            <Link to={item.path} className="header-navigation__link">
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
