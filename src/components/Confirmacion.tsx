/**
 * @fileoverview Componente de vista previa y confirmación del formulario EBSA.
 * Muestra un resumen de todos los datos ingresados antes del envío final.
 */

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTramosHorarios, type TramoHorario } from "../lib/supabaseQueries";

/**
 * @interface FormData
 *
 * Interfaz que define la estructura completa de datos del formulario EBSA.
 * Contiene todos los campos requeridos y opcionales para el registro de ventas.
 *
 * @property {string} selectedVendedor - Nombre del vendedor asignado
 * @property {string} [supervisor] - Nombre del supervisor (opcional)
 * @property {string} [tipoAgente] - Tipo de agente: 'fijo', 'honorarios', o 'canal' (opcional)
 * @property {string} selectedDistribuidor - Distribuidor seleccionado (EBSA, ETC, NETLINE, etc.)
 * @property {string} [selectedMarca] - Marca seleccionada si el distribuidor es EBSA (opcional)
 * @property {string} selectedCodigo - Código de vendedor o punto de venta
 * @property {string} selectedTipoValidacion - Tipo de validación: 'online' o 'offline'
 * @property {string} selectedSegmento - Segmento del cliente: 'residencial' o 'negocio'
 * @property {string} selectedTipoVenta - Tipo de venta: 'nueva', 'migracion', o 'upgrade'
 * @property {string} rut - RUT del cliente o representante legal
 * @property {string} nombres - Nombres del cliente
 * @property {string} apellidos - Apellidos del cliente
 * @property {string} fechaNacimiento - Fecha de nacimiento en formato YYYY-MM-DD
 * @property {string} numeroContacto - Número de teléfono de contacto
 * @property {string} email - Correo electrónico del cliente
 * @property {string} [nombreEmpresa] - Nombre de la empresa (solo para segmento negocio)
 * @property {string} [rutEmpresa] - RUT de la empresa (solo para segmento negocio)
 * @property {string} region - Región de instalación
 * @property {string} comuna - Comuna de instalación
 * @property {string} direccion - Dirección completa de instalación
 * @property {boolean} hasInternet - Indica si incluye servicio de Internet
 * @property {boolean} hasTelevision - Indica si incluye servicio de Televisión
 * @property {boolean} hasTelefonia - Indica si incluye servicio de Telefonía
 * @property {string} [velocidadInternet] - Velocidad contratada de Internet (opcional)
 * @property {string} [tipoTelevision] - Tipo de servicio de TV (opcional)
 * @property {string} selectedPlan - Plan seleccionado
 * @property {string[]} selectedAdicionales - Array de productos adicionales seleccionados
 * @property {string} fechaAgendamiento - Fecha agendada para instalación en formato YYYY-MM-DD
 * @property {string} tramoInstalacion - ID del tramo horario de instalación
 * @property {string} tipoCampana - Tipo de campaña de venta
 * @property {string} comentarioVendedor - Comentarios adicionales del vendedor
 */
interface FormData {
  selectedVendedor: string;
  supervisor?: string;
  tipoAgente?: string;
  selectedMarca: string;
  selectedCodigo: string;
  selectedSegmento: string;
  selectedTipoVenta: string;
  rut: string;
  nombres: string;
  apellidos: string;
  numeroContacto: string;
  email: string;
  nombreEmpresa?: string;
  rutEmpresa?: string;
  region: string;
  comuna: string;
  direccion: string;
  hasInternet: boolean;
  hasTelevision: boolean;
  hasTelefonia: boolean;
  velocidadInternet?: string;
  tipoTelevision?: string;
  selectedPlan: string;
  selectedAdicionales: string[];
  fechaAgendamiento: string;
  tramoInstalacion: string;
  comentarioVendedor: string;
  rutFrontalUrls?: string[];
  rutPosteriorUrls?: string[];
  factibilidadUrls?: string[];
  otrosDocumentosUrls?: string[];
  equipo?: string;
}

/**
 * @component Confirmacion
 *
 * Componente de vista previa y confirmación que muestra todos los datos del formulario
 * antes de enviarlos al backend. Permite al usuario revisar y validar la información
 * completa, con opciones para regresar y editar o confirmar el envío final.
 *
 * @description
 * Este componente es la última etapa del flujo del formulario y maneja:
 * - Recepción de datos del formulario mediante React Router state
 * - Formateo y presentación visual de todos los campos en formato de lista
 * - Envío de datos al backend mediante API REST
 * - Gestión de estados de carga y éxito/error del envío
 * - Limpieza de datos persistidos en localStorage tras envío exitoso
 * - Navegación de regreso al formulario o creación de nuevo formulario
 *
 * Estados que maneja:
 * - isSubmitting: Indicador de envío en progreso
 * - submitSuccess: Indica si el formulario fue enviado exitosamente
 * - submitError: Mensaje de error si el envío falla
 *
 * Lógica de negocio:
 * - Valida que existan datos antes de renderizar (redirige si no hay datos)
 * - Formatea fechas de YYYY-MM-DD a DD/MM/YYYY para visualización
 * - Traduce IDs de tramos horarios a formato legible (HH:MM - HH:MM)
 * - Agrupa servicios seleccionados en texto descriptivo
 * - Muestra campos condicionales según el tipo de segmento (negocio/residencial)
 *
 * Interacción con API:
 * - Endpoint: POST /api/submit-form
 * - Headers: Content-Type: application/json
 * - Body: Objeto FormData completo serializado
 * - Respuesta esperada: { success: boolean, message?: string }
 * - Manejo de errores de red y validación
 *
 * Persistencia en localStorage:
 * - Lee datos mediante location.state (no desde localStorage)
 * - Limpia localStorage ('ebsa-form-data') solo después de envío exitoso
 * - Si el usuario regresa al formulario, los datos persisten hasta el próximo envío exitoso
 *
 * Navegación:
 * - Redirige a '/' si no hay datos en location.state
 * - Botón "Regresar al Formulario": navega a '/' sin limpiar datos
 * - Botón "Crear Nuevo Formulario": limpia localStorage y navega a '/'
 * - Muestra pantalla de éxito tras envío exitoso con opción de nuevo formulario
 *
 * @returns {JSX.Element|null} Vista previa del formulario, pantalla de éxito, o null si no hay datos
 *
 * @example
 * // Navegación desde Form.tsx
 * import { useNavigate } from 'react-router-dom';
 *
 * function Form() {
 *   const navigate = useNavigate();
 *
 *   const handleFinalizar = () => {
 *     const formData = {
 *       selectedVendedor,
 *       selectedDistribuidor,
 *       // ... resto de campos
 *     };
 *     navigate('/confirmacion', { state: { formData } });
 *   };
 * }
 */
export function Confirmacion() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as FormData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tramosData, setTramosData] = useState<TramoHorario[]>([]);

  // Debug: verificar URLs recibidas
  console.log('📎 URLs de archivos en confirmación:', {
    rutFrontal: formData?.rutFrontalUrls,
    rutPosterior: formData?.rutPosteriorUrls,
    factibilidad: formData?.factibilidadUrls,
    otros: formData?.otrosDocumentosUrls
  });

  useEffect(() => {
    // Si no hay datos, redirigir al formulario
    if (!formData) {
      navigate("/");
    }

    // Cargar tramos horarios desde Supabase
    async function fetchTramos() {
      try {
        const data = await getTramosHorarios();
        setTramosData(data);
      } catch (error) {
        console.error('Error cargando tramos horarios:', error);
        setTramosData([]);
      }
    }
    fetchTramos();
  }, [formData, navigate]);

  if (!formData) {
    return null;
  }

  const formatServicios = () => {
    const servicios = [];
    if (formData.hasInternet) servicios.push("Internet");
    if (formData.hasTelevision) servicios.push("Televisión");
    if (formData.hasTelefonia) servicios.push("Telefonía");
    return servicios.join(", ");
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTramo = (tramoId: string) => {
    if (!tramoId) return '';
    const tramo = tramosData.find(t => t.id === tramoId);
    if (!tramo) return tramoId;
    return `${tramo.inicio} - ${tramo.fin}`;
  };

  const handleRegresar = () => {
    // Regresar al formulario sin limpiar los datos
    navigate("/");
  };

  const handleEnviarFormulario = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        // Limpiar localStorage después de enviar exitosamente
        localStorage.removeItem("ebsa-form-data");
      } else {
        setSubmitError(result.message || 'Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNuevoFormulario = () => {
    // Limpiar localStorage
    localStorage.removeItem("ebsa-form-data");
    navigate("/");
  };

  // Si el formulario fue enviado exitosamente, mostrar pantalla de éxito
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8 pb-6 border-b-2 border-green-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Formulario Enviado Exitosamente
              </h1>
              <p className="text-gray-600">
                Los datos han sido registrados correctamente
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={handleNuevoFormulario}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Crear Nuevo Formulario
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Encabezado de vista previa */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vista Previa del Formulario
            </h1>
            <p className="text-gray-600">
              Revisa los datos antes de enviar
            </p>
          </div>

          {/* Vista previa de los datos en lista */}
          <div className="bg-gray-50 rounded-lg p-6">
            <ul className="space-y-3">
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Vendedor:
                </span>
                <span className="text-gray-900">
                  {formData.selectedVendedor}
                </span>
              </li>
              {formData.tipoAgente && (
                <li className="flex border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700 w-1/3">
                    Tipo de Agente:
                  </span>
                  <span className="text-gray-900 capitalize">
                    {formData.tipoAgente}
                  </span>
                </li>
              )}
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Código:
                </span>
                <span className="text-gray-900">{formData.selectedCodigo}</span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Marca:
                </span>
                <span className="text-gray-900 capitalize">
                  {formData.selectedMarca}
                </span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Segmento:
                </span>
                <span className="text-gray-900 capitalize">
                  {formData.selectedSegmento}
                </span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Tipo de Venta:
                </span>
                <span className="text-gray-900 capitalize">
                  {formData.selectedTipoVenta}
                </span>
              </li>

              {formData.selectedSegmento === "negocio" && (
                <>
                  <li className="flex border-b border-gray-200 pb-2">
                    <span className="font-semibold text-gray-700 w-1/3">
                      RUT de la Empresa:
                    </span>
                    <span className="text-gray-900">{formData.rutEmpresa}</span>
                  </li>
                  <li className="flex border-b border-gray-200 pb-2">
                    <span className="font-semibold text-gray-700 w-1/3">
                      Nombre de la Empresa:
                    </span>
                    <span className="text-gray-900">
                      {formData.nombreEmpresa}
                    </span>
                  </li>
                </>
              )}

              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  {formData.selectedSegmento === "negocio" ? "RUT del Representante Legal:" : "RUT:"}
                </span>
                <span className="text-gray-900">{formData.rut}</span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Nombres:
                </span>
                <span className="text-gray-900">{formData.nombres}</span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Apellidos:
                </span>
                <span className="text-gray-900">{formData.apellidos}</span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Número de Contacto:
                </span>
                <span className="text-gray-900">{formData.numeroContacto}</span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Email:
                </span>
                <span className="text-gray-900">{formData.email}</span>
              </li>

              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Región:
                </span>
                <span className="text-gray-900 capitalize">
                  {formData.region}
                </span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Comuna:
                </span>
                <span className="text-gray-900">{formData.comuna}</span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Dirección:
                </span>
                <span className="text-gray-900">{formData.direccion}</span>
              </li>

              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Servicios:
                </span>
                <span className="text-gray-900">{formatServicios()}</span>
              </li>
              {formData.hasInternet && formData.velocidadInternet && (
                <li className="flex border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700 w-1/3">
                    Velocidad Internet:
                  </span>
                  <span className="text-gray-900">
                    {formData.velocidadInternet}
                  </span>
                </li>
              )}
              {formData.hasTelevision && formData.tipoTelevision && (
                <li className="flex border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700 w-1/3">
                    Tipo de TV:
                  </span>
                  <span className="text-gray-900">
                    {formData.tipoTelevision}
                  </span>
                </li>
              )}
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">Plan:</span>
                <span className="text-gray-900">{formData.selectedPlan}</span>
              </li>

              {formData.selectedAdicionales.length > 0 && (
                <li className="flex border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700 w-1/3 shrink-0">
                    Productos Adicionales:
                  </span>
                  <span className="text-gray-900 flex-1">
                    {formData.selectedAdicionales.join(", ")}
                  </span>
                </li>
              )}

              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Fecha de Agendamiento:
                </span>
                <span className="text-gray-900">
                  {formatFecha(formData.fechaAgendamiento)}
                </span>
              </li>
              <li className="flex border-b border-gray-200 pb-2">
                <span className="font-semibold text-gray-700 w-1/3">
                  Tramo de Instalación:
                </span>
                <span className="text-gray-900">
                  {formatTramo(formData.tramoInstalacion)}
                </span>
              </li>
              {formData.comentarioVendedor && (
                <li className="flex border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700 w-1/3">
                    Comentario del Vendedor:
                  </span>
                  <span className="text-gray-900">
                    {formData.comentarioVendedor}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Sección de Archivos Subidos */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📎 Documentos Adjuntos
            </h3>
            {((formData.rutFrontalUrls?.length ?? 0) > 0 ||
              (formData.rutPosteriorUrls?.length ?? 0) > 0 ||
              (formData.factibilidadUrls?.length ?? 0) > 0 ||
              (formData.otrosDocumentosUrls?.length ?? 0) > 0) ? (
              <ul className="space-y-2">
                {formData.rutFrontalUrls?.map((url, index) => (
                  <li key={`rut-frontal-${index}`} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-gray-700">RUT Frontal:</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-md">
                      {url.split('/').pop()}
                    </a>
                  </li>
                ))}
                {formData.rutPosteriorUrls?.map((url, index) => (
                  <li key={`rut-posterior-${index}`} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-gray-700">RUT Posterior:</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-md">
                      {url.split('/').pop()}
                    </a>
                  </li>
                ))}
                {formData.factibilidadUrls?.map((url, index) => (
                  <li key={`factibilidad-${index}`} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-gray-700">Factibilidad:</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-md">
                      {url.split('/').pop()}
                    </a>
                  </li>
                ))}
                {formData.otrosDocumentosUrls?.map((url, index) => (
                  <li key={`otros-${index}`} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-gray-700">Otros Documentos:</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-md">
                      {url.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">
                ⚠️ No se han adjuntado documentos a este formulario
              </p>
            )}
          </div>

          {/* Mensaje de error si hay alguno */}
          {submitError && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 font-medium">{submitError}</p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleEnviarFormulario}
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
            </button>
            <button
              onClick={handleRegresar}
              disabled={isSubmitting}
              className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Regresar al Formulario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
