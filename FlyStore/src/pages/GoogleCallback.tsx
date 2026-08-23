// src/pages/GoogleCallback.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/apiClient';
import { isProfileComplete } from '../types';

/**
 * Componente que maneja el callback de Google OAuth
 * El backend ya estableció la cookie, solo necesitamos verificar la sesión
 * y redirigir al usuario según el estado de su perfil
 */
export function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleGoogleCallback() {
      try {
        // Verificar si hay error en los parámetros de URL
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        // Pequeña espera para asegurar que la cookie se haya establecido
        await new Promise(resolve => setTimeout(resolve, 500));

        // Obtener la sesión actual (el backend ya estableció la cookie)
        const session = await api.auth.getSession();

        if (session.user) {
          console.log('[GoogleCallback] Sesión obtenida, usuario:', session.user.email);
          console.log('[GoogleCallback] Perfil completo:', isProfileComplete(session.user));

          // Verificar si el perfil está completo
          if (!isProfileComplete(session.user)) {
            // Perfil incompleto → redirigir a /cuenta
            console.log('[GoogleCallback] Redirigiendo a /cuenta (perfil incompleto)');
            navigate('/cuenta', { replace: true });
          } else {
            // Perfil completo → redirigir a inicio
            console.log('[GoogleCallback] Redirigiendo a / (perfil completo)');
            navigate('/', { replace: true });
          }
        } else {
          console.log('[GoogleCallback] No hay sesión, redirigiendo a login');
          // No hay sesión, redirigir a login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error al verificar sesión de Google:', error);
        setError('Error al iniciar sesión con Google');
        // En caso de error, redirigir a login después de 3 segundos
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    }

    handleGoogleCallback();
  }, [navigate, searchParams]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      {error ? (
        <>
          <div style={{
            fontSize: '3rem',
            color: '#e74c3c'
          }}>⚠️</div>
          <h2 style={{ color: '#e74c3c' }}>Error de Autenticación</h2>
          <p style={{ color: '#666', maxWidth: '400px' }}>{error}</p>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Redirigiendo al login...</p>
        </>
      ) : (
        <>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#333' }}>Verificando tu cuenta con Google...</p>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Un momento por favor...</p>
        </>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
