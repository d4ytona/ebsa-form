/**
 * @fileoverview Componente de selección de tipo de validación de cliente mediante radio buttons.
 * Permite elegir entre Facial, Cuestionario o Excepción.
 */

/**
 * Props para el componente TipoValidacionSelector.
 * @interface TipoValidacionSelectorProps
 */
interface TipoValidacionSelectorProps {
  /** Valor del tipo de validación seleccionado: "facial", "cuestionario" o "excepcion" */
  value: string
  /** Callback que se ejecuta al cambiar la selección */
  onChange: (value: string) => void
}

/**
 * Componente de selección de tipo de validación de identidad con radio buttons.
 * Define el método utilizado para validar la identidad del cliente.
 *
 * @component
 * @param {TipoValidacionSelectorProps} props - Props del componente
 * @returns {JSX.Element} Lista de radio buttons para seleccionar tipo de validación
 *
 * @example
 * <TipoValidacionSelector
 *   value={tipoValidacionSeleccionado}
 *   onChange={setTipoValidacion}
 * />
 *
 * @description
 * Métodos de validación disponibles:
 * - Facial: Validación mediante reconocimiento facial
 * - Cuestionario: Validación mediante preguntas de seguridad
 * - Excepción: Validación manual o casos especiales
 */
export function TipoValidacionSelector({ value, onChange }: TipoValidacionSelectorProps) {
  const tiposValidacion = [
    { id: 'facial', nombre: 'Facial' },
    { id: 'cuestionario', nombre: 'Cuestionario' },
    { id: 'excepcion', nombre: 'Excepción' }
  ]

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Tipo de Validación
      </label>

      <div className="space-y-3">
        {tiposValidacion.map((tipo) => (
          <label
            key={tipo.id}
            className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="tipoValidacion"
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
