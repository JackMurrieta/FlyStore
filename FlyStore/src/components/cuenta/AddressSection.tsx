import { useState, useEffect } from "react";
import type { User, DireccionDetallada } from "../../types";
import { api, handleApiError } from "../../services/apiClient";
import { parseDireccion } from "../../types/usuario.types";
import "./AddressSection.css";

interface AddressSectionProps {
  user: User;
}


export function AddressSection({ user }: AddressSectionProps) {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Estado inicial basado en los datos del usuario
  const [direccionDetallada, setDireccionDetallada] = useState<DireccionDetallada>({
    calle: "",
    entreCalle1: "",
    entreCalle2: "",
    numero: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    celular: user.telefono || ""
  });

  const [originalDireccion, setOriginalDireccion] = useState<DireccionDetallada>({
    calle: "",
    entreCalle1: "",
    entreCalle2: "",
    numero: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    celular: user.telefono || ""
  });

  const [celularTemp, setCelularTemp] = useState(user.telefono || "");

  // Intentar parsear la dirección del usuario al cargar
  useEffect(() => {
    if (user.direccion) {
      const parsed = parseDireccion(user.direccion);
      if (parsed) {
        setDireccionDetallada(parsed);
        setOriginalDireccion(parsed);
      }
    }
  }, [user.direccion]);

  const handleInputChange = (field: keyof DireccionDetallada, value: string) => {
    setDireccionDetallada(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAddress = async () => {
    try {
      // Llamar a la API del backend para actualizar la dirección
      await api.usuario.updateDireccionDetallada(direccionDetallada);
      // Actualizar el original después de guardar exitosamente
      setOriginalDireccion(direccionDetallada);
      // Actualizar el usuario en el contexto
      user.direccion = `${direccionDetallada.calle} ${direccionDetallada.numero}, ${direccionDetallada.ciudad}`;
      setIsEditingAddress(false);
      console.log("Dirección actualizada exitosamente");
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error("Error al actualizar dirección:", errorMessage);
      alert(errorMessage);
    }
  };

  const handleCancelAddress = () => {
    // Restaurar datos originales
    setDireccionDetallada(originalDireccion);
    setIsEditingAddress(false);
  };

  const handleSavePhone = async () => {
    try {
      // Llamar a la API del backend para actualizar el teléfono
      await api.usuario.updateTelefono(celularTemp);

      // Actualizar el celular en el estado local
      setDireccionDetallada(prev => ({
        ...prev,
        celular: celularTemp
      }));
      setOriginalDireccion(prev => ({
        ...prev,
        celular: celularTemp
      }));

      // Actualizar el usuario en el contexto
      user.telefono = celularTemp;

      setIsEditingPhone(false);
      console.log("Teléfono actualizado exitosamente");
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error("Error al actualizar teléfono:", errorMessage);
      alert(errorMessage);
    }
  };

  const handleCancelPhone = () => {
    setCelularTemp(direccionDetallada.celular);
    setIsEditingPhone(false);
  };

  const formatDireccionCompleta = () => {
    const parts = [];

    if (direccionDetallada.calle && direccionDetallada.numero) {
      parts.push(`${direccionDetallada.calle} ${direccionDetallada.numero}`);
    }

    if (direccionDetallada.entreCalle1 || direccionDetallada.entreCalle2) {
      const entreCalle = [direccionDetallada.entreCalle1, direccionDetallada.entreCalle2]
        .filter(Boolean)
        .join(" y ");
      if (entreCalle) parts.push(`Entre ${entreCalle}`);
    }

    if (direccionDetallada.colonia) {
      parts.push(direccionDetallada.colonia);
    }

    if (direccionDetallada.ciudad && direccionDetallada.estado) {
      parts.push(`${direccionDetallada.ciudad}, ${direccionDetallada.estado}`);
    }

    if (direccionDetallada.codigoPostal) {
      parts.push(`CP. ${direccionDetallada.codigoPostal}`);
    }

    return parts.join(", ");
  };

  const formatCelular = (celular: string) => {
    // Formato: (644) 123-4567
    if (celular.length === 10) {
      return `(${celular.slice(0, 3)}) ${celular.slice(3, 6)}-${celular.slice(6)}`;
    }
    return celular;
  };

  return (
    <>
      {/* SECCIÓN DE DIRECCIÓN */}
      <section className="address-section">
        <div className="address-content">
          <h3 className="address-label">DIRECCIÓN DE ENVÍO</h3>

          {!user.direccion && !isEditingAddress ? (
            <>
              <p className="address-text" style={{ color: 'var(--muted2)', fontStyle: 'italic' }}>
                No has agregado una dirección de envío
              </p>
              <button
                className="address-btn-edit"
                onClick={() => setIsEditingAddress(true)}
                type="button"
                aria-label="Agregar dirección"
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
                Agregar dirección
              </button>
            </>
          ) : isEditingAddress ? (
            <div className="address-edit">
              <p className="address-info-text">
                * Campos obligatorios
              </p>
              <div className="address-form">
                <div className="address-form-row">
                  <div className="address-form-group address-form-group-wide">
                    <label className="address-form-label">Calle *</label>
                    <input
                      type="text"
                      className="address-input"
                      value={direccionDetallada.calle}
                      onChange={(e) => handleInputChange("calle", e.target.value)}
                      placeholder="Nombre de la calle principal"
                      autoFocus
                    />
                  </div>
                  <div className="address-form-group address-form-group-narrow">
                    <label className="address-form-label">Número *</label>
                    <input
                      type="text"
                      className="address-input"
                      value={direccionDetallada.numero}
                      onChange={(e) => handleInputChange("numero", e.target.value)}
                      placeholder="Ej: 1823"
                    />
                  </div>
                </div>

                <div className="address-form-row">
                  <div className="address-form-group">
                    <label className="address-form-label">Entre calle 1</label>
                    <input
                      type="text"
                      className="address-input"
                      value={direccionDetallada.entreCalle1}
                      onChange={(e) => handleInputChange("entreCalle1", e.target.value)}
                      placeholder="Primera calle de referencia"
                    />
                  </div>
                  <div className="address-form-group">
                    <label className="address-form-label">Entre calle 2</label>
                    <input
                      type="text"
                      className="address-input"
                      value={direccionDetallada.entreCalle2}
                      onChange={(e) => handleInputChange("entreCalle2", e.target.value)}
                      placeholder="Segunda calle de referencia"
                    />
                  </div>
                </div>

                <div className="address-form-group">
                  <label className="address-form-label">Colonia</label>
                  <input
                    type="text"
                    className="address-input"
                    value={direccionDetallada.colonia}
                    onChange={(e) => handleInputChange("colonia", e.target.value)}
                    placeholder="Nombre de la colonia o fraccionamiento"
                  />
                </div>

                <div className="address-form-row">
                  <div className="address-form-group">
                    <label className="address-form-label">Ciudad *</label>
                    <input
                      type="text"
                      className="address-input"
                      value={direccionDetallada.ciudad}
                      onChange={(e) => handleInputChange("ciudad", e.target.value)}
                      placeholder="Ej: Cd. Obregón"
                    />
                  </div>
                  <div className="address-form-group">
                    <label className="address-form-label">Estado *</label>
                    <input
                      type="text"
                      className="address-input"
                      value={direccionDetallada.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      placeholder="Ej: Sonora"
                    />
                  </div>
                </div>

                <div className="address-form-group address-form-group-small">
                  <label className="address-form-label">Código Postal *</label>
                  <input
                    type="text"
                    className="address-input"
                    value={direccionDetallada.codigoPostal}
                    onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                    placeholder="Ej: 85120"
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="address-actions">
                <button
                  className="address-btn address-btn-save"
                  onClick={handleSaveAddress}
                  type="button"
                >
                  Guardar
                </button>
                <button
                  className="address-btn address-btn-cancel"
                  onClick={handleCancelAddress}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="address-display">
                <p className="address-text">
                  {formatDireccionCompleta() || user.direccion || "Sin dirección"}
                </p>
              </div>
              <button
                className="address-btn-edit"
                onClick={() => setIsEditingAddress(true)}
                type="button"
                aria-label="Editar dirección"
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
                Editar dirección
              </button>
            </>
          )}
        </div>
      </section>

      {/* SECCIÓN DE TELÉFONO */}
      <section className="address-section">
        <div className="address-content">
          <h3 className="address-label">NÚMERO DE CONTACTO</h3>

          {!user.telefono && !isEditingPhone ? (
            <>
              <p className="address-text" style={{ color: 'var(--muted2)', fontStyle: 'italic' }}>
                No has agregado un número de contacto
              </p>
              <button
                className="address-btn-edit"
                onClick={() => setIsEditingPhone(true)}
                type="button"
                aria-label="Agregar teléfono"
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
                Agregar teléfono
              </button>
            </>
          ) : isEditingPhone ? (
            <div className="address-edit">
              <div className="address-form">
                <div className="address-form-group address-form-group-small">
                  <label className="address-form-label">Número de Celular *</label>
                  <input
                    type="tel"
                    className="address-input"
                    value={celularTemp}
                    onChange={(e) => setCelularTemp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ej: 6441234567 (10 dígitos)"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              <div className="address-actions">
                <button
                  className="address-btn address-btn-save"
                  onClick={handleSavePhone}
                  type="button"
                >
                  Guardar
                </button>
                <button
                  className="address-btn address-btn-cancel"
                  onClick={handleCancelPhone}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="address-display">
                <p className="address-phone">
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {direccionDetallada.celular ? formatCelular(direccionDetallada.celular) : user.telefono || "Sin teléfono"}
                </p>
              </div>
              <button
                className="address-btn-edit"
                onClick={() => setIsEditingPhone(true)}
                type="button"
                aria-label="Editar teléfono"
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
                Editar teléfono
              </button>
            </>
          )}
        </div>
      </section>
    </>
  );
}
