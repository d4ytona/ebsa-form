/**
 * @fileoverview Componente de selección de tipo de campaña mediante radio buttons.
 * Carga las opciones desde Supabase.
 */

import { useState, useEffect } from 'react'
import { getTiposCampana, type TipoCampana } from '../lib/supabaseQueries'

/**
 * Props para el componente TipoCampanaSelector.
 * @interface TipoCampanaSelectorProps
 */
interface TipoCampanaSelectorProps {
  /** ID del tipo de campaña seleccionado */
  value: string
  /** Callback que se ejecuta al cambiar la selección */
  onChange: (value: string) => void
}

/**
 * Componente de selección de tipo de campaña con radio buttons.
 * Muestra las opciones de campañas disponibles cargadas desde Supabase.
 *
 * @component
 * @param {TipoCampanaSelectorProps} props - Props del componente
 * @returns {JSX.Element} Lista de radio buttons para seleccionar tipo de campaña
 *
 * @example
 * <TipoCampanaSelector
 *   value={tipoCampanaSeleccionado}
 *   onChange={setTipoCampana}
 * />
 *
 * @description
 * Las opciones de campaña se cargan dinámicamente desde la base de datos Supabase.
 * Cada tipo de campaña puede tener diferentes configuraciones y requisitos.
 */
export function TipoCampanaSelector({ value, onChange }: TipoCampanaSelectorProps) {
  const [tiposCampana, setTiposCampana] = useState<TipoCampana[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTiposCampana() {
      try {
        const data = await getTiposCampana()
        setTiposCampana(data)
      } catch (error) {
        console.error('Error cargando tipos de campaña:', error)
        setTiposCampana([])
      } finally {
        setLoading(false)
      }
    }
    fetchTiposCampana()
  }, [])

  if (loading) {
    return (
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-3">
          Tipo de Campaña
        </label>
        <p className="text-sm text-gray-500">Cargando tipos de campaña...</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Tipo de Campaña
      </label>

      <div className="space-y-3">
        {tiposCampana.map((tipo) => (
          <label
            key={tipo.id}
            className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="tipoCampana"
              value={tipo.id}
              checked={value === tipo.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 text-blue-600"
            />
            <span className="ml-3 text-gray-900 font-medium">
              {tipo.nombre}
            </span>
          </label>
        ))}
      </div>

      {/* Mostrar la selección actual */}
      {value && (
        <p className="mt-4 text-sm text-gray-600">
          Seleccionado: <span className="font-semibold">{tiposCampana.find(t => t.id === value)?.nombre}</span>
        </p>
      )}
    </div>
  )
}
