// src/pages/GoogleCallback.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient';
import { isProfileComplete } from '../types';

/**
 * Componente que maneja el callback de Google OAuth
 * Después de que el usuario se autentica con Google,
 * verifica su sesión y lo redirige según el estado de su perfil
 */
export function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleGoogleCallback() {
      try {
        // Obtener la sesión actual (el backend ya debe haber establecido la cookie)
        const session = await api.auth.getSession();

        if (session.user) {
          // Verificar si el perfil está completo
          if (!isProfileComplete(session.user)) {
            // Perfil incompleto → redirigir a /cuenta
            navigate('/cuenta', { replace: true });
          } else {
            // Perfil completo → redirigir a inicio
            navigate('/', { replace: true });
          }
        } else {
          // No hay sesión, redirigir a login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error al verificar sesión de Google:', error);
        // En caso de error, redirigir a login
        navigate('/login', { replace: true });
      }
    }

    handleGoogleCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner" style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }} />
      <p>Verificando tu cuenta...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
