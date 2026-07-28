import './CategoryCard.css'

export interface CategoryCardProps {
  id: string
  name: string
  namePrefix: string
  desc: string
  accent: string
  icon: React.ReactNode
}

export function CategoryCard({ id, namePrefix, name, desc, accent, icon }: CategoryCardProps) {
  return (
    <article className={`cat-card cat-card--${id}`} style={{ '--cat-accent': accent } as React.CSSProperties}>
      <div className="cat-card-glow" aria-hidden="true" />
      <div className="cat-card-ico" aria-hidden="true">{icon}</div>
      <div className="cat-card-body">
        <p className="cat-card-prefix">{namePrefix}</p>
        <h3 className="cat-card-name">{name}</h3>
        <p className="cat-card-desc">{desc}</p>
      </div>
      <div className="cat-card-arrow" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7h10M8 3l4 4-4 4" />
        </svg>
      </div>
    </article>
  )
}
