/**
 * @fileoverview Componente de selección de planes con filtrado inteligente.
 * Filtra planes según segmento, servicios seleccionados y expande opciones de descuento.
 * Datos obtenidos desde Supabase.
 */

import { useMemo, useState, useEffect } from "react";
import { getPlanes, type Plan as PlanDB } from "../lib/supabaseQueries";

/**
 * Interfaz que define la estructura de un plan de servicios.
 * @interface Plan
 */
interface Plan {
  /** Nombre descriptivo del plan */
  nombre: string;
  /** Precio base del plan en CLP */
  precio: number;
  /** Monto de descuento nacional en CLP */
  descuento_nacional: number;
  /** Monto de descuento especial en CLP (opcional) */
  descuento_especial: number | null;
  /** Duración del contrato o plan */
  duracion: string;
  /** Número de servicios (RGU - Revenue Generating Units) */
  rgu: number;
  /** Servicios incluidos en el plan */
  servicios: {
    /** Configuración del servicio de internet */
    internet: {
      /** Si el plan incluye internet */
      activo: boolean;
      /** Velocidad del internet (ej: "500MB", "1GB") */
      velocidad: string | null;
    };
    /** Configuración del servicio de televisión */
    television: {
      /** Si el plan incluye TV */
      activo: boolean;
      /** Tipo de plan de TV (ej: "Inicia", "Plus", "Premium") */
      plan_tv: string | null;
    };
    /** Configuración del servicio de telefonía */
    telefonia: {
      /** Si el plan incluye telefonía */
      activo: boolean;
    };
  };
}

/**
 * Props para el componente PlanSelector.
 * @interface PlanSelectorProps
 */
interface PlanSelectorProps {
  /** Marca seleccionada: "VTR" o "Claro" */
  marca: string;
  /** Segmento del cliente: "residencial" o "negocio" */
  segmento: string;
  /** Tipo de venta: "nueva" o "paquetizacion" */
  tipoVenta: string;
  /** Si el cliente quiere servicio de internet */
  hasInternet: boolean;
  /** Si el cliente quiere servicio de televisión */
  hasTelevision: boolean;
  /** Si el cliente quiere servicio de telefonía */
  hasTelefonia: boolean;
  /** Velocidad de internet seleccionada (ej: "500MB") */
  velocidadInternet: string;
  /** Tipo de televisión seleccionada (ej: "Plus") */
  tipoTelevision: string;
  /** Nombre del plan seleccionado */
  selectedPlan: string;
  /** Callback que se ejecuta al seleccionar un plan */
  onPlanChange: (planNombre: string) => void;
}

/**
 * Componente de selección de planes con filtrado avanzado.
 * Filtra y muestra planes según servicios seleccionados, segmento y tipo de venta.
 *
 * @component
 * @param {PlanSelectorProps} props - Props del componente
 * @returns {JSX.Element} Lista de planes disponibles con radio buttons
 *
 * @example
 * <PlanSelector
 *   segmento="residencial"
 *   tipoVenta="nueva"
 *   hasInternet={true}
 *   hasTelevision={true}
 *   hasTelefonia={false}
 *   velocidadInternet="500MB"
 *   tipoTelevision="Plus"
 *   selectedPlan={planSeleccionado}
 *   onPlanChange={setPlanSeleccionado}
 * />
 *
 * @description
 * Lógica de filtrado:
 * 1. Selecciona archivo según segmento (residencial o negocio)
 * 2. Cuenta RGU (servicios activos) y determina categoría
 * 3. Filtra planes que coincidan con servicios seleccionados
 * 4. Para residencial: valida velocidad internet y tipo TV
 * 5. Expande planes con descuentos múltiples en opciones separadas
 * 6. Muestra precios con descuentos aplicados
 */
export function PlanSelector({
  marca,
  segmento,
  tipoVenta,
  hasInternet,
  hasTelevision,
  hasTelefonia,
  velocidadInternet,
  tipoTelevision,
  selectedPlan,
  onPlanChange,
}: PlanSelectorProps) {
  const [planesDB, setPlanesDB] = useState<PlanDB[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar planes desde Supabase
  useEffect(() => {
    async function fetchPlanes() {
      if (!segmento || !marca) {
        setPlanesDB([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const marcaLower = marca.toLowerCase() as 'vtr' | 'claro'
        const data = await getPlanes(marcaLower, segmento as 'residencial' | 'negocio' | 'convenio')
        setPlanesDB(data)
      } catch (error) {
        console.error('Error cargando planes:', error)
        console.error('Detalle del error:', JSON.stringify(error, null, 2))
        setPlanesDB([])
      } finally {
        setLoading(false)
      }
    }
    fetchPlanes()
  }, [marca, segmento])

  // Función para normalizar nombres de planes (Title Case)
  const normalizarNombre = (nombre: string): string => {
    return nombre
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Mantener siglas en mayúsculas
        if (word.match(/^[a-z]{2,3}$/i) && ['mb', 'gb', 'tv', 'rgu'].includes(word.toLowerCase())) {
          return word.toUpperCase();
        }
        // Primera letra mayúscula para el resto
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const planesDisponibles = useMemo(() => {
    if (planesDB.length === 0) return []

    // Contar servicios activos (RGU)
    const serviciosActivos = [hasInternet, hasTelevision, hasTelefonia].filter(Boolean).length

    // Determinar la categoría según tipo de venta
    let categoria: '1_rgu' | '2_rgu' | '3_rgu' | 'paquetizacion'
    if (tipoVenta === 'paquetizacion') {
      categoria = 'paquetizacion'
    } else {
      categoria = `${serviciosActivos}_rgu` as '1_rgu' | '2_rgu' | '3_rgu'
    }

    console.log('PlanSelector DEBUG:', {
      segmento,
      tipoVenta,
      serviciosActivos,
      categoria,
      hasInternet,
      hasTelevision,
      hasTelefonia,
      velocidadInternet,
      tipoTelevision
    })

    // Filtrar planes por categoría
    let planesFiltrados = planesDB.filter(plan => plan.categoria === categoria)
    console.log('Planes en categoría:', planesFiltrados.length)

    // Filtrar planes según características seleccionadas
    planesFiltrados = planesFiltrados.filter((planDB) => {
      console.log('Evaluando plan:', planDB.nombre, {
        planInternet: planDB.internet_activo,
        planTV: planDB.television_activa,
        planTelefonia: planDB.telefonia_activa,
        userInternet: hasInternet,
        userTV: hasTelevision,
        userTelefonia: hasTelefonia
      })

      // Verificar que los servicios del plan coincidan con los seleccionados
      if (planDB.internet_activo !== hasInternet) {
        console.log('Rechazado por Internet')
        return false
      }
      if (planDB.television_activa !== hasTelevision) {
        console.log('Rechazado por TV')
        return false
      }
      if (planDB.telefonia_activa !== hasTelefonia) {
        console.log('Rechazado por Telefonía')
        return false
      }

      // Si tiene Internet y es residencial, verificar velocidad
      if (hasInternet && segmento === 'residencial' && velocidadInternet) {
        if (planDB.internet_velocidad !== velocidadInternet.toLowerCase()) {
          console.log('Rechazado por velocidad')
          return false
        }
      }

      // Si tiene Televisión y es residencial, verificar tipo de TV
      if (hasTelevision && segmento === 'residencial' && tipoTelevision) {
        if (planDB.television_plan !== tipoTelevision.toLowerCase()) {
          console.log('Rechazado por tipo TV')
          return false
        }
      }

      console.log('Plan ACEPTADO:', planDB.nombre)
      return true
    })

    console.log('Planes filtrados:', planesFiltrados.length)

    // Convertir planes de DB a formato UI y expandir descuentos
    const planesExpandidos: Plan[] = []
    planesFiltrados.forEach((planDB) => {
      const tieneDescuentoNacional = planDB.descuento_nacional !== null && planDB.descuento_nacional > 0
      const tieneDescuentoEspecial = planDB.descuento_especial !== null && planDB.descuento_especial > 0

      // Función helper para convertir plan DB a formato UI
      const convertirPlan = (nombre: string, descuentoNacional: number, descuentoEspecial: number | null): Plan => ({
        nombre: `${normalizarNombre(nombre)} - ${marca.toUpperCase()}`,
        precio: planDB.precio,
        descuento_nacional: descuentoNacional,
        descuento_especial: descuentoEspecial,
        duracion: planDB.duracion,
        rgu: planDB.rgu,
        servicios: {
          internet: {
            activo: planDB.internet_activo,
            velocidad: planDB.internet_velocidad ? planDB.internet_velocidad.toUpperCase() : null
          },
          television: {
            activo: planDB.television_activa,
            plan_tv: planDB.television_plan ? planDB.television_plan.charAt(0).toUpperCase() + planDB.television_plan.slice(1) : null
          },
          telefonia: {
            activo: planDB.telefonia_activa
          }
        }
      })

      // Si tiene descuento nacional, crear versión con ese descuento
      if (tieneDescuentoNacional) {
        planesExpandidos.push(convertirPlan(
          `${planDB.nombre} (Descuento Nacional)`,
          planDB.descuento_nacional!,
          null
        ))
      }

      // Si tiene descuento especial, crear versión con ese descuento
      if (tieneDescuentoEspecial) {
        planesExpandidos.push(convertirPlan(
          `${planDB.nombre} (Descuento Especial)`,
          0,
          planDB.descuento_especial
        ))
      }

      // Si no tiene ningún descuento, agregar el plan sin modificar
      if (!tieneDescuentoNacional && !tieneDescuentoEspecial) {
        planesExpandidos.push(convertirPlan(
          planDB.nombre,
          planDB.descuento_nacional || 0,
          planDB.descuento_especial
        ))
      }
    })

    console.log('Planes expandidos:', planesExpandidos.length)
    return planesExpandidos
  }, [planesDB, tipoVenta, hasInternet, hasTelevision, hasTelefonia, velocidadInternet, tipoTelevision, segmento])

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(precio);
  };

  const calcularPrecioFinal = (plan: Plan) => {
    const descuento = plan.descuento_especial || plan.descuento_nacional;
    return plan.precio - descuento;
  };

  if (loading) {
    return (
      <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <p className="text-gray-600 text-center">
          Cargando planes disponibles...
        </p>
      </div>
    )
  }

  if (planesDisponibles.length === 0) {
    return (
      <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-center">
          No hay planes disponibles para la configuración seleccionada
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        Planes Disponibles ({planesDisponibles.length})
      </label>
      <div className="space-y-3">
        {planesDisponibles.map((plan, index) => (
          <label
            key={index}
            className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedPlan === plan.nombre
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                name="plan"
                value={plan.nombre}
                checked={selectedPlan === plan.nombre}
                onChange={(e) => onPlanChange(e.target.value)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{plan.nombre}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Duración: {plan.duracion}</p>
                  </div>
                  {segmento === 'residencial' && (
                    <div className="text-right">
                      {plan.precio > 0 && (
                        <>
                          <p className="text-sm text-gray-600">
                            Precio: <span className="line-through">{formatPrecio(plan.precio)}</span>
                          </p>
                          {(plan.descuento_nacional > 0 || plan.descuento_especial) && (
                            <p className="text-sm text-green-600 font-medium">
                              Descuento: -{formatPrecio(plan.descuento_especial || plan.descuento_nacional)}
                            </p>
                          )}
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            Total: {formatPrecio(calcularPrecioFinal(plan))}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Servicios incluidos */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {plan.servicios.internet.activo && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Internet {plan.servicios.internet.velocidad}
                    </span>
                  )}
                  {plan.servicios.television.activo && (
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      TV {plan.servicios.television.plan_tv || ''}
                    </span>
                  )}
                  {plan.servicios.telefonia.activo && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Telefonía
                    </span>
                  )}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
