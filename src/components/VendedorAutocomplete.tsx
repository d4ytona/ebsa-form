/**
 * @fileoverview Componente de autocomplete para seleccionar vendedores.
 * Filtra y muestra vendedores según el email del usuario autenticado.
 * Datos obtenidos desde Supabase.
 */

import { useState, useEffect } from 'react'
import { getEquipos, getVendedoresByEquipo, toDisplayFormat, type Equipo, type Vendedor } from '../lib/supabaseQueries'

/**
 * Props para el componente VendedorAutocomplete.
 * @interface VendedorAutocompleteProps
 */
interface VendedorAutocompleteProps {
  /** Email del usuario autenticado para filtrar vendedores */
  userEmail: string
  /** Nombre del vendedor seleccionado */
  value: string
  /** Callback que se ejecuta al seleccionar un vendedor.
   * Retorna: vendedor, tipo de contrato y nombre del equipo */
  onChange: (value: string, tipoContrato: string | null, nombreEquipo: string) => void
}

/**
 * Componente de autocomplete para buscar y seleccionar vendedores.
 * Los vendedores disponibles dependen del email del usuario en Supabase.
 *
 * @component
 * @param {VendedorAutocompleteProps} props - Props del componente
 * @returns {JSX.Element} Input con autocomplete y lista desplegable de vendedores
 *
 * @example
 * <VendedorAutocomplete
 *   userEmail="supervisor@example.com"
 *   value={vendedorSeleccionado}
 *   onChange={(vendedor, tipo, supervisor) => {
 *     setVendedor(vendedor)
 *     setTipoContrato(tipo)
 *   }}
 * />
 *
 * @description
 * Características:
 * - Carga vendedores desde Supabase según email del equipo
 * - Búsqueda en tiempo real mientras se escribe
 * - Retorna tipo de contrato del vendedor (Contratado/Honorario)
 * - Retorna el supervisor del equipo
 * - Muestra mensaje si no hay vendedores para el usuario
 * - Formatea automáticamente el texto con mayúsculas iniciales
 */
export function VendedorAutocomplete({ userEmail, value, onChange }: VendedorAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreEquipo, setNombreEquipo] = useState<string>('')

  // Obtener vendedores según el email del usuario
  useEffect(() => {
    async function fetchVendedores() {
      if (!userEmail) {
        setVendedores([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Buscar el equipo por email
        const equipos = await getEquipos()
        const equipo = equipos.find(e => e.email === userEmail.toLowerCase())

        if (equipo) {
          setNombreEquipo(equipo.nombre_equipo)
          // Cargar vendedores del equipo
          const data = await getVendedoresByEquipo(equipo.id)
          setVendedores(data)
        } else {
          setVendedores([])
          setNombreEquipo('')
        }
      } catch (error) {
        console.error('Error cargando vendedores:', error)
        console.error('Detalle del error:', JSON.stringify(error, null, 2))
        setVendedores([])
      } finally {
        setLoading(false)
      }
    }
    fetchVendedores()
  }, [userEmail])

  // Actualizar input cuando cambia el value desde afuera
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Filtrar vendedores según lo que escribe el usuario
  const filteredVendedores = vendedores.filter((vendedor) =>
    vendedor.nombre.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    setShowSuggestions(true)
  }

  const handleSelectVendedor = (vendedor: Vendedor) => {
    // "otro" siempre en minúsculas, los demás se normalizan
    const nombreFinal = vendedor.nombre.toLowerCase() === 'otro'
      ? 'otro'
      : vendedor.nombre
    setInputValue(nombreFinal)
    // Convertir tipo a formato esperado (capitalizado)
    const tipoContrato = vendedor.tipo === 'contratado' ? 'Contratado' : 'Honorario'
    // Normalizar nombreEquipo con primera letra mayúscula
    const nombreEquipoNormalizado = toDisplayFormat(nombreEquipo)
    onChange(nombreFinal, tipoContrato, nombreEquipoNormalizado)
    setShowSuggestions(false)
  }

  // Manejar cuando se pierde el foco (normalizar entrada manual)
  const handleBlur = () => {
    setShowSuggestions(false)

    // Normalizar nombreEquipo con primera letra mayúscula
    const nombreEquipoNormalizado = toDisplayFormat(nombreEquipo)

    // Si el input está vacío o solo tiene espacios en blanco
    if (inputValue.trim() === '') {
      // Permitir valor vacío para ventas sin vendedor (mostrar como "Vacío")
      setInputValue('')
      onChange('', null, nombreEquipoNormalizado)
    } else {
      // "otro" siempre en minúsculas, el resto se normaliza
      const normalizado = inputValue.toLowerCase() === 'otro'
        ? 'otro'
        : toDisplayFormat(inputValue)
      setInputValue(normalizado)
      // Si no está en la lista, enviar con tipo null (para que no se guarde en Supabase)
      const vendedorEnLista = vendedores.find(v => v.nombre.toLowerCase() === inputValue.toLowerCase())
      if (vendedorEnLista) {
        const tipoContrato = vendedorEnLista.tipo === 'contratado' ? 'Contratado' : 'Honorario'
        onChange(normalizado, tipoContrato, nombreEquipoNormalizado)
      } else {
        // Entrada manual: enviar con null para que no se guarde en Supabase
        onChange(normalizado, null, nombreEquipoNormalizado)
      }
    }
  }

  return (
    <div className="mb-6 relative">
      <label className="block text-gray-700 font-semibold mb-2">
        Vendedor
      </label>

      {/* Input de búsqueda */}
      <input
        type="text"
        value={inputValue.toLowerCase() === 'otro' ? 'otro' : toDisplayFormat(inputValue)}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleBlur}
        disabled={loading}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
        placeholder={loading ? "Cargando vendedores..." : "Escribe para buscar o ingresa manualmente..."}
      />

      {loading && (
        <div className="text-sm text-gray-500 mt-1">Cargando vendedores...</div>
      )}

      {/* Lista de sugerencias */}
      {showSuggestions && filteredVendedores.length > 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredVendedores.map((vendedor) => (
            <div
              key={vendedor.id}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevenir que onBlur se ejecute primero
                handleSelectVendedor(vendedor);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition"
            >
              {vendedor.nombre.toLowerCase() === 'otro' ? 'otro' : toDisplayFormat(vendedor.nombre)}
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si no hay vendedores */}
      {!loading && vendedores.length === 0 && (
        <p className="mt-2 text-sm text-red-600">
          No hay vendedores registrados para este equipo
        </p>
      )}

      {/* Mostrar la selección actual */}
      {value !== undefined && value !== null && (
        <p className="mt-2 text-sm text-gray-600">
          {value.trim() === '' ? (
            <>Seleccionado: <span className="font-semibold">Vacío</span></>
          ) : (
            <>Seleccionado: <span className="font-semibold">{value.toLowerCase() === 'otro' ? 'otro' : toDisplayFormat(value)}</span></>
          )}
        </p>
      )}

      {/* Cerrar sugerencias al hacer clic fuera */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}
