/**
 * @fileoverview Componente de autocomplete para seleccionar comunas de Chile.
 * Permite buscar y seleccionar comunas filtradas según la región previamente seleccionada.
 * Datos obtenidos desde Supabase.
 */

import { useState, useEffect, useRef } from "react";
import { getComunasByRegion, getRegiones, toDisplayFormat, type Comuna } from "../lib/supabaseQueries";

/**
 * Props para el componente ComunaAutocomplete.
 * @interface ComunaAutocompleteProps
 */
interface ComunaAutocompleteProps {
  /** Comuna seleccionada actualmente */
  value: string;
  /** Callback que se ejecuta al seleccionar una comuna */
  onChange: (value: string) => void;
  /** Región seleccionada que determina las comunas disponibles */
  selectedRegion: string;
}

/**
 * Componente de autocomplete para buscar y seleccionar comunas de Chile.
 * Las comunas disponibles dependen de la región seleccionada en RegionAutocomplete.
 *
 * @component
 * @param {ComunaAutocompleteProps} props - Props del componente
 * @returns {JSX.Element} Input con autocomplete y lista desplegable de comunas
 *
 * @example
 * <ComunaAutocomplete
 *   value={comunaSeleccionada}
 *   onChange={(comuna) => setComunaSeleccionada(comuna)}
 *   selectedRegion={regionSeleccionada}
 * />
 *
 * @description
 * Características:
 * - Carga comunas desde Supabase según la región seleccionada
 * - Búsqueda en tiempo real mientras se escribe
 * - Se deshabilita si no hay región seleccionada
 * - Limpia automáticamente la comuna si cambia la región
 * - Verifica que la comuna pertenezca a la región seleccionada
 * - Formatea automáticamente el texto con mayúsculas iniciales
 * - Cierra el dropdown al hacer clic fuera del componente
 *
 * Dependencias:
 * - Depende de RegionAutocomplete - requiere que una región esté seleccionada
 * - Consulta a Supabase para obtener comunas por región
 */
export function ComunaAutocomplete({ value, onChange, selectedRegion }: ComunaAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loading, setLoading] = useState(false);
  const [regionId, setRegionId] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Obtener el ID de la región desde el nombre
  useEffect(() => {
    async function getRegionId() {
      if (!selectedRegion) {
        setRegionId('');
        return;
      }

      try {
        const regiones = await getRegiones();
        const region = regiones.find(r => r.nombre === selectedRegion.toLowerCase());
        if (region) {
          setRegionId(region.id);
        }
      } catch (error) {
        console.error('Error obteniendo ID de región:', error);
        console.error('Detalle del error:', JSON.stringify(error, null, 2))
      }
    }
    getRegionId();
  }, [selectedRegion]);

  // Cargar comunas desde Supabase cuando cambia la región
  useEffect(() => {
    async function fetchComunas() {
      if (!regionId) {
        setComunas([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getComunasByRegion(regionId);
        setComunas(data);
      } catch (error) {
        console.error('Error cargando comunas:', error);
        console.error('Detalle del error:', JSON.stringify(error, null, 2))
        setComunas([]);
      } finally {
        setLoading(false);
      }
    }
    fetchComunas();
  }, [regionId]);

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

  // Limpiar comuna cuando cambia la región o cuando se borra
  useEffect(() => {
    // Si no hay región seleccionada, limpiar comuna
    if (!selectedRegion) {
      if (value) {
        onChange("");
        setInputValue("");
      }
    } else if (value && comunas.length > 0) {
      // Si hay región, verificar que la comuna pertenezca a esa región
      const comunaExiste = comunas.some(c => c.nombre === value.toLowerCase());
      if (!comunaExiste) {
        onChange("");
        setInputValue("");
      }
    }
  }, [selectedRegion, comunas]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    setShowSuggestions(true);
  };

  const handleSelectComuna = (comuna: Comuna) => {
    setInputValue(comuna.nombre);
    onChange(comuna.nombre);
    setShowSuggestions(false);
  };

  const filteredComunas = comunas.filter((comuna) =>
    comuna.nombre.toLowerCase().includes(inputValue.toLowerCase())
  );

  const isDisabled = !selectedRegion || loading;

  return (
    <div className="mb-6 relative" ref={containerRef}>
      <label className="block text-gray-700 font-semibold mb-2">
        Comuna
      </label>
      <input
        type="text"
        value={toDisplayFormat(inputValue)}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        disabled={isDisabled}
        placeholder={
          loading
            ? "Cargando comunas..."
            : !selectedRegion
            ? "Primero selecciona una región"
            : "Escribe para buscar una comuna..."
        }
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {loading && (
        <div className="text-sm text-gray-500 mt-1">Cargando comunas...</div>
      )}
      {showSuggestions && filteredComunas.length > 0 && !isDisabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredComunas.map((comuna) => (
            <div
              key={comuna.id}
              onClick={() => handleSelectComuna(comuna)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              {toDisplayFormat(comuna.nombre)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
