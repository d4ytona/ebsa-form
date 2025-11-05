/**
 * @fileoverview Funciones de consulta a Supabase para todas las tablas.
 * Todas las funciones retornan datos en minúsculas y usan las vistas *_active para excluir soft-deleted.
 */

import { supabase } from './supabase'

// =============================================
// TIPOS
// =============================================

export interface Region {
  id: string // numero_region (i, ii, iii, etc.)
  nombre: string
}

export interface Comuna {
  id: number
  nombre: string
  region_id: string
}

export interface ComunaConRegion {
  id: number
  comuna: string
  region_id: string
  region: string
}

export interface CodigoVendedor {
  id: number
  codigo: string
  activo: boolean
}

export interface Equipo {
  id: number
  email: string
  nombre_equipo: string
  supervisor: string
  activo: boolean
}

export interface Vendedor {
  id: number
  nombre: string
  email: string | null
  telefono: string | null
  tipo: 'honorario' | 'contratado'
  equipo_id: number
  activo: boolean
}

export interface VendedorConEquipo {
  id: number
  nombre: string
  email: string | null
  telefono: string | null
  tipo: 'honorario' | 'contratado'
  equipo_id: number
  equipo_email: string
  nombre_equipo: string
  supervisor: string
}

export interface Plan {
  id: number
  nombre: string
  marca: 'vtr' | 'claro'
  segmento: 'residencial' | 'negocio' | 'convenio'
  categoria: '1_rgu' | '2_rgu' | '3_rgu' | 'paquetizacion'
  precio: number
  descuento_nacional: number | null
  descuento_especial: number | null
  duracion: string
  rgu: number
  internet_activo: boolean
  internet_velocidad: '500mb' | '600mb' | '800mb' | '940mb' | null
  television_activa: boolean
  television_plan: 'inicia' | 'plus' | 'premium' | null
  telefonia_activa: boolean
  disponible: boolean
}

export interface ProductoAdicional {
  id: number
  nombre: string
  categoria: 'decodificadores' | 'extensores' | 'canales' | 'descuentos'
  precio: number
  descuento: number
  disponible: boolean
}

export interface TramoHorario {
  id: string // 'a', 'b', 'c'
  inicio: string
  fin: string
}

export interface Feriado {
  id: number
  fecha: string
  nombre: string | null
}

export interface TipoCampana {
  id: string
  nombre: string
}

// =============================================
// QUERIES - REGIONES Y COMUNAS
// =============================================

/**
 * Obtiene todas las regiones activas ordenadas por número romano
 */
export async function getRegiones(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regiones_active')
    .select('id, nombre')
    .order('id')

  if (error) throw error
  return data || []
}

/**
 * Obtiene todas las comunas activas de una región específica
 */
export async function getComunasByRegion(regionId: string): Promise<Comuna[]> {
  const { data, error } = await supabase
    .from('comunas_active')
    .select('id, nombre, region_id')
    .eq('region_id', regionId)
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Obtiene todas las comunas con información de su región
 */
export async function getComunasConRegion(): Promise<ComunaConRegion[]> {
  const { data, error } = await supabase
    .from('comunas_con_region')
    .select('*')
    .order('region_id, comuna')

  if (error) throw error
  return data || []
}

// =============================================
// QUERIES - CÓDIGOS DE VENDEDOR
// =============================================

/**
 * Obtiene todos los códigos de vendedor activos (EBSA)
 */
export async function getCodigos(): Promise<CodigoVendedor[]> {
  const { data, error } = await supabase
    .from('codigos_vendedor_active')
    .select('*')
    .order('codigo')

  if (error) throw error
  return data || []
}

/**
 * Obtiene todos los códigos activos (alias para compatibilidad)
 */
export async function getAllCodigos(): Promise<CodigoVendedor[]> {
  return getCodigos()
}

// =============================================
// QUERIES - EQUIPOS Y VENDEDORES
// =============================================

/**
 * Obtiene todos los equipos activos
 */
export async function getEquipos(): Promise<Equipo[]> {
  const { data, error } = await supabase
    .from('equipos_active')
    .select('*')
    .order('nombre_equipo')

  if (error) throw error
  return data || []
}

/**
 * Obtiene vendedores activos por equipo
 */
export async function getVendedoresByEquipo(equipoId: number): Promise<Vendedor[]> {
  const { data, error } = await supabase
    .from('vendedores_active')
    .select('*')
    .eq('equipo_id', equipoId)
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Obtiene todos los vendedores con información de su equipo
 */
export async function getVendedoresConEquipo(): Promise<VendedorConEquipo[]> {
  const { data, error } = await supabase
    .from('vendedores_con_equipo_active')
    .select('*')
    .order('nombre_equipo, nombre')

  if (error) throw error
  return data || []
}

// =============================================
// QUERIES - PLANES
// =============================================

/**
 * Obtiene planes activos por marca y segmento
 */
export async function getPlanes(
  marca: 'vtr' | 'claro',
  segmento: 'residencial' | 'negocio' | 'convenio'
): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('planes_active')
    .select('*')
    .eq('marca', marca)
    .eq('segmento', segmento)
    .order('categoria, rgu, precio')

  if (error) throw error
  return data || []
}

/**
 * Obtiene planes activos por categoría
 */
export async function getPlanesByCategoria(
  marca: 'vtr' | 'claro',
  segmento: 'residencial' | 'negocio' | 'convenio',
  categoria: '1_rgu' | '2_rgu' | '3_rgu' | 'paquetizacion'
): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('planes_active')
    .select('*')
    .eq('marca', marca)
    .eq('segmento', segmento)
    .eq('categoria', categoria)
    .order('precio')

  if (error) throw error
  return data || []
}

// =============================================
// QUERIES - PRODUCTOS ADICIONALES
// =============================================

/**
 * Obtiene productos adicionales activos por categoría
 */
export async function getProductosAdicionalesByCategoria(
  categoria: 'decodificadores' | 'extensores' | 'canales' | 'descuentos'
): Promise<ProductoAdicional[]> {
  const { data, error } = await supabase
    .from('productos_adicionales_active')
    .select('*')
    .eq('categoria', categoria)
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Obtiene todos los productos adicionales activos
 */
export async function getAllProductosAdicionales(): Promise<ProductoAdicional[]> {
  const { data, error } = await supabase
    .from('productos_adicionales_active')
    .select('*')
    .order('categoria, nombre')

  if (error) throw error
  return data || []
}

// =============================================
// QUERIES - CONFIGURACIÓN
// =============================================

/**
 * Obtiene todos los tramos horarios activos
 */
export async function getTramosHorarios(): Promise<TramoHorario[]> {
  const { data, error } = await supabase
    .from('tramos_horarios_active')
    .select('*')
    .order('id')

  if (error) throw error
  return data || []
}

/**
 * Obtiene feriados activos del año actual
 */
export async function getFeriados(year?: number): Promise<Feriado[]> {
  const currentYear = year || new Date().getFullYear()
  const startDate = `${currentYear}-01-01`
  const endDate = `${currentYear}-12-31`

  const { data, error } = await supabase
    .from('feriados_active')
    .select('*')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .order('fecha')

  if (error) throw error
  return data || []
}

/**
 * Verifica si una fecha es feriado
 */
export async function isFeriado(fecha: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('feriados_active')
    .select('id')
    .eq('fecha', fecha)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return !!data
}

/**
 * Obtiene todos los tipos de campaña desde el ENUM de PostgreSQL
 * NOTA: tipo_campana es un tipo ENUM en PostgreSQL, no una tabla
 * Esta función extrae dinámicamente todos los valores del ENUM
 */
export async function getTiposCampana(): Promise<TipoCampana[]> {
  try {
    // Query para obtener todos los valores del ENUM tipo_campana
    const { data, error } = await supabase.rpc('get_enum_values', {
      enum_name: 'tipo_campana'
    })

    if (error) {
      console.error('Error obteniendo tipos de campaña:', error)
      // Fallback a valores por defecto si falla el RPC
      return [
        { id: 'terreno', nombre: 'Terreno' },
        { id: 'contacto', nombre: 'Contacto' },
        { id: 'publicidad', nombre: 'Publicidad' }
      ]
    }

    // Convertir los valores del ENUM a formato { id, nombre }
    // Capitalizar primera letra para el nombre
    return (data || []).map((valor: string) => ({
      id: valor,
      nombre: valor.charAt(0).toUpperCase() + valor.slice(1)
    }))
  } catch (error) {
    console.error('Error en getTiposCampana:', error)
    // Fallback en caso de error
    return [
      { id: 'terreno', nombre: 'Terreno' },
      { id: 'contacto', nombre: 'Contacto' },
      { id: 'publicidad', nombre: 'Publicidad' }
    ]
  }
}

// =============================================
// UTILIDADES DE FORMATO
// =============================================

/**
 * Convierte texto a minúsculas para insertar en DB
 */
export function toDBFormat(text: string): string {
  return text.toLowerCase().trim()
}

/**
 * Capitaliza primera letra de cada palabra para mostrar en UI
 */
export function toDisplayFormat(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Formatea número romano para mostrar en UI
 */
export function formatNumeroRomano(numeroRomano: string): string {
  return numeroRomano.toUpperCase()
}

// =============================================
// PEDIDOS
// =============================================

/**
 * Obtiene todos los pedidos realizados por un equipo (basado en email del usuario).
 * Retorna los pedidos ordenados por fecha de creación descendente.
 * Útil para reingresos: permite buscar clientes anteriores por RUT y dirección.
 *
 * @param userEmail - Email del usuario del equipo
 * @returns Array de pedidos del equipo con todos sus datos
 */
export async function getPedidosPorEquipo(userEmail: string): Promise<any[]> {
  try {
    // Primero obtener el nombre del equipo del usuario
    const { data: equipos, error: equipoError } = await supabase
      .from('equipos_active')
      .select('nombre_equipo')
      .eq('email', userEmail.toLowerCase())
      .limit(1)

    if (equipoError) throw equipoError
    if (!equipos || equipos.length === 0) return []

    const nombreEquipo = equipos[0].nombre_equipo

    // Obtener todos los pedidos del equipo (campo 'equipo' es string con nombre)
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('equipo', nombreEquipo)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error obteniendo pedidos del equipo:', error)
    throw error
  }
}
