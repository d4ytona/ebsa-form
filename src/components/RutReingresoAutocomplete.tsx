/**
 * @fileoverview Componente de autocompletado de RUT para reingresos.
 * Permite buscar pedidos anteriores del equipo por RUT y dirección.
 */

import { useState, useEffect, useMemo } from "react";
import { getPedidosPorEquipo } from "../lib/supabaseQueries";

/**
 * Interfaz para un pedido previo resumido
 */
interface PedidoPrevio {
  /** RUT del cliente */
  rut: string;
  /** Dirección completa del cliente */
  direccion_completa: string;
  /** Nombre del vendedor */
  vendedor: string;
  /** ID del pedido */
  id: string;
  /** Todos los datos del pedido para autocompletar */
  datos: Record<string, unknown>;
}

/**
 * Props para el componente RutReingresoAutocomplete
 */
interface RutReingresoAutocompleteProps {
  /** Email del usuario actual para filtrar por equipo */
  userEmail: string;
  /** Valor seleccionado (RUT) */
  value: string;
  /** Callback cuando se selecciona un RUT */
  onChange: (rut: string, datosPedido: Record<string, unknown>) => void;
}

/**
 * Componente de autocompletado de RUT para reingresos.
 * Muestra una lista de RUT con sus direcciones de pedidos anteriores del equipo.
 *
 * @component
 * @param {RutReingresoAutocompleteProps} props - Props del componente
 * @returns {JSX.Element} Input con autocompletado de RUT
 *
 * @example
 * <RutReingresoAutocomplete
 *   userEmail="usuario@example.com"
 *   value={rutSeleccionado}
 *   onChange={(rut, datos) => {
 *     setRutSeleccionado(rut);
 *     autocompletarFormulario(datos);
 *   }}
 * />
 */
export function RutReingresoAutocomplete({
  userEmail,
  value,
  onChange,
}: RutReingresoAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pedidosPrevios, setPedidosPrevios] = useState<PedidoPrevio[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos previos del equipo
  useEffect(() => {
    async function fetchPedidosPrevios() {
      if (!userEmail) {
        setPedidosPrevios([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const pedidos = await getPedidosPorEquipo(userEmail);

        // Transformar a formato simplificado
        const pedidosFormateados: PedidoPrevio[] = pedidos.map(pedido => ({
          rut: pedido.rut_solicitante || "",
          direccion_completa: `${pedido.direccion || ""}, ${pedido.comuna || ""}, ${pedido.region || ""}`.trim(),
          vendedor: pedido.vendedor || "",
          id: pedido.id,
          datos: pedido
        }));

        setPedidosPrevios(pedidosFormateados);
      } catch (error) {
        console.error("Error cargando pedidos previos:", error);
        setPedidosPrevios([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPedidosPrevios();
  }, [userEmail]);

  // Filtrar pedidos según término de búsqueda (solo por RUT)
  const pedidosFiltrados = useMemo(() => {
    if (!searchTerm) return pedidosPrevios;

    const termLower = searchTerm.toLowerCase();
    return pedidosPrevios.filter(
      (pedido) => pedido.rut.toLowerCase().includes(termLower)
    );
  }, [pedidosPrevios, searchTerm]);

  const handleSelect = (pedido: PedidoPrevio) => {
    setSearchTerm(`${pedido.rut} - ${pedido.direccion_completa} - ${pedido.vendedor}`);
    setShowDropdown(false);
    onChange(pedido.rut, pedido.datos);
  };

  return (
    <div className="mb-6 relative">
      <label className="block text-gray-700 font-semibold mb-2">
        Buscar Pedido Anterior por RUT
      </label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Escribe el RUT del cliente..."
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        disabled={loading}
      />

      {loading && (
        <p className="text-sm text-gray-500 mt-1">Cargando pedidos previos...</p>
      )}

      {/* Dropdown con resultados */}
      {showDropdown && !loading && pedidosFiltrados.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              onClick={() => handleSelect(pedido)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200 last:border-b-0"
            >
              <p className="font-semibold text-gray-900">{pedido.rut}</p>
              <p className="text-sm text-gray-600">{pedido.direccion_completa}</p>
              <p className="text-sm text-blue-600 font-medium">{pedido.vendedor}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si no hay resultados */}
      {showDropdown && !loading && searchTerm && pedidosFiltrados.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-gray-600 text-center">No se encontraron pedidos anteriores</p>
        </div>
      )}

      {/* Click fuera para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
