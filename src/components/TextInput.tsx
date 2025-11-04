/**
 * @fileoverview Componente de input de texto reutilizable con validación.
 */

/**
 * Props para el componente TextInput.
 * @interface TextInputProps
 */
interface TextInputProps {
  /** Etiqueta que se muestra encima del input */
  label: string
  /** Valor actual del input */
  value: string
  /** Función callback que se ejecuta cuando cambia el valor */
  onChange: (value: string) => void
  /** Tipo de input HTML */
  type?: 'text' | 'email' | 'tel' | 'date'
  /** Texto de placeholder que se muestra cuando el input está vacío */
  placeholder?: string
  /** Mensaje de error a mostrar debajo del input */
  error?: string
  /** Función callback que se ejecuta cuando el input pierde el foco */
  onBlur?: () => void
  /** Longitud máxima de caracteres permitidos */
  maxLength?: number
}

/**
 * Componente de input de texto genérico y reutilizable.
 * Proporciona estilos consistentes, validación y manejo de errores.
 *
 * @component
 * @param {TextInputProps} props - Props del componente
 * @returns {JSX.Element} Input de texto con label y mensaje de error opcional
 *
 * @example
 * <TextInput
 *   label="Nombre"
 *   value={nombre}
 *   onChange={setNombre}
 *   placeholder="Ingrese su nombre"
 *   error={errorNombre}
 * />
 */
export function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  onBlur,
  maxLength
}: TextInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
          error
            ? 'border-red-500 focus:border-red-600'
            : 'border-gray-300 focus:border-blue-500'
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
