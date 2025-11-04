/**
 * @fileoverview Componente de sección para seleccionar los servicios y plan de internet/TV/telefonía.
 * Este componente maneja la selección de servicios (Internet, Televisión, Telefonía), sus características
 * específicas según el segmento (velocidad de internet y tipo de TV para residencial), y muestra los planes
 * disponibles según la combinación seleccionada. Incluye lógica especial para paquetización que fuerza los
 * tres servicios.
 */

import { useEffect } from "react";
import { PlanSelector } from "./PlanSelector";

/**
 * @interface PlanProps
 * @description Propiedades del componente Plan que controla la selección de servicios y planes.
 *
 * @property {boolean} isCollapsed - Estado de colapso de la sección
 * @property {function} onToggle - Callback para alternar el estado de colapso
 * @property {function} onContinue - Callback al presionar el botón Continuar
 * @property {boolean} canContinue - Indica si el botón Continuar debe estar habilitado
 * @property {boolean} [canExpand] - Indica si la sección puede expandirse/colapsarse (default: true)
 * @property {string} segmento - Tipo de cliente: 'residencial' o 'negocio'
 * @property {string} tipoVenta - Tipo de venta: 'nueva' o 'paquetizacion'
 * @property {boolean} hasInternet - Indica si el servicio de Internet está seleccionado
 * @property {boolean} hasTelevision - Indica si el servicio de Televisión está seleccionado
 * @property {boolean} hasTelefonia - Indica si el servicio de Telefonía está seleccionado
 * @property {function} onInternetChange - Handler para cambios en la selección de Internet
 * @property {function} onTelevisionChange - Handler para cambios en la selección de Televisión
 * @property {function} onTelefoniaChange - Handler para cambios en la selección de Telefonía
 * @property {string} velocidadInternet - Velocidad de internet seleccionada (solo residencial): '500MB', '600MB', '800MB', '940MB'
 * @property {function} onVelocidadInternetChange - Handler para cambios en la velocidad de internet
 * @property {string} tipoTelevision - Tipo de TV seleccionado (solo residencial): 'Inicia', 'Plus', 'Premium'
 * @property {function} onTipoTelevisionChange - Handler para cambios en el tipo de televisión
 * @property {string} selectedPlan - Nombre del plan seleccionado
 * @property {function} onPlanChange - Handler para cambios en el plan seleccionado
 */
interface PlanProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onContinue: () => void;
  canContinue: boolean;
  canExpand?: boolean;
  marca: string;
  segmento: string;
  tipoVenta: string;
  // Estados de servicios
  hasInternet: boolean;
  hasTelevision: boolean;
  hasTelefonia: boolean;
  onInternetChange: (value: boolean) => void;
  onTelevisionChange: (value: boolean) => void;
  onTelefoniaChange: (value: boolean) => void;
  // Características de Internet (solo residencial)
  velocidadInternet: string;
  onVelocidadInternetChange: (value: string) => void;
  // Características de TV (solo residencial)
  tipoTelevision: string;
  onTipoTelevisionChange: (value: string) => void;
  // Plan seleccionado
  selectedPlan: string;
  onPlanChange: (value: string) => void;
}

/**
 * @component Plan
 * @description Sección del formulario que permite seleccionar los servicios y configurar el plan deseado.
 * Es la tercera sección del formulario y adapta sus opciones según el segmento y tipo de venta.
 *
 * @param {PlanProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección colapsable con selección de servicios y planes
 *
 * @description
 * Campos incluidos:
 * - Checkboxes de servicios:
 *   - Internet (con sub-opciones de velocidad para residencial)
 *   - Televisión (con sub-opciones de tipo para residencial)
 *   - Telefonía
 *
 * - Para segmento 'residencial' con Internet seleccionado:
 *   - Radio buttons de velocidad: 500MB, 600MB, 800MB, 940MB
 *
 * - Para segmento 'residencial' con Televisión seleccionada:
 *   - Radio buttons de tipo: Inicia, Plus, Premium
 *
 * - Selector de planes: Muestra planes disponibles según servicios y características seleccionadas
 *
 * Validaciones aplicadas:
 * - Al menos un servicio debe estar seleccionado para mostrar planes
 * - Si es residencial y tiene Internet, debe seleccionar velocidad
 * - Si es residencial y tiene Televisión, debe seleccionar tipo
 * - Un plan debe ser seleccionado para poder continuar
 *
 * Lógica condicional:
 * - Si tipoVenta === 'paquetizacion':
 *   - Los tres servicios se activan automáticamente mediante useEffect
 *   - Los checkboxes de servicios se deshabilitan (no pueden desmarcarse)
 * - Las sub-opciones de velocidad solo se muestran si:
 *   - hasInternet === true
 *   - segmento === 'residencial'
 * - Las sub-opciones de tipo TV solo se muestran si:
 *   - hasTelevision === true
 *   - segmento === 'residencial'
 * - El componente PlanSelector solo se muestra cuando shouldShowPlans() retorna true:
 *   - Debe haber al menos un servicio seleccionado
 *   - Si tiene Internet (residencial), debe tener velocidad seleccionada
 *   - Si tiene TV (residencial), debe tener tipo seleccionado
 * - Para segmento 'negocio', no se muestran sub-opciones de velocidad ni tipo TV
 *
 * Componentes hijos utilizados:
 * - PlanSelector: Componente que muestra y gestiona la selección de planes según los servicios
 *
 * @example
 * ```tsx
 * <Plan
 *   isCollapsed={false}
 *   onToggle={() => setIsCollapsed(!isCollapsed)}
 *   onContinue={() => handleContinue()}
 *   canContinue={isPlanValid}
 *   canExpand={true}
 *   segmento="residencial"
 *   tipoVenta="nueva"
 *   hasInternet={true}
 *   hasTelevision={true}
 *   hasTelefonia={false}
 *   onInternetChange={(value) => setHasInternet(value)}
 *   onTelevisionChange={(value) => setHasTelevision(value)}
 *   onTelefoniaChange={(value) => setHasTelefonia(value)}
 *   velocidadInternet="500MB"
 *   onVelocidadInternetChange={(value) => setVelocidadInternet(value)}
 *   tipoTelevision="Plus"
 *   onTipoTelevisionChange={(value) => setTipoTelevision(value)}
 *   selectedPlan="Plan Dúo 500MB + TV Plus"
 *   onPlanChange={(value) => setSelectedPlan(value)}
 * />
 * ```
 */
export function Plan({
  isCollapsed,
  onToggle,
  onContinue,
  canContinue,
  canExpand = true,
  marca,
  segmento,
  tipoVenta,
  hasInternet,
  hasTelevision,
  hasTelefonia,
  onInternetChange,
  onTelevisionChange,
  onTelefoniaChange,
  velocidadInternet,
  onVelocidadInternetChange,
  tipoTelevision,
  onTipoTelevisionChange,
  selectedPlan,
  onPlanChange,
}: PlanProps) {
  const isResidencial = segmento === 'residencial';
  const isPaquetizacion = tipoVenta === 'paquetizacion';

  // Determinar si se deben mostrar los planes (sin requerir plan seleccionado)
  const shouldShowPlans = () => {
    // Debe haber al menos un servicio seleccionado
    if (!hasInternet && !hasTelevision && !hasTelefonia) {
      return false;
    }

    // Si es residencial y tiene internet, debe seleccionar velocidad
    if (isResidencial && hasInternet && !velocidadInternet) {
      return false;
    }

    // Si es residencial y tiene televisión, debe seleccionar tipo
    if (isResidencial && hasTelevision && !tipoTelevision) {
      return false;
    }

    return true;
  };

  // Si es paquetización, forzar todos los servicios a true
  useEffect(() => {
    if (isPaquetizacion) {
      if (!hasInternet) onInternetChange(true);
      if (!hasTelevision) onTelevisionChange(true);
      if (!hasTelefonia) onTelefoniaChange(true);
    }
  }, [isPaquetizacion]);

  const velocidades = ['500MB', '600MB', '800MB', '940MB'];
  const tiposTv = [
    { id: 'Inicia', nombre: 'Inicia' },
    { id: 'Plus', nombre: 'Plus' },
    { id: 'Premium', nombre: 'Premium' }
  ];

  return (
    <div className="mb-8 border-2 border-gray-200 rounded-lg">
      {/* Header de la sección */}
      <div
        onClick={canExpand ? onToggle : undefined}
        className={`flex justify-between items-center p-4 transition rounded-t-lg ${
          canExpand ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900">Plan</h2>
        <button className="text-gray-600 text-2xl">
          {isCollapsed ? "+" : "−"}
        </button>
      </div>

      {/* Contenido de la sección */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-gray-200">
          {/* Checkbox Internet */}
          <div className="mb-6">
            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={hasInternet}
                onChange={(e) => onInternetChange(e.target.checked)}
                disabled={isPaquetizacion}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900 font-medium">Internet</span>
            </label>

            {/* Sublista de velocidades (solo si tiene Internet y es residencial) */}
            {hasInternet && isResidencial && (
              <div className="mt-4 ml-8 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-3">Velocidad:</p>
                {velocidades.map((vel) => (
                  <label
                    key={vel}
                    className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      name="velocidad"
                      value={vel}
                      checked={velocidadInternet === vel}
                      onChange={(e) => onVelocidadInternetChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">{vel}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Checkbox Television */}
          <div className="mb-6">
            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={hasTelevision}
                onChange={(e) => onTelevisionChange(e.target.checked)}
                disabled={isPaquetizacion}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900 font-medium">Televisión</span>
            </label>

            {/* Sublista de tipos de TV (solo si tiene Television y es residencial) */}
            {hasTelevision && isResidencial && (
              <div className="mt-4 ml-8 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-3">Tipo:</p>
                {tiposTv.map((tipo) => (
                  <label
                    key={tipo.id}
                    className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      name="tipoTv"
                      value={tipo.id}
                      checked={tipoTelevision === tipo.id}
                      onChange={(e) => onTipoTelevisionChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">{tipo.nombre}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Checkbox Telefonía */}
          <div className="mb-6">
            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={hasTelefonia}
                onChange={(e) => onTelefoniaChange(e.target.checked)}
                disabled={isPaquetizacion}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900 font-medium">Telefonía</span>
            </label>
          </div>

          {/* Divisor visual */}
          {shouldShowPlans() && (
            <div className="my-6 border-t-2 border-gray-200"></div>
          )}

          {/* Selector de planes - se muestra cuando las características están completas */}
          {shouldShowPlans() && (
            <PlanSelector
              marca={marca}
              segmento={segmento}
              tipoVenta={tipoVenta}
              hasInternet={hasInternet}
              hasTelevision={hasTelevision}
              hasTelefonia={hasTelefonia}
              velocidadInternet={velocidadInternet}
              tipoTelevision={tipoTelevision}
              selectedPlan={selectedPlan}
              onPlanChange={onPlanChange}
            />
          )}

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
