import React from "react";

interface BackButtonProps {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  return (
    <button
      id="btn-back"
      className="btn-back"
      onClick={onClick}
      type="button"
    >
      ← Atrás
    </button>
  );
};

export default BackButton;