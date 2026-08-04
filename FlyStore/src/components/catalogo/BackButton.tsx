import ArrowIcon from "../catalogo/flechaIcon";
import "./BackButton.css";

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button className="btn-back" onClick={onClick} type="button">
      <ArrowIcon />
      Atrás
    </button>
  );
}
