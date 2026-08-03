import React from "react";
import "./HorizontalList.css"; // Asegúrate de importar el archivo de estilos

export interface HorizontalItem {
  id: string | number;
  name: string;
  icon?: string;
}

export interface HorizontalListProps {
  data: HorizontalItem[];
}

const HorizontalList: React.FC<HorizontalListProps> = ({ data }) => (
  <div className="dist-pill-bar">
    {data.map(({ id, name, icon }) => (
      <div key={id} className="dist-pill">
        {icon && <img src={icon} alt={name} className="dist-pill__icon" />}
        <span>{name}</span>
      </div>
    ))}
  </div>
);

export default HorizontalList;