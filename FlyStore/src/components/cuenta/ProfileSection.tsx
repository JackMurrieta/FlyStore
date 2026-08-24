import { useState } from "react";
import type { User } from "../../types";
import { api, handleApiError } from "../../services/apiClient";
import "./ProfileSection.css";

interface ProfileSectionProps {
  user: User;
}

// Función para generar color basado en la inicial
function getColorFromInitial(initial: string): string {
  const colors = [
    "#ef4444", // red
    "#f59e0b", // orange
    "#10b981", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange-2
  ];

  const charCode = initial.toUpperCase().charCodeAt(0);
  const index = charCode % colors.length;
  return colors[index];
}

// Función para obtener la inicial del nombre
function getInitial(nombre: string): string {
  return nombre.trim()[0]?.toUpperCase() || "?";
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(user.nombre || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initial = getInitial(user.nombre || "Usuario");
  const avatarColor = getColorFromInitial(initial);

  const handleSave = async () => {
    if (!nombre.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.usuario.updateNombre(nombre.trim());
      // Actualizar el usuario en el contexto
      user.nombre = nombre.trim();
      setIsEditing(false);
      console.log("Nombre actualizado exitosamente");
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error("Error al actualizar nombre:", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNombre(user.nombre || "");
    setIsEditing(false);
    setError("");
  };

  return (
    <section className="profile-section">
      {/* Avatar */}
      <div className="profile-avatar" style={{ backgroundColor: avatarColor }}>
        {initial}
      </div>

      {/* Información del usuario */}
      <div className="profile-info">
        {isEditing ? (
          <div className="profile-edit">
            {error && <p className="profile-error">{error}</p>}
            <input
              type="text"
              className="profile-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              autoFocus
              disabled={submitting}
            />
            <div className="profile-actions">
              <button
                className="profile-btn profile-btn-save"
                onClick={handleSave}
                type="button"
                disabled={submitting}
              >
                {submitting ? "Guardando..." : "Guardar"}
              </button>
              <button
                className="profile-btn profile-btn-cancel"
                onClick={handleCancel}
                type="button"
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="profile-name">{user.nombre || "Sin nombre"}</h2>
            <p className="profile-email">{user.email}</p>
            <button
              className="profile-btn-edit"
              onClick={() => setIsEditing(true)}
              type="button"
              aria-label="Editar nombre"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar nombre
            </button>
          </>
        )}
      </div>
    </section>
  );
}
