/**
 * @fileoverview Componente de selección de tipo de agente de ventas mediante radio buttons.
 * Permite elegir entre Contratado u Honorario.
 */

/**
 * Props para el componente TipoAgenteSelector.
 * @interface TipoAgenteSelectorProps
 */
interface TipoAgenteSelectorProps {
  /** Valor del tipo de agente seleccionado: "contratado" u "honorario" */
  value: string
  /** Callback que se ejecuta al cambiar la selección */
  onChange: (value: string) => void
}

/**
 * Componente de selección de tipo de agente de ventas con radio buttons.
 * Define el tipo de contratación del agente que realiza la venta.
 *
 * @component
 * @param {TipoAgenteSelectorProps} props - Props del componente
 * @returns {JSX.Element} Lista de radio buttons para seleccionar tipo de agente
 *
 * @example
 * <TipoAgenteSelector
 *   value={tipoAgenteSeleccionado}
 *   onChange={setTipoAgente}
 * />
 *
 * @description
 * Tipos de agente disponibles:
 * - Contratado: Agente con contrato laboral directo
 * - Honorario: Agente independiente o por honorarios
 */
export function TipoAgenteSelector({ value, onChange }: TipoAgenteSelectorProps) {
  const tipos = [
    { id: 'contratado', nombre: 'Contratado' },
    { id: 'honorario', nombre: 'Honorario' }
  ]

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Tipo de Agente
      </label>

      <div className="space-y-3">
        {tipos.map((tipo) => (
          <label
            key={tipo.id}
            className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="tipoAgente"
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
          Seleccionado: <span className="font-semibold">{tipos.find(t => t.id === value)?.nombre}</span>
        </p>
      )}
    </div>
  )
}
