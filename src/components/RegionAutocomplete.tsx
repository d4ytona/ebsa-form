/**
 * @fileoverview Componente de autocomplete para seleccionar regiones de Chile.
 * Permite buscar y seleccionar una región del listado completo disponible.
 * Datos obtenidos desde Supabase.
 */

import { useState, useEffect, useRef } from "react";
import { getRegiones, toDisplayFormat, type Region } from "../lib/supabaseQueries";

/**
 * Props para el componente RegionAutocomplete.
 * @interface RegionAutocompleteProps
 */
interface RegionAutocompleteProps {
  /** Región seleccionada actualmente */
  value: string;
  /** Callback que se ejecuta al seleccionar una región */
  onChange: (value: string) => void;
}

/**
 * Componente de autocomplete para buscar y seleccionar regiones de Chile.
 * Carga todas las regiones disponibles y permite filtrarlas mediante búsqueda.
 *
 * @component
 * @param {RegionAutocompleteProps} props - Props del componente
 * @returns {JSX.Element} Input con autocomplete y lista desplegable de regiones
 *
 * @example
 * <RegionAutocomplete
 *   value={regionSeleccionada}
 *   onChange={(region) => {
 *     setRegionSeleccionada(region)
 *     // Esto limpiará la comuna seleccionada en ComunaAutocomplete
 *   }}
 * />
 *
 * @description
 * Características:
 * - Carga regiones desde regiones.json (contiene todas las regiones de Chile)
 * - Búsqueda en tiempo real mientras se escribe
 * - Formatea automáticamente el texto con mayúsculas iniciales
 * - Cierra el dropdown al hacer clic fuera del componente
 * - Al cambiar la región, el componente ComunaAutocomplete se actualizará automáticamente
 *
 * Dependencias:
 * - Archivo de datos: src/data/regiones.json
 * - ComunaAutocomplete depende de la región seleccionada aquí
 */
export function RegionAutocomplete({ value, onChange }: RegionAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar regiones desde Supabase
  useEffect(() => {
    async function fetchRegiones() {
      try {
        const data = await getRegiones();
        setRegiones(data);
      } catch (error) {
        console.error('Error cargando regiones:', error);
        console.error('Detalle del error:', JSON.stringify(error, null, 2))
      } finally {
        setLoading(false);
      }
    }
    fetchRegiones();
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelectRegion = (region: Region) => {
    setInputValue(region.nombre);
    onChange(region.nombre);
    setShowSuggestions(false);
  };

  const filteredRegiones = regiones.filter((region) =>
    region.nombre.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="mb-6 relative" ref={containerRef}>
      <label className="block text-gray-700 font-semibold mb-2">
        Región
      </label>
      <input
        type="text"
        value={toDisplayFormat(inputValue)}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Escribe para buscar una región..."
        disabled={loading}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
      />
      {loading && (
        <div className="text-sm text-gray-500 mt-1">Cargando regiones...</div>
      )}
      {showSuggestions && filteredRegiones.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredRegiones.map((region) => (
            <div
              key={region.id}
              onClick={() => handleSelectRegion(region)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              {toDisplayFormat(region.nombre)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
