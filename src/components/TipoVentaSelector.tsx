/**
 * @fileoverview Componente de selección de tipo de venta mediante radio buttons.
 * Permite elegir entre venta Nueva o Paquetización.
 */

/**
 * Props para el componente TipoVentaSelector.
 * @interface TipoVentaSelectorProps
 */
interface TipoVentaSelectorProps {
  /** Valor del tipo de venta seleccionado: "nueva" o "paquetizacion" */
  value: string
  /** Callback que se ejecuta al cambiar la selección */
  onChange: (value: string) => void
}

/**
 * Componente de selección de tipo de venta con radio buttons.
 * Permite diferenciar entre ventas nuevas y paquetización de servicios existentes.
 *
 * @component
 * @param {TipoVentaSelectorProps} props - Props del componente
 * @returns {JSX.Element} Lista de radio buttons para seleccionar tipo de venta
 *
 * @example
 * <TipoVentaSelector
 *   value={tipoVentaSeleccionado}
 *   onChange={setTipoVenta}
 * />
 *
 * @description
 * Tipos de venta disponibles:
 * - Nueva: Cliente nuevo o venta de servicios adicionales
 * - Paquetización: Consolidación de servicios existentes en un plan
 */
export function TipoVentaSelector({ value, onChange }: TipoVentaSelectorProps) {
  const tiposVenta = [
    { id: 'nueva', nombre: 'Nueva' },
    { id: 'paquetizacion', nombre: 'Paquetización' },
    { id: 'pagopuf', nombre: 'Pago PUF' },
    { id: 'reingreso', nombre: 'Reingreso' }
  ]

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Tipo de Venta
      </label>

      <div className="space-y-3">
        {tiposVenta.map((tipo) => (
          <label
            key={tipo.id}
            className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="radio"
              name="tipoVenta"
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
          Seleccionado: <span className="font-semibold">{tiposVenta.find(t => t.id === value)?.nombre}</span>
        </p>
      )}
    </div>
  )
}
