/**
 * @fileoverview Componente de selección de tipo de campaña mediante radio buttons.
 * Carga las opciones desde tipos_campana.json.
 */

import tiposCampanaData from '../data/tipos_campana.json'

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
 * Muestra las opciones de campañas disponibles cargadas desde un archivo JSON.
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
 * Las opciones de campaña se cargan dinámicamente desde data/tipos_campana.json.
 * Cada tipo de campaña puede tener diferentes configuraciones y requisitos.
 */
export function TipoCampanaSelector({ value, onChange }: TipoCampanaSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Tipo de Campaña
      </label>

      <div className="space-y-3">
        {tiposCampanaData.map((tipo) => (
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
    </div>
  )
}