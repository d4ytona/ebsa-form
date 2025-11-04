/**
 * @fileoverview Componente de sección para capturar la dirección completa del solicitante.
 * Este componente gestiona la selección de región y comuna mediante autocompletes, y la
 * entrada de la dirección específica con validación en tiempo real. Asegura que se capture
 * una dirección válida y completa para la instalación del servicio.
 */

import { useState } from "react";
import { RegionAutocomplete } from "./RegionAutocomplete";
import { ComunaAutocomplete } from "./ComunaAutocomplete";
import { TextInput } from "./TextInput";
import { validateAddress, formatAddress, errorMessages } from "../utils/validators";

/**
 * @interface DireccionProps
 * @description Propiedades del componente Direccion que controla la captura de datos de ubicación.
 *
 * @property {boolean} isCollapsed - Estado de colapso de la sección
 * @property {function} onToggle - Callback para alternar el estado de colapso
 * @property {function} onContinue - Callback al presionar el botón Continuar
 * @property {boolean} canContinue - Indica si el botón Continuar debe estar habilitado
 * @property {boolean} [canExpand] - Indica si la sección puede expandirse/colapsarse (default: true)
 * @property {string} region - Región seleccionada (ej: "Región Metropolitana")
 * @property {string} comuna - Comuna seleccionada (ej: "Santiago")
 * @property {string} direccion - Dirección completa con calle, número y depto (ej: "Calle #123, Depto. 45")
 * @property {function} onRegionChange - Handler para cambios en la región seleccionada
 * @property {function} onComunaChange - Handler para cambios en la comuna seleccionada
 * @property {function} onDireccionChange - Handler para cambios en la dirección ingresada
 */
interface DireccionProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onContinue: () => void;
  canContinue: boolean;
  canExpand?: boolean;
  region: string;
  comuna: string;
  direccion: string;
  onRegionChange: (value: string) => void;
  onComunaChange: (value: string) => void;
  onDireccionChange: (value: string) => void;
}

/**
 * @component Direccion
 * @description Sección del formulario que captura la dirección completa de instalación del servicio.
 * Es la segunda sección del formulario y utiliza autocompletes para facilitar la selección de ubicación.
 *
 * @param {DireccionProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección colapsable con formulario de dirección
 *
 * @description
 * Campos incluidos:
 * - Región: Selector con autocomplete de todas las regiones de Chile
 * - Comuna: Selector con autocomplete filtrado según la región seleccionada
 * - Dirección: Campo de texto para ingresar calle, número y depto/oficina
 *
 * Validaciones aplicadas:
 * - Dirección: Valida formato básico (longitud mínima, caracteres permitidos)
 * - Formateo automático: Capitaliza y limpia caracteres especiales no permitidos
 *
 * Lógica condicional:
 * - El selector de Comuna se habilita solo cuando se ha seleccionado una Región
 * - El selector de Comuna filtra las opciones según la Región seleccionada
 * - La validación de dirección se ejecuta en tiempo real mientras el usuario escribe
 * - El botón Continuar se habilita solo cuando todos los campos están completos y válidos
 *
 * Componentes hijos utilizados:
 * - RegionAutocomplete: Selector con autocomplete para regiones de Chile
 * - ComunaAutocomplete: Selector con autocomplete para comunas filtradas por región
 * - TextInput: Campo de texto para dirección con validación
 *
 * @example
 * ```tsx
 * <Direccion
 *   isCollapsed={false}
 *   onToggle={() => setIsCollapsed(!isCollapsed)}
 *   onContinue={() => handleContinue()}
 *   canContinue={isAddressComplete}
 *   canExpand={true}
 *   region={formData.region}
 *   comuna={formData.comuna}
 *   direccion={formData.direccion}
 *   onRegionChange={(value) => setFormData({...formData, region: value, comuna: ''})}
 *   onComunaChange={(value) => setFormData({...formData, comuna: value})}
 *   onDireccionChange={(value) => setFormData({...formData, direccion: value})}
 * />
 * ```
 */
export function Direccion({
  isCollapsed,
  onToggle,
  onContinue,
  canContinue,
  canExpand = true,
  region,
  comuna,
  direccion,
  onRegionChange,
  onComunaChange,
  onDireccionChange,
}: DireccionProps) {
  // Estado para error de dirección
  const [direccionError, setDireccionError] = useState('');

  // Handler para dirección con validación
  const handleDireccionChange = (value: string) => {
    const formatted = formatAddress(value);
    onDireccionChange(formatted);
    if (formatted && !validateAddress(formatted)) {
      setDireccionError(errorMessages.address);
    } else {
      setDireccionError('');
    }
  };

  return (
    <div className="mb-8 border-2 border-gray-200 rounded-lg">
      {/* Header de la sección con botón para colapsar */}
      <div
        onClick={canExpand ? onToggle : undefined}
        className={`flex justify-between items-center p-4 transition rounded-t-lg ${
          canExpand ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900">Dirección</h2>
        <button className="text-gray-600 text-2xl">
          {isCollapsed ? "+" : "−"}
        </button>
      </div>

      {/* Contenido de la sección (colapsable) */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-gray-200">
          <RegionAutocomplete
            value={region}
            onChange={onRegionChange}
          />

          <ComunaAutocomplete
            value={comuna}
            onChange={onComunaChange}
            selectedRegion={region}
          />

          <TextInput
            label="Dirección"
            type="text"
            value={direccion}
            onChange={handleDireccionChange}
            placeholder="Calle #123, Depto. 45"
            error={direccionError}
          />

          {/* Botón Continuar */}
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
