/**
 * @fileoverview Componente de sección final para capturar información adicional del agendamiento.
 * Este componente gestiona la fecha y tramo horario de instalación, tipo de campaña, y comentarios
 * del vendedor. Incluye lógica inteligente para filtrar tramos disponibles según la hora actual y
 * validación de feriados. Es la última sección del formulario antes de finalizar.
 */

import { useMemo, useState, useEffect } from "react";
import { getTramosHorarios, type TramoHorario } from "../lib/supabaseQueries";
import { validateAddress, formatAddress, errorMessages } from "../utils/validators";
import { TipoCampanaSelector } from "./TipoCampanaSelector";
import { FechaAgendamientoSelector } from "./FechaAgendamientoSelector";
import { FileUpload } from "./FileUpload";


/**
 * @interface InformacionAdicionalProps
 * @description Propiedades del componente InformacionAdicional que gestiona el agendamiento.
 *
 * @property {boolean} isCollapsed - Estado de colapso de la sección
 * @property {function} onToggle - Callback para alternar el estado de colapso
 * @property {function} onContinue - Callback al presionar el botón Finalizar
 * @property {boolean} canContinue - Indica si el botón Finalizar debe estar habilitado
 * @property {boolean} [canExpand] - Indica si la sección puede expandirse/colapsarse (default: true)
 * @property {string} fechaAgendamiento - Fecha de instalación seleccionada (formato YYYY-MM-DD)
 * @property {string} tramoInstalacion - ID del tramo horario seleccionado
 * @property {string} tipoCampana - Tipo de campaña seleccionado
 * @property {string} comentarioVendedor - Comentarios u observaciones adicionales del vendedor
 * @property {function} onFechaChange - Handler para cambios en la fecha de agendamiento
 * @property {function} onTramoChange - Handler para cambios en el tramo de instalación
 * @property {function} onTipoCampanaChange - Handler para cambios en el tipo de campaña
 * @property {function} onComentarioChange - Handler para cambios en el comentario del vendedor
 * @property {string} rut - RUT del solicitante para nombrar archivos
 * @property {string[]} rutFrontalUrls - URLs de archivos RUT frontal subidos
 * @property {string[]} rutPosteriorUrls - URLs de archivos RUT posterior subidos
 * @property {string[]} factibilidadUrls - URLs de archivos de factibilidad subidos
 * @property {string[]} otrosDocumentosUrls - URLs de otros documentos subidos
 * @property {function} onRutFrontalUrlsChange - Handler para cambios en URLs RUT frontal
 * @property {function} onRutPosteriorUrlsChange - Handler para cambios en URLs RUT posterior
 * @property {function} onFactibilidadUrlsChange - Handler para cambios en URLs factibilidad
 * @property {function} onOtrosDocumentosUrlsChange - Handler para cambios en otros documentos
 */
interface InformacionAdicionalProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onContinue: () => void;
  canContinue: boolean;
  canExpand?: boolean;
  fechaAgendamiento: string;
  tramoInstalacion: string;
  tipoCampana: string;
  comentarioVendedor: string;
  onFechaChange: (value: string) => void;
  onTramoChange: (value: string) => void;
  onTipoCampanaChange: (value: string) => void;
  onComentarioChange: (value: string) => void;
  rut: string;
  rutFrontalUrls: string[];
  rutPosteriorUrls: string[];
  factibilidadUrls: string[];
  otrosDocumentosUrls: string[];
  onRutFrontalUrlsChange: (urls: string[]) => void;
  onRutPosteriorUrlsChange: (urls: string[]) => void;
  onFactibilidadUrlsChange: (urls: string[]) => void;
  onOtrosDocumentosUrlsChange: (urls: string[]) => void;
}

/**
 * @component InformacionAdicional
 * @description Sección final del formulario que captura la información de agendamiento y observaciones.
 * Es la quinta y última sección del formulario, responsable de coordinar la fecha y hora de instalación.
 *
 * @param {InformacionAdicionalProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección colapsable con formulario de información adicional
 *
 * @description
 * Campos incluidos:
 * - Fecha de Agendamiento: Selector de fecha con validación de feriados y días hábiles
 * - Tramo de Instalación: Radio buttons con tramos horarios disponibles
 * - Tipo de Campaña: Selector de tipo de campaña comercial
 * - Comentario del Vendedor: Área de texto para observaciones adicionales
 *
 * Validaciones aplicadas:
 * - Fecha: No permite seleccionar fechas pasadas ni feriados (validado por FechaAgendamientoSelector)
 * - Fecha mínima: Si son más de las 19:00, la fecha mínima es mañana; si no, es hoy
 * - Tramos: Filtra tramos según hora actual si la fecha seleccionada es hoy
 * - Comentario: Validación básica de formato (opcional)
 *
 * Lógica condicional:
 * - Cálculo de fecha mínima (useMemo):
 *   - Si horaActual >= 19:00: fechaMinima = mañana
 *   - Si horaActual < 19:00: fechaMinima = hoy
 *
 * - Filtrado de tramos disponibles (useMemo):
 *   - Si fechaSeleccionada !== hoy: Todos los tramos están disponibles
 *   - Si fechaSeleccionada === hoy: Solo muestra tramos cuya hora de fin > hora actual
 *   - Ejemplo: Si son las 14:00, no muestra el tramo AM (08:00-13:00)
 *
 * - Reseteo de tramo al cambiar fecha:
 *   - Si el tramo seleccionado ya no está disponible para la nueva fecha, se limpia la selección
 *
 * - Estados de tramos:
 *   - Tramos disponibles: Habilitados, interactuables, con hover
 *   - Tramos no disponibles: Deshabilitados, grises, con etiqueta "No disponible"
 *
 * - Mensaje especial:
 *   - Si no hay tramos disponibles para el día seleccionado, muestra mensaje con fondo amarillo
 *   - Sugiere seleccionar otra fecha
 *
 * Componentes hijos utilizados:
 * - FechaAgendamientoSelector: Selector de fecha con validación de feriados
 * - TipoCampanaSelector: Selector de tipo de campaña comercial
 *
 * @example
 * ```tsx
 * <InformacionAdicional
 *   isCollapsed={false}
 *   onToggle={() => setIsCollapsed(!isCollapsed)}
 *   onContinue={() => handleFinalize()}
 *   canContinue={isInfoComplete}
 *   canExpand={true}
 *   fechaAgendamiento="2025-10-30"
 *   tramoInstalacion="am"
 *   tipoCampana="Door to Door"
 *   comentarioVendedor="Cliente prefiere contacto por email"
 *   onFechaChange={(value) => setFechaAgendamiento(value)}
 *   onTramoChange={(value) => setTramoInstalacion(value)}
 *   onTipoCampanaChange={(value) => setTipoCampana(value)}
 *   onComentarioChange={(value) => setComentario(value)}
 * />
 * ```
 */
export function InformacionAdicional({
  isCollapsed,
  onToggle,
  onContinue,
  canContinue,
  canExpand = true,
  fechaAgendamiento,
  tramoInstalacion,
  tipoCampana,
  comentarioVendedor,
  onFechaChange,
  onTramoChange,
  onTipoCampanaChange,
  onComentarioChange,
  rut,
  rutFrontalUrls,
  rutPosteriorUrls,
  factibilidadUrls,
  otrosDocumentosUrls,
  onRutFrontalUrlsChange,
  onRutPosteriorUrlsChange,
  onFactibilidadUrlsChange,
  onOtrosDocumentosUrlsChange,
}: InformacionAdicionalProps) {
  // Estado para error de comentario
  const [comentarioError, setComentarioError] = useState('');
  // Estado para tramos horarios desde Supabase
  const [tramosData, setTramosData] = useState<TramoHorario[]>([]);
  const [loadingTramos, setLoadingTramos] = useState(true);

  // Cargar tramos horarios desde Supabase
  useEffect(() => {
    async function fetchTramos() {
      try {
        const data = await getTramosHorarios();
        setTramosData(data);
      } catch (error) {
        console.error('Error cargando tramos horarios:', error);
        setTramosData([]);
      } finally {
        setLoadingTramos(false);
      }
    }
    fetchTramos();
  }, []);

  // Obtener fecha y hora actual
  const ahora = new Date();
  const horaActual = ahora.getHours();

  // Handler para comentario con validación
  const handleComentarioChange = (value: string) => {
    const formatted = formatAddress(value);
    onComentarioChange(formatted);
    if (formatted && !validateAddress(formatted)) {
      setComentarioError(errorMessages.address);
    } else {
      setComentarioError('');
    }
  };

  // Calcular la fecha mínima (hoy o mañana según la hora)
  const fechaMinima = useMemo(() => {
    const fecha = new Date();
    // Si son más de las 19:00, empezar desde mañana
    if (horaActual >= 19) {
      fecha.setDate(fecha.getDate() + 1);
    }
    return fecha.toISOString().split('T')[0];
  }, [horaActual]);

  // Determinar qué tramos están disponibles según la fecha y hora
  const tramosDisponibles = useMemo(() => {
    const fechaSeleccionada = fechaAgendamiento || fechaMinima;
    const esHoy = fechaSeleccionada === ahora.toISOString().split('T')[0];

    if (!esHoy) {
      // Si no es hoy, todos los tramos están disponibles
      return tramosData;
    }

    // Si es hoy, filtrar tramos según la hora actual
    return tramosData.filter((tramo) => {
      const [horaFin] = tramo.fin.split(':').map(Number);
      // El tramo está disponible si su hora de fin aún no ha pasado
      return horaFin > horaActual;
    });
  }, [fechaAgendamiento, fechaMinima, horaActual, tramosData]);

  return (
    <div className="mb-8 border-2 border-gray-200 rounded-lg">
      {/* Header de la sección */}
      <div
        onClick={canExpand ? onToggle : undefined}
        className={`flex justify-between items-center p-4 transition rounded-t-lg ${
          canExpand ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900">Información Adicional</h2>
        <button className="text-gray-600 text-2xl">
          {isCollapsed ? "+" : "−"}
        </button>
      </div>

      {/* Contenido de la sección */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-gray-200">
          {/* Fecha de Agendamiento */}
          <FechaAgendamientoSelector
            value={fechaAgendamiento}
            onChange={(nuevaFecha) => {
              onFechaChange(nuevaFecha);
              // Si cambia la fecha, resetear el tramo seleccionado
              if (tramosDisponibles.length > 0 && !tramosDisponibles.find(t => t.id === tramoInstalacion)) {
                onTramoChange('');
              }
            }}
          />

          {/* Tramo de Instalación */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              Tramo de Instalación
            </label>
            {loadingTramos ? (
              <p className="text-sm text-gray-500">Cargando tramos horarios...</p>
            ) : tramosDisponibles.length === 0 ? (
              <p className="text-gray-600 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                No hay tramos disponibles para hoy. Por favor selecciona otra fecha.
              </p>
            ) : (
              <div className="space-y-3">
                {tramosData.map((tramo) => {
                  const estaDisponible = tramosDisponibles.some(t => t.id === tramo.id);
                  return (
                    <label
                      key={tramo.id}
                      className={`flex items-center p-4 border-2 rounded-lg transition ${
                        estaDisponible
                          ? 'cursor-pointer hover:bg-gray-50 border-gray-300'
                          : 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tramo"
                        value={tramo.id}
                        checked={tramoInstalacion === tramo.id}
                        onChange={(e) => onTramoChange(e.target.value)}
                        disabled={!estaDisponible}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-900 font-medium">
                        {tramo.id.toUpperCase()}. {tramo.inicio} - {tramo.fin}
                      </span>
                      {!estaDisponible && (
                        <span className="ml-auto text-sm text-gray-500">No disponible</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tipo de Campaña */}
          <TipoCampanaSelector
            value={tipoCampana}
            onChange={onTipoCampanaChange}
          />

          {/* Sección de Documentos */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Documentos</h3>

            <FileUpload
              label="RUT Frontal"
              categoria="rut-frontal"
              uploadedUrls={rutFrontalUrls}
              onUploadComplete={onRutFrontalUrlsChange}
              rut={rut}
              multiple={false}
            />

            <FileUpload
              label="RUT Posterior"
              categoria="rut-posterior"
              uploadedUrls={rutPosteriorUrls}
              onUploadComplete={onRutPosteriorUrlsChange}
              rut={rut}
              multiple={false}
            />

            <FileUpload
              label="Factibilidad (APP)"
              categoria="factibilidad-app"
              uploadedUrls={factibilidadUrls}
              onUploadComplete={onFactibilidadUrlsChange}
              rut={rut}
              multiple={true}
            />

            <FileUpload
              label="Otros Documentos"
              categoria="otros-documentos"
              uploadedUrls={otrosDocumentosUrls}
              onUploadComplete={onOtrosDocumentosUrlsChange}
              rut={rut}
              multiple={true}
            />
          </div>

          {/* Comentario del Vendedor */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Comentario del Vendedor
            </label>
            <textarea
              value={comentarioVendedor}
              onChange={(e) => handleComentarioChange(e.target.value)}
              placeholder="Escribe cualquier observación o comentario adicional..."
              rows={4}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none resize-none ${
                comentarioError
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {comentarioError && (
              <p className="mt-2 text-sm text-red-600">
                {comentarioError}
              </p>
            )}
          </div>

          {/* Botón Continuar */}
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Finalizar
          </button>
        </div>
      )}
    </div>
  );
}
