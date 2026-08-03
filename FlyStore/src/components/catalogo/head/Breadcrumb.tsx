import { Link } from 'react-router-dom'
import { useLocationBreadcrumb } from "../../../hooks/useLocationBreadCrumb";

export function Breadcrumb() {
  const items = useLocationBreadcrumb()

  return (
    <nav aria-label="breadcrumb">
      {items.map((item, index) => (
        <span key={item.path}>
          {index !== 0 && ' / '}

          {index === items.length - 1 ? (
            <span>{item.name}</span>
          ) : (
            <Link to={item.path}>{item.name}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}