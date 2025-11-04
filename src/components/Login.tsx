/**
 * @fileoverview Componente de autenticación para el sistema EBSA Form.
 * Proporciona la interfaz de inicio de sesión utilizando Supabase Auth.
 */

import { useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * @component Login
 *
 * Componente de autenticación que permite a los usuarios iniciar sesión
 * en la aplicación EBSA Form mediante credenciales de email y contraseña.
 *
 * @description
 * Este componente maneja el proceso completo de autenticación:
 * - Captura de credenciales del usuario (email y password)
 * - Validación mediante Supabase Authentication
 * - Manejo de estados de carga durante la autenticación
 * - Gestión y visualización de errores de autenticación
 * - La sesión autenticada es detectada automáticamente por el hook useAuth
 *
 * Estados que maneja:
 * - email: Dirección de correo electrónico del usuario
 * - password: Contraseña del usuario
 * - loading: Indicador de proceso de autenticación en curso
 * - error: Mensaje de error si la autenticación falla
 *
 * Interacción con API:
 * - Utiliza Supabase Auth para autenticación mediante signInWithPassword
 * - En caso de éxito, el usuario es autenticado automáticamente
 * - En caso de error, se muestra el mensaje de error correspondiente
 *
 * Navegación:
 * - No maneja navegación directamente
 * - El hook useAuth en App.tsx detecta cambios de sesión y redirige automáticamente
 *
 * @returns {JSX.Element} Interfaz de inicio de sesión con formulario de credenciales
 *
 * @example
 * // Uso básico en App.tsx
 * import { Login } from './components/Login';
 *
 * function App() {
 *   const { user } = useAuth();
 *
 *   if (!user) {
 *     return <Login />;
 *   }
 *
 *   return <Form user={user} />;
 * }
 */
export function Login() {
  // Estados para guardar email/codigo y password
  const [emailOrCode, setEmailOrCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Función que se ejecuta al hacer clic en "Login"
  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      let emailToLogin = emailOrCode;

      // Si el input es numérico, buscar el email correspondiente en equipos
      const isNumericCode = /^\d+$/.test(emailOrCode.trim());

      if (isNumericCode) {
        console.log('🔍 Buscando email para código:', emailOrCode);

        const { data: equipo, error: queryError } = await supabase
          .from('equipos')
          .select('email')
          .eq('codigo_usuario', emailOrCode.trim())
          .single();

        console.log('📊 Resultado de búsqueda:', { equipo, queryError });

        if (queryError) {
          console.error('❌ Error en query:', queryError);
          setLoading(false);
          setError(`Error al buscar código: ${queryError.message}`);
          return;
        }

        if (!equipo) {
          setLoading(false);
          setError('Código de usuario no válido');
          return;
        }

        emailToLogin = equipo.email;
        console.log('✅ Email encontrado:', emailToLogin);
      }

      // Llamada a Supabase para hacer login con el email
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: password,
      });

      setLoading(false);

      if (loginError) {
        setError(loginError.message);
      }
      // Si no hay error, el hook useAuth detectará automáticamente el cambio
    } catch (err) {
      setLoading(false);
      setError('Error al iniciar sesión');
      console.error('Error en login:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login EBSA</h1>

        {/* Input de Email o Código */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email o Código de Usuario</label>
          <input
            type="text"
            value={emailOrCode}
            onChange={(e) => setEmailOrCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="tu@email.com o 100103"
          />
        </div>

        {/* Input de Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="********"
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Botón de Login */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </div>
    </div>
  );
}
