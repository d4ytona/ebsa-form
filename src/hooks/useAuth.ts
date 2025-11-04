/**
 * @fileoverview Hook personalizado para manejar la autenticación de usuarios con Supabase.
 */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

/**
 * Hook para gestionar el estado de autenticación del usuario.
 * Proporciona el usuario actual, estado de carga y función para cerrar sesión.
 *
 * @returns {Object} Objeto con propiedades de autenticación
 * @returns {User | null} returns.user - Usuario autenticado o null si no hay sesión
 * @returns {boolean} returns.loading - true mientras se verifica la sesión inicial
 * @returns {Function} returns.signOut - Función asíncrona para cerrar la sesión
 *
 * @example
 * const { user, loading, signOut } = useAuth()
 *
 * if (loading) return <div>Cargando...</div>
 * if (!user) return <Login />
 *
 * return <div>Bienvenido {user.email}</div>
 */
export function useAuth() {
  /**
   * Estado del usuario autenticado.
   * @type {[User | null, Function]}
   */
  const [user, setUser] = useState<User | null>(null)

  /**
   * Estado de carga durante la verificación inicial de sesión.
   * @type {[boolean, Function]}
   */
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Verificar si hay una sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Escuchar cambios en la autenticación (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // 3. Cleanup: dejar de escuchar cuando el componente se desmonte
    return () => subscription.unsubscribe()
  }, [])

  /**
   * Cierra la sesión del usuario actual.
   * @async
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}
