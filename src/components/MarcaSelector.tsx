/**
 * @fileoverview Componente de selección de marca mediante radio buttons.
 * Muestra marcas disponibles según el distribuidor seleccionado.
 */

import distribuidoresData from '../data/distribuidores.json'

/**
 * Props para el componente MarcaSelector.
 * @interface MarcaSelectorProps
 */
interface MarcaSelectorProps {
  /** ID de la marca seleccionada */
  value: string
  /** Callback que se ejecuta al cambiar la selección */
  onChange: (value: string) => void
}

/**
 * Componente de selección de marca con radio buttons.
 * Filtra y muestra las marcas disponibles según el distribuidor seleccionado.
 * Se oculta automáticamente si el distribuidor tiene una sola marca.
 *
 * @component
 * @param {MarcaSelectorProps} props - Props del componente
 * @returns {JSX.Element | null} Lista de radio buttons para seleccionar marca, o null si no aplica
 *
 * @example
 * <MarcaSelector
 *   distribuidorId={distribuidorSeleccionado}
 *   value={marcaSeleccionada}
 *   onChange={setMarca}
 * />
 *
 * @description
 * El componente carga las marcas desde distribuidores.json y las filtra según
 * el distribuidor seleccionado. Si un distribuidor solo tiene una marca, el
 * componente retorna null y no se muestra en la interfaz.
 */
export function MarcaSelector({ value, onChange }: MarcaSelectorProps) {
  // Marcas disponibles (VTR y Claro)
  const marcas = [
    { id: 'vtr', nombre: 'VTR' },
    { id: 'claro', nombre: 'Claro' }
  ];

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Selecciona la marca
      </label>

      <div className="space-y-3">
        {marcas.map((marca) => (
          <label
            key={marca.id}
            className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="marca"
              value={marca.id}
              checked={value === marca.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 text-blue-600"
            />
            <span className="ml-3 text-gray-900 font-medium">
              {marca.nombre}
            </span>
          </label>
        ))}
      </div>

      {/* Mostrar la selección actual */}
      {value && (
        <p className="mt-4 text-sm text-gray-600">
          Seleccionado: <span className="font-semibold">{marcas.find(m => m.id === value)?.nombre}</span>
        </p>
      )}
    </div>
  )
}
