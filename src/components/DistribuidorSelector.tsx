/**
 * @fileoverview Componente de selección de distribuidor mediante radio buttons.
 * Carga las opciones desde distribuidores.json.
 */

import distribuidoresData from '../data/distribuidores.json'

/**
 * Props para el componente DistribuidorSelector.
 * @interface DistribuidorSelectorProps
 */
interface DistribuidorSelectorProps {
  /** ID del distribuidor seleccionado */
  value: string
  /** Callback que se ejecuta al cambiar la selección */
  onChange: (value: string) => void
}

/**
 * Componente de selección de distribuidor con radio buttons.
 * Muestra opciones de distribuidores disponibles desde data/distribuidores.json.
 *
 * @component
 * @param {DistribuidorSelectorProps} props - Props del componente
 * @returns {JSX.Element} Lista de radio buttons para seleccionar distribuidor
 *
 * @example
 * <DistribuidorSelector
 *   value={distribuidorSeleccionado}
 *   onChange={setDistribuidor}
 * />
 *
 * @description
 * Distribuidores disponibles: EBSA, XR3, TELCOSUR
 * La selección afecta las opciones disponibles de marcas y códigos.
 */
export function DistribuidorSelector({ value, onChange }: DistribuidorSelectorProps) {
  // Obtener las opciones del JSON
  const distribuidores = distribuidoresData.distribuidores

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Selecciona el distribuidor
      </label>

      <div className="space-y-3">
        {distribuidores.map((distribuidor) => (
          <label
            key={distribuidor.id}
            className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="distribuidor"
              value={distribuidor.id}
              checked={value === distribuidor.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 text-blue-600"
            />
            <span className="ml-3 text-gray-900 font-medium">
              {distribuidor.nombre}
            </span>
          </label>
        ))}
      </div>

      {/* Mostrar la selección actual */}
      {value && (
        <p className="mt-4 text-sm text-gray-600">
          Seleccionado: <span className="font-semibold">{distribuidores.find(d => d.id === value)?.nombre}</span>
        </p>
      )}
    </div>
  )
}
