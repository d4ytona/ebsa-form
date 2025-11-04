/**
 * @fileoverview Componente de autocomplete para seleccionar códigos de vendedor EBSA.
 * Permite entrada manual siempre, con sugerencias opcionales desde Supabase.
 * Datos obtenidos desde Supabase.
 */

import { useState, useEffect } from 'react'
import { getCodigos, type CodigoVendedor } from '../lib/supabaseQueries'

/**
 * Props para el componente CodigoAutocomplete.
 * @interface CodigoAutocompleteProps
 */
interface CodigoAutocompleteProps {
  /** Código seleccionado actualmente */
  value: string
  /** Callback que se ejecuta al seleccionar un código */
  onChange: (value: string) => void
  /** Email del usuario (opcional, para filtrado futuro) */
  userEmail?: string
}

/**
 * Componente para ingresar código de vendedor EBSA.
 * Permite entrada manual SIEMPRE, con lista desplegable opcional de sugerencias.
 *
 * @component
 * @param {CodigoAutocompleteProps} props - Props del componente
 * @returns {JSX.Element} Input con autocomplete y entrada manual
 *
 * @example
 * <CodigoAutocomplete
 *   value={codigoSeleccionado}
 *   onChange={(codigo) => setCodigoSeleccionado(codigo)}
 * />
 *
 * @description
 * Características:
 * - SIEMPRE permite entrada manual de código
 * - Muestra lista desplegable de sugerencias desde Supabase (códigos EBSA)
 * - Validación: solo letras, conversión automática a minúsculas
 *
 * Dependencias:
 * - Consulta a Supabase para obtener códigos de vendedor EBSA
 */
export function CodigoAutocomplete({ value, onChange, userEmail }: CodigoAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [codigos, setCodigos] = useState<CodigoVendedor[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar códigos desde Supabase al montar el componente
  useEffect(() => {
    async function fetchCodigos() {
      setLoading(true)
      try {
        const data = await getCodigos()
        setCodigos(data)
      } catch (error) {
        console.error('Error cargando códigos:', error)
        console.error('Detalle del error:', JSON.stringify(error, null, 2))
        setCodigos([])
      } finally {
        setLoading(false)
      }
    }
    fetchCodigos()
  }, [])

  // Actualizar input cuando cambia el value desde afuera
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Filtrar códigos según lo que escribe el usuario (para sugerencias)
  const filteredCodigos = codigos.filter((codigo) =>
    codigo.codigo.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleInputChange = (newValue: string) => {
    // SIEMPRE permitir entrada manual: solo letras y convertir a mayúsculas
    const soloLetras = newValue.replace(/[^a-zA-Z\s]/g, '').toUpperCase()
    setInputValue(soloLetras)
    // Mostrar sugerencias si hay códigos disponibles
    if (codigos.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleSelectCodigo = (codigo: CodigoVendedor) => {
    setInputValue(codigo.codigo.toUpperCase())
    onChange(codigo.codigo.toUpperCase())
    setShowSuggestions(false)
  }

  // Manejar cuando se pierde el foco (normalizar)
  const handleBlur = () => {
    setShowSuggestions(false)
    // Permitir espacio en blanco o normalizar
    if (inputValue.trim() === '' && inputValue.length > 0) {
      // Espacio en blanco para ventas sin código
      setInputValue(' ')
      onChange(' ')
    } else if (inputValue.trim()) {
      const normalizado = inputValue.toUpperCase()
      setInputValue(normalizado)
      onChange(normalizado)
    }
  }

  return (
    <div className="mb-6 relative">
      <label className="block text-gray-700 font-semibold mb-2">
        Código <span className="text-sm text-gray-500">(solo letras, mayúsculas)</span>
      </label>

      {/* Input - SIEMPRE permite entrada manual */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => codigos.length > 0 && setShowSuggestions(true)}
        onBlur={handleBlur}
        disabled={loading}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder={
          loading
            ? "Cargando sugerencias..."
            : "Escribe el código o ingresa manualmente..."
        }
      />

      {loading && (
        <div className="text-sm text-gray-500 mt-1">Cargando sugerencias...</div>
      )}

      {/* Lista de sugerencias (opcional, aparece cuando hay códigos en BD) */}
      {showSuggestions && filteredCodigos.length > 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCodigos.map((codigo) => (
            <div
              key={codigo.id}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevenir que onBlur se ejecute primero
                handleSelectCodigo(codigo);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition"
            >
              {codigo.codigo}
            </div>
          ))}
        </div>
      )}

      {/* Mostrar el código ingresado/seleccionado */}
      {value && (
        <p className="mt-2 text-sm text-gray-600">
          Código ingresado: <span className="font-semibold">{value}</span>
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
