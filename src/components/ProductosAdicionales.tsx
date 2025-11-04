/**
 * @fileoverview Componente de sección para seleccionar productos adicionales y descuentos.
 * Este componente muestra dinámicamente decodificadores, extensores, canales premium y descuentos
 * según el segmento, tipo de venta, y servicios seleccionados. Incluye lógica compleja de filtrado
 * y gestión de cantidades para decos y extensores (hasta 3 unidades). Los productos se organizan
 * en categorías y se aplican reglas de negocio específicas para cada tipo.
 * Datos obtenidos desde Supabase.
 */

import { useMemo, useState, useEffect } from "react";
import { getAllProductosAdicionales, toDisplayFormat, type ProductoAdicional } from "../lib/supabaseQueries";

/**
 * @interface Adicional
 * @description Estructura de un producto adicional.
 *
 * @property {string} nombre - Nombre del producto adicional
 * @property {number} precio - Precio del producto (puede ser negativo para descuentos)
 * @property {number} descuento - Porcentaje de descuento aplicable (0-100)
 */
interface Adicional {
  nombre: string;
  precio: number;
  descuento: number;
}

/**
 * @interface AdicionalesConCantidad
 * @description Mapeo de nombre de adicional a cantidad seleccionada.
 *
 * @property {number} [key] - Nombre del adicional como clave, cantidad como valor
 */
interface AdicionalesConCantidad {
  [key: string]: number; // nombre del adicional -> cantidad (0 si no está seleccionado)
}

/**
 * @interface ProductosAdicionalesProps
 * @description Propiedades del componente ProductosAdicionales que controla los adicionales.
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
 * @property {string[]} selectedAdicionales - Array de nombres de adicionales seleccionados (con cantidades si aplica)
 * @property {function} onAdicionalesChange - Handler para cambios en los adicionales seleccionados
 */
interface ProductosAdicionalesProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onContinue: () => void;
  canContinue: boolean;
  canExpand?: boolean;
  segmento: string;
  tipoVenta: string;
  hasInternet: boolean;
  hasTelevision: boolean;
  selectedAdicionales: string[];
  onAdicionalesChange: (adicionales: string[]) => void;
}

/**
 * @component ProductosAdicionales
 * @description Sección del formulario que permite seleccionar productos adicionales y descuentos.
 * Es la cuarta sección del formulario y filtra dinámicamente los productos disponibles según múltiples
 * criterios del plan seleccionado.
 *
 * @param {ProductosAdicionalesProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección colapsable con selección de productos adicionales
 *
 * @description
 * Categorías de productos mostradas (según disponibilidad):
 * 1. Decodificadores:
 *    - Se muestran solo si hasTelevision === true
 *    - Decos Smart HD (con "HD" en el nombre): Solo para planes con 2 o más RGU
 *    - Decos sin HD: Solo para plan de solo TV (sin Internet)
 *    - Permite seleccionar cantidad (1-3 unidades) con controles +/-
 *
 * 2. Extensores:
 *    - Se muestran solo si hasInternet === true
 *    - Permite seleccionar cantidad (1-3 unidades) con controles +/-
 *
 * 3. Canales Premium:
 *    - Se muestran solo si hasTelevision === true
 *    - Canales con descuento o gratis: Solo para tipoVenta === 'nueva'
 *    - Canales regulares: Para todos los clientes
 *
 * 4. Descuentos en Primera Boleta:
 *    - Descuento $10.000: Solo para segmento 'residencial', tipoVenta 'nueva', con 2+ RGU
 *    - Descuento $5.000: Solo para segmento 'negocio', tipoVenta 'nueva'
 *
 * Validaciones aplicadas:
 * - Las cantidades de decos y extensores están limitadas entre 1 y 3 unidades
 * - Los adicionales se pueden seleccionar o deseleccionar libremente (opcional)
 *
 * Lógica condicional:
 * - El componente calcula dinámicamente qué categorías mostrar usando useMemo
 * - tiene2RGUoMas: Se activa si hasInternet && hasTelevision
 * - tiene3Play: Se activa si hasInternet && hasTelevision (igual que 2RGU)
 * - Los productos se filtran según:
 *   - Servicios seleccionados (hasInternet, hasTelevision)
 *   - Segmento del cliente (residencial/negocio)
 *   - Tipo de venta (nueva/paquetizacion)
 *   - Número de RGUs (servicios contratados)
 * - Si no hay productos disponibles, muestra mensaje informativo
 * - Los decos y extensores que requieren cantidad muestran controles adicionales al seleccionarse
 * - El formato de almacenamiento incluye la cantidad: "Nombre del Producto (2)"
 *
 * Funciones auxiliares:
 * - requiereCantidad(): Detecta si un producto necesita selector de cantidad
 * - incrementarCantidad(): Aumenta cantidad hasta máximo 3
 * - decrementarCantidad(): Reduce cantidad hasta mínimo 1
 * - formatPrecio(): Formatea precios en formato chileno (CLP)
 *
 * Componentes hijos utilizados:
 * - Ninguno (usa elementos HTML nativos para checkboxes y contadores)
 *
 * @example
 * ```tsx
 * <ProductosAdicionales
 *   isCollapsed={false}
 *   onToggle={() => setIsCollapsed(!isCollapsed)}
 *   onContinue={() => handleContinue()}
 *   canContinue={true}
 *   canExpand={true}
 *   segmento="residencial"
 *   tipoVenta="nueva"
 *   hasInternet={true}
 *   hasTelevision={true}
 *   selectedAdicionales={["Extensor WiFi (2)", "HBO Max", "Descuento Primera Boleta $10.000"]}
 *   onAdicionalesChange={(adicionales) => setSelectedAdicionales(adicionales)}
 * />
 * ```
 */
export function ProductosAdicionales({
  isCollapsed,
  onToggle,
  onContinue,
  canContinue,
  canExpand = true,
  segmento,
  tipoVenta,
  hasInternet,
  hasTelevision,
  selectedAdicionales,
  onAdicionalesChange,
}: ProductosAdicionalesProps) {
  const isClienteNuevo = tipoVenta === 'nueva';
  const isResidencial = segmento === 'residencial';
  const isNegocio = segmento === 'negocio';
  const tiene2RGUoMas = (hasInternet && hasTelevision) || (hasInternet && hasTelevision);
  const tiene3Play = hasInternet && hasTelevision;

  // Estado local para cantidades de decos y extensores
  const [cantidades, setCantidades] = useState<AdicionalesConCantidad>({});
  const [productosDB, setProductosDB] = useState<ProductoAdicional[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar productos adicionales desde Supabase
  useEffect(() => {
    async function fetchProductos() {
      setLoading(true)
      try {
        const data = await getAllProductosAdicionales()
        setProductosDB(data)
      } catch (error) {
        console.error('Error cargando productos adicionales:', error)
        console.error('Detalle del error:', JSON.stringify(error, null, 2))
        setProductosDB([])
      } finally {
        setLoading(false)
      }
    }
    fetchProductos()
  }, [])

  // Función para verificar si un item es deco o extensor
  const requiereCantidad = (itemNombre: string) => {
    return itemNombre.toLowerCase().includes("d-box") || itemNombre.toLowerCase().includes("extensor");
  };

  // Actualizar cantidades cuando cambian los adicionales seleccionados
  useEffect(() => {
    const nuevasCantidades: AdicionalesConCantidad = {};
    selectedAdicionales.forEach(item => {
      // Extraer nombre sin cantidad
      const nombreSinCantidad = item.replace(/\s*\(\d+\)$/, '');
      if (requiereCantidad(nombreSinCantidad)) {
        // Extraer cantidad del string si existe, sino usar la cantidad guardada o 1
        const match = item.match(/\((\d+)\)$/);
        const cantidadEnString = match ? parseInt(match[1]) : null;
        nuevasCantidades[nombreSinCantidad] = cantidadEnString || cantidades[nombreSinCantidad] || 1;
      }
    });
    setCantidades(nuevasCantidades);
  }, [selectedAdicionales]);

  // Determinar qué productos mostrar según las reglas
  const adicionalesDisponibles = useMemo(() => {
    if (productosDB.length === 0) return []

    const categorias: { titulo: string; items: Adicional[] }[] = [];

    // Convertir ProductoAdicional a Adicional para compatibilidad
    const convertirProducto = (prod: ProductoAdicional): Adicional => ({
      nombre: toDisplayFormat(prod.nombre),
      precio: prod.precio,
      descuento: prod.descuento
    })

    // DECODIFICADORES
    if (hasTelevision) {
      const decosDB = productosDB.filter(p => p.categoria === 'decodificadores')
      const decos = decosDB.filter((deco) => {
        // Solo planes que incluyen TV deben listar decos smart hd (con "HD" en el nombre)
        if (deco.nombre.includes("hd")) {
          return tiene2RGUoMas || tiene3Play;
        }
        // Solo el plan de solo TV debe mostrar los decos que no son HD
        if (!deco.nombre.includes("hd")) {
          return hasTelevision && !hasInternet;
        }
        return false;
      }).map(convertirProducto);

      if (decos.length > 0) {
        categorias.push({ titulo: "Decodificadores", items: decos });
      }
    }

    // EXTENSORES
    // Solo los planes que incluyen internet deben listar los extensores
    if (hasInternet) {
      const extensoresDB = productosDB.filter(p => p.categoria === 'extensores')
      const extensores = extensoresDB.map(convertirProducto);
      if (extensores.length > 0) {
        categorias.push({ titulo: "Extensores", items: extensores });
      }
    }

    // CANALES
    if (hasTelevision) {
      const canalesDB = productosDB.filter(p => p.categoria === 'canales')
      const canales = canalesDB.filter((canal) => {
        // Canales con descuento (descuento > 0) o gratis (precio === 0) solo para clientes nuevos
        const tieneDescuento = canal.descuento > 0;
        const esGratis = canal.precio === 0;

        if (tieneDescuento || esGratis) {
          return isClienteNuevo;
        }

        // Canales normales para todos
        return true;
      }).map(convertirProducto);

      if (canales.length > 0) {
        categorias.push({ titulo: "Canales Premium", items: canales });
      }
    }

    // DESCUENTOS
    const descuentosDB = productosDB.filter(p => p.categoria === 'descuentos')
    const descuentos = descuentosDB.filter((descuento) => {
      // Descuento de $10.000: Solo planes residenciales a clientes nuevos con 2+ RGU
      if (descuento.precio === -10000) {
        return isResidencial && isClienteNuevo && tiene2RGUoMas;
      }

      // Descuento de $5.000: Solo planes negocio a clientes nuevos
      if (descuento.precio === -5000) {
        return isNegocio && isClienteNuevo;
      }

      return false;
    }).map(convertirProducto);

    if (descuentos.length > 0) {
      categorias.push({ titulo: "Descuentos en Primera Boleta", items: descuentos });
    }

    return categorias;
  }, [productosDB, segmento, tipoVenta, hasInternet, hasTelevision, tiene2RGUoMas, tiene3Play, isClienteNuevo, isResidencial, isNegocio]);

  const handleCheckboxChange = (itemNombre: string, checked: boolean) => {
    if (checked) {
      // Para items con cantidad, agregar con " (1)" al final
      const itemConCantidad = requiereCantidad(itemNombre) ? `${itemNombre} (1)` : itemNombre;
      onAdicionalesChange([...selectedAdicionales, itemConCantidad]);
      // Si es deco o extensor, inicializar cantidad en 1
      if (requiereCantidad(itemNombre)) {
        setCantidades(prev => ({ ...prev, [itemNombre]: 1 }));
      }
    } else {
      // Filtrar cualquier versión del item (con o sin cantidad)
      onAdicionalesChange(selectedAdicionales.filter((item) => !item.startsWith(itemNombre)));
      // Limpiar la cantidad
      if (requiereCantidad(itemNombre)) {
        setCantidades(prev => {
          const nueva = { ...prev };
          delete nueva[itemNombre];
          return nueva;
        });
      }
    }
  };

  const incrementarCantidad = (itemNombre: string) => {
    const nuevaCantidad = Math.min((cantidades[itemNombre] || 1) + 1, 3);
    setCantidades(prev => ({
      ...prev,
      [itemNombre]: nuevaCantidad
    }));

    // Actualizar el array de adicionales con la nueva cantidad
    const nuevosAdicionales = selectedAdicionales.map(item => {
      // Remover la cantidad actual del nombre
      const nombreSinCantidad = item.replace(/\s*\(\d+\)$/, '');
      return nombreSinCantidad === itemNombre ? `${itemNombre} (${nuevaCantidad})` : item;
    });
    onAdicionalesChange(nuevosAdicionales);
  };

  const decrementarCantidad = (itemNombre: string) => {
    const nuevaCantidad = Math.max((cantidades[itemNombre] || 1) - 1, 1);
    setCantidades(prev => ({
      ...prev,
      [itemNombre]: nuevaCantidad
    }));

    // Actualizar el array de adicionales con la nueva cantidad
    const nuevosAdicionales = selectedAdicionales.map(item => {
      // Remover la cantidad actual del nombre
      const nombreSinCantidad = item.replace(/\s*\(\d+\)$/, '');
      return nombreSinCantidad === itemNombre ? `${itemNombre} (${nuevaCantidad})` : item;
    });
    onAdicionalesChange(nuevosAdicionales);
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(precio);
  };

  // Si no hay categorías disponibles, mostrar mensaje
  const hayAdicionales = adicionalesDisponibles.length > 0;

  return (
    <div className="mb-8 border-2 border-gray-200 rounded-lg">
      {/* Header de la sección */}
      <div
        onClick={canExpand ? onToggle : undefined}
        className={`flex justify-between items-center p-4 transition rounded-t-lg ${
          canExpand ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900">Productos Adicionales</h2>
        <button className="text-gray-600 text-2xl">
          {isCollapsed ? "+" : "−"}
        </button>
      </div>

      {/* Contenido de la sección */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-gray-200">
          {loading ? (
            <p className="text-gray-600 text-center py-4">
              Cargando productos adicionales...
            </p>
          ) : !hayAdicionales ? (
            <p className="text-gray-600 text-center py-4">
              No hay productos adicionales disponibles para este plan
            </p>
          ) : (
            <>
              {adicionalesDisponibles.map((categoria, categoriaIndex) => (
                <div key={categoriaIndex} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {categoria.titulo}
                  </h3>
                  <div className="space-y-2">
                    {categoria.items.map((item, itemIndex) => {
                      const isChecked = selectedAdicionales.some(sel => sel.startsWith(item.nombre));
                      const needsCounter = requiereCantidad(item.nombre);
                      const cantidad = cantidades[item.nombre] || 1;

                      return (
                        <div
                          key={itemIndex}
                          className="border-2 border-gray-300 rounded-lg overflow-hidden"
                        >
                          <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition">
                            <div className="flex items-center flex-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCheckboxChange(item.nombre, e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-3 text-gray-900">{item.nombre}</span>
                            </div>
                            <div className="ml-4 text-right">
                              <span className={`font-semibold ${
                                item.precio < 0 ? 'text-green-600' : item.precio === 0 ? 'text-gray-600' : 'text-blue-600'
                              }`}>
                                {item.precio === 0
                                  ? 'Gratis'
                                  : item.descuento > 0
                                    ? formatPrecio(item.precio * (1 - item.descuento / 100) * (needsCounter ? cantidad : 1))
                                    : formatPrecio(item.precio * (needsCounter ? cantidad : 1))
                                }
                              </span>
                            </div>
                          </label>

                          {/* Contador de cantidad (solo para decos y extensores) */}
                          {isChecked && needsCounter && (
                            <div className="px-3 pb-3 flex items-center justify-center gap-3 bg-gray-50">
                              <button
                                type="button"
                                onClick={() => decrementarCantidad(item.nombre)}
                                disabled={cantidad <= 1}
                                className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                <span className="text-lg font-bold text-gray-700">−</span>
                              </button>
                              <span className="text-lg font-semibold text-gray-900 min-w-[60px] text-center">
                                {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}
                              </span>
                              <button
                                type="button"
                                onClick={() => incrementarCantidad(item.nombre)}
                                disabled={cantidad >= 3}
                                className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                <span className="text-lg font-bold text-gray-700">+</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Botón Continuar */}
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
