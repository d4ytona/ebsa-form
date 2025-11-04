/**
 * @fileoverview Componente raíz de la aplicación EBSA Form.
 * Gestiona la autenticación y el enrutamiento principal de la aplicación.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'
import { Form } from './components/Form'
import { Confirmacion } from './components/Confirmacion'

/**
 * Componente principal de la aplicación.
 * Implementa autenticación con Supabase y enrutamiento protegido.
 *
 * @component
 * @returns {JSX.Element} Aplicación con rutas protegidas por autenticación
 *
 * @description
 * - Verifica el estado de autenticación usando el hook useAuth
 * - Muestra pantalla de carga durante la verificación inicial
 * - Redirige a Login si no hay usuario autenticado
 * - Proporciona rutas protegidas para usuarios autenticados:
 *   - / : Formulario principal
 *   - /confirmacion : Página de confirmación de envío
 *
 * @example
 * // En main.tsx
 * <App />
 */
function App() {
  const { user, loading, signOut } = useAuth()

  // Mientras carga, mostrar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  // Si no hay usuario, mostrar login en todas las rutas
  if (!user) {
    return <Login />
  }

  // Si hay usuario logueado, mostrar las rutas protegidas
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Form user={user} onSignOut={signOut} />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
