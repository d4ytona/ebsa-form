/**
 * @fileoverview Configuración del cliente de Supabase para autenticación y backend.
 * Inicializa la conexión con Supabase usando variables de entorno.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * URL del proyecto de Supabase desde las variables de entorno.
 * @type {string}
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

/**
 * Clave anónima (pública) de Supabase desde las variables de entorno.
 * @type {string}
 */
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Cliente de Supabase configurado para la aplicación.
 * Proporciona acceso a autenticación y base de datos.
 * @constant
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)