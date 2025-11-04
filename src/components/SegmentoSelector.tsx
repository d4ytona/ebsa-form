/**
 * @fileoverview Componente de selección de segmento de cliente mediante radio buttons.
 * Permite elegir entre segmentos Residencial o Negocio.
 */

/**
 * Props para el componente SegmentoSelector.
 * @interface SegmentoSelectorProps
 */
interface SegmentoSelectorProps {
  /** Valor del segmento seleccionado: "residencial" o "negocio" */
  value: string
  /** Callback que se ejecuta al cambiar la selección */
  onChange: (value: string) => void
}

/**
 * Componente de selección de segmento de cliente con radio buttons.
 * Muestra las opciones Residencial y Negocio para clasificar al cliente.
 *
 * @component
 * @param {SegmentoSelectorProps} props - Props del componente
 * @returns {JSX.Element} Lista de radio buttons para seleccionar segmento
 *
 * @example
 * <SegmentoSelector
 *   value={segmentoSeleccionado}
 *   onChange={setSegmento}
 * />
 *
 * @description
 * El segmento determina el tipo de planes y servicios disponibles:
 * - Residencial: Planes para hogares y familias
 * - Negocio: Planes corporativos y empresariales
 */
export function SegmentoSelector({ value, onChange }: SegmentoSelectorProps) {
  const segmentos = [
    { id: 'residencial', nombre: 'Residencial' },
    { id: 'negocio', nombre: 'Negocio' }
  ]

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Segmento
      </label>

      <div className="space-y-3">
        {segmentos.map((segmento) => (
          <label
            key={segmento.id}
            className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="segmento"
              value={segmento.id}
              checked={value === segmento.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 text-blue-600"
            />
            <span className="ml-3 text-gray-900 font-medium">
              {segmento.nombre}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
