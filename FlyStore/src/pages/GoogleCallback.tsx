// src/pages/GoogleCallback.tsx

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';
import { isProfileComplete } from '../types';

/**
 * Componente que maneja el callback de Google OAuth
 * El backend ya estableció la cookie, ahora refrescamos la sesión
 * y redirigimos según el estado del perfil
 */
export function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading, refreshSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const hasRefreshed = useRef(false);
  const hasRedirected = useRef(false);

  // Primer useEffect: Refrescar la sesión una sola vez
  useEffect(() => {
    if (hasRefreshed.current) return;

    async function checkAndRefresh() {
      try {
        // Verificar si hay error en los parámetros de URL
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setChecking(false);
          hasRefreshed.current = true;
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        // Marcar que ya refrescamos
        hasRefreshed.current = true;

        console.log('[GoogleCallback] Refrescando sesión...');
        // Refrescar la sesión para obtener el usuario de la cookie
        await refreshSession();
      } catch (err) {
        console.error('[GoogleCallback] Error al refrescar sesión:', err);
        setError('Error al iniciar sesión con Google');
        setChecking(false);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    }

    checkAndRefresh();
  }, [searchParams, refreshSession, navigate]);

  // Segundo useEffect: Redirigir cuando tengamos el usuario
  useEffect(() => {
    // Solo proceder si ya refrescamos y no estamos cargando
    if (!hasRefreshed.current || loading || hasRedirected.current) return;

    if (isAuthenticated && user) {
      hasRedirected.current = true;

      console.log('[GoogleCallback] Usuario autenticado:', user.email);
      console.log('[GoogleCallback] Perfil completo:', isProfileComplete(user));

      setChecking(false);

      // Redirigir según el estado del perfil
      setTimeout(() => {
        if (!isProfileComplete(user)) {
          console.log('[GoogleCallback] Redirigiendo a /cuenta (perfil incompleto)');
          navigate('/cuenta', { replace: true });
        } else {
          console.log('[GoogleCallback] Redirigiendo a / (perfil completo)');
          navigate('/', { replace: true });
        }
      }, 300);
    } else if (!loading && hasRefreshed.current) {
      // Si ya refrescamos, no estamos cargando, y no hay usuario
      hasRedirected.current = true;
      console.log('[GoogleCallback] No se pudo autenticar');
      setError('No se pudo verificar la sesión. Por favor intenta nuevamente.');
      setChecking(false);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [isAuthenticated, user, loading, navigate]);

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
      ) : checking ? (
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
      ) : (
        <>
          <div style={{
            fontSize: '3rem',
            color: '#10b981'
          }}>✓</div>
          <p style={{ color: '#333' }}>Sesión verificada. Redirigiendo...</p>
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
