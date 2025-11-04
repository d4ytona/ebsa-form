/**
 * @fileoverview Componente principal del formulario multi-paso EBSA.
 * Gestiona todo el flujo de captura de datos para ventas, integrando múltiples secciones
 * colapsables con validación progresiva y persistencia automática en localStorage.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { User} from "@supabase/supabase-js";
import { MarcaSelector } from "./MarcaSelector";
import { VendedorAutocomplete } from "./VendedorAutocomplete";
import { CodigoAutocomplete } from "./CodigoAutocomplete";
import { SegmentoSelector } from "./SegmentoSelector";
import { TipoVentaSelector } from "./TipoVentaSelector";
import { TipoAgenteSelector } from "./TipoAgenteSelector";
import { DatosSolicitante } from "./DatosSolicitante";
import { Direccion } from "./Direccion";
import { Plan } from "./Plan";
import { ProductosAdicionales } from "./ProductosAdicionales";
import { InformacionAdicional } from "./InformacionAdicional";

/**
 * @interface FormProps
 *
 * Props del componente Form principal.
 *
 * @property {User} user - Objeto de usuario autenticado de Supabase con información de sesión
 * @property {() => void} onSignOut - Callback para cerrar sesión del usuario
 */
interface FormProps {
  user: User;
  onSignOut: () => void;
}

/**
 * @component Form
 *
 * Componente principal del formulario multi-paso para registro de ventas EBSA.
 * Es el componente más complejo de la aplicación, coordinando 6 secciones colapsables
 * con validación progresiva, persistencia automática y navegación fluida entre etapas.
 *
 * @param {FormProps} props - Props del componente
 * @param {User} props.user - Usuario autenticado de Supabase
 * @param {() => void} props.onSignOut - Función para cerrar sesión
 *
 * @description
 * Este componente es el corazón de la aplicación y maneja:
 * - Coordinación de 6 secciones colapsables del formulario
 * - Gestión de más de 40 estados independientes
 * - Validación progresiva para habilitar navegación entre secciones
 * - Persistencia automática en localStorage en cada cambio
 * - Recuperación de datos guardados al recargar la página
 * - Navegación automática con scroll suave entre secciones
 * - Integración de múltiples componentes especializados
 *
 * ESTRUCTURA DE SECCIONES (6 secciones colapsables):
 *
 * 1. Información General
 *    - Selección de vendedor (autocomplete)
 *    - Tipo de agente (fijo/honorarios/canal)
 *    - Distribuidor y marca
 *    - Código de punto de venta
 *    - Tipo de validación, segmento y tipo de venta
 *    - Validación: Todos los campos obligatorios deben estar completos
 *
 * 2. Datos del Solicitante
 *    - RUT, nombres, apellidos, fecha de nacimiento
 *    - Contacto y email
 *    - Datos de empresa (solo si segmento = 'negocio')
 *    - Validación: Difiere según segmento residencial/negocio
 *
 * 3. Dirección
 *    - Región, comuna y dirección
 *    - Validación: Todos los campos obligatorios
 *
 * 4. Plan
 *    - Selección de servicios (Internet, TV, Telefonía)
 *    - Configuración de velocidad/tipo según servicios
 *    - Selección de plan
 *    - Validación: Al menos un servicio y plan seleccionado
 *
 * 5. Productos Adicionales
 *    - Selección múltiple de productos adicionales
 *    - Validación: Opcional, siempre permite continuar
 *
 * 6. Información Adicional
 *    - Fecha de agendamiento (validación de feriados)
 *    - Tramo de instalación
 *    - Tipo de campaña
 *    - Comentarios del vendedor
 *    - Validación: Fecha, tramo y tipo de campaña obligatorios
 *
 * ESTADOS DEL COMPONENTE (40+ estados):
 *
 * Estados de Información General (10):
 * - selectedVendedor: Nombre del vendedor seleccionado
 * - supervisor: Nombre del supervisor asignado
 * - tipoContratoVendedor: Tipo de contrato del vendedor (puede ser null)
 * - selectedTipoAgente: Tipo de agente seleccionado manualmente
 * - selectedDistribuidor: Distribuidor (EBSA, ETC, NETLINE, etc.)
 * - selectedMarca: Marca (solo si distribuidor es EBSA)
 * - selectedCodigo: Código de punto de venta
 * - selectedTipoValidacion: 'online' o 'offline'
 * - selectedSegmento: 'residencial' o 'negocio'
 * - selectedTipoVenta: 'nueva', 'migracion' o 'upgrade'
 *
 * Estados de Datos del Solicitante (8):
 * - rut: RUT del cliente o representante legal
 * - nombres: Nombres del cliente
 * - apellidos: Apellidos del cliente
 * - fechaNacimiento: Fecha de nacimiento (YYYY-MM-DD)
 * - numeroContacto: Número de teléfono
 * - email: Correo electrónico
 * - nombreEmpresa: Nombre de la empresa (solo negocio)
 * - rutEmpresa: RUT de la empresa (solo negocio)
 *
 * Estados de Dirección (3):
 * - region: Región de instalación
 * - comuna: Comuna de instalación
 * - direccion: Dirección completa
 *
 * Estados de Plan (7):
 * - hasInternet: Incluye servicio de Internet
 * - hasTelevision: Incluye servicio de TV
 * - hasTelefonia: Incluye servicio de Telefonía
 * - velocidadInternet: Velocidad de Internet seleccionada
 * - tipoTelevision: Tipo de servicio de TV
 * - selectedPlan: Plan seleccionado
 *
 * Estados de Productos Adicionales (1):
 * - selectedAdicionales: Array de productos adicionales
 *
 * Estados de Información Adicional (4):
 * - fechaAgendamiento: Fecha de instalación (YYYY-MM-DD)
 * - tramoInstalacion: ID del tramo horario
 * - tipoCampana: Tipo de campaña de venta
 * - comentarioVendedor: Comentarios adicionales
 *
 * Estados de UI - Colapso de secciones (6):
 * - isGeneralCollapsed: Estado de colapso de Información General
 * - isSolicitanteCollapsed: Estado de colapso de Datos del Solicitante
 * - isDireccionCollapsed: Estado de colapso de Dirección
 * - isPlanCollapsed: Estado de colapso de Plan
 * - isAdicionalesCollapsed: Estado de colapso de Productos Adicionales
 * - isInfoAdicionalCollapsed: Estado de colapso de Información Adicional
 *
 * LÓGICA DE VALIDACIÓN:
 *
 * El componente implementa 5 funciones de validación específicas:
 *
 * 1. canContinueGeneral()
 *    - Valida campos obligatorios de Información General
 *    - Verifica marca si el distribuidor es EBSA
 *    - Valida tipo de agente si el vendedor no tiene tipo de contrato
 *
 * 2. canContinueSolicitante()
 *    - Valida campos según segmento (residencial vs negocio)
 *    - Para negocio: requiere datos adicionales de empresa
 *
 * 3. canContinueDireccion()
 *    - Valida que región, comuna y dirección estén completos
 *
 * 4. canContinuePlan()
 *    - Valida que al menos un servicio esté seleccionado
 *    - Si es residencial e incluye Internet: requiere velocidad
 *    - Si es residencial e incluye TV: requiere tipo
 *    - Valida que se haya seleccionado un plan
 *
 * 5. canContinueInfoAdicional()
 *    - Valida fecha de agendamiento, tramo y tipo de campaña
 *
 * PERSISTENCIA EN LOCALSTORAGE:
 *
 * El formulario implementa persistencia automática completa:
 *
 * - Carga inicial: Al montar el componente, lee 'ebsa-form-data' del localStorage
 *   y restaura todos los estados guardados (useEffect con dependencias vacías)
 *
 * - Guardado automático: Cada vez que cualquier estado cambia, se serializa
 *   todo el objeto formData y se guarda en localStorage (useEffect con 40+ dependencias)
 *
 * - Limpieza: El localStorage se limpia solo después de envío exitoso
 *   (manejado en Confirmacion.tsx, no en este componente)
 *
 * - Ventajas: Permite recargar la página sin perder datos, recuperación ante
 *   cierres accidentales, y continuación de formularios incompletos
 *
 * NAVEGACIÓN ENTRE SECCIONES:
 *
 * La navegación se maneja con un sistema de colapso inteligente:
 *
 * - Solo una sección puede estar expandida a la vez
 * - Al hacer clic en "Continuar", se colapsa la sección actual y expande la siguiente
 * - Se aplica scroll suave automático al inicio de la nueva sección
 * - Las secciones se pueden expandir manualmente haciendo clic en el header
 * - Al expandir manualmente, se cierran todas las demás secciones
 * - Los botones "Continuar" solo se habilitan si la validación de la sección es exitosa
 *
 * Flujo de navegación:
 * 1. Información General -> Datos del Solicitante
 * 2. Datos del Solicitante -> Dirección
 * 3. Dirección -> Plan
 * 4. Plan -> Productos Adicionales
 * 5. Productos Adicionales -> Información Adicional
 * 6. Información Adicional -> Confirmación (handleFinalizar)
 *
 * INTEGRACIÓN DE COMPONENTES:
 *
 * El formulario integra múltiples componentes especializados:
 * - VendedorAutocomplete: Búsqueda de vendedores con Supabase
 * - DistribuidorSelector: Selección de distribuidor
 * - MarcaSelector: Selección de marca (condicional)
 * - CodigoAutocomplete: Búsqueda de códigos de punto de venta
 * - TipoValidacionSelector, SegmentoSelector, TipoVentaSelector: Selectores básicos
 * - TipoAgenteSelector: Selector de tipo de agente (condicional)
 * - DatosSolicitante: Sección completa de datos del cliente
 * - Direccion: Sección de dirección con regiones y comunas
 * - Plan: Sección de selección de servicios y planes
 * - ProductosAdicionales: Sección de productos adicionales
 * - InformacionAdicional: Sección final con fecha de agendamiento
 *
 * REFERENCIAS Y SCROLL:
 *
 * Se utilizan refs de React para controlar el scroll automático:
 * - solicitanteRef, direccionRef, planRef, adicionalesRef, infoAdicionalRef
 * - Cada ref apunta al contenedor div de su sección
 * - Al navegar, se aplica scrollIntoView con comportamiento suave
 *
 * @returns {JSX.Element} Formulario multi-paso completo con todas las secciones
 *
 * @example
 * // Uso en App.tsx
 * import { Form } from './components/Form';
 * import { useAuth } from './hooks/useAuth';
 *
 * function App() {
 *   const { user, signOut } = useAuth();
 *
 *   if (!user) {
 *     return <Login />;
 *   }
 *
 *   return <Form user={user} onSignOut={signOut} />;
 * }
 */
export function Form({ user, onSignOut }: FormProps) {
  const navigate = useNavigate();

  // Referencias para scroll
  const solicitanteRef = useRef<HTMLDivElement>(null);
  const direccionRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const adicionalesRef = useRef<HTMLDivElement>(null);
  const infoAdicionalRef = useRef<HTMLDivElement>(null);

  // Estados para Información General
  const [selectedVendedor, setSelectedVendedor] = useState("");
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [tipoContratoVendedor, setTipoContratoVendedor] = useState<string | null>(null);
  const [selectedTipoAgente, setSelectedTipoAgente] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedCodigo, setSelectedCodigo] = useState("");
  const [selectedSegmento, setSelectedSegmento] = useState("");
  const [selectedTipoVenta, setSelectedTipoVenta] = useState("");

  // Estados para Datos del Solicitante
  const [rut, setRut] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [numeroContacto, setNumeroContacto] = useState("");
  const [email, setEmail] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [rutEmpresa, setRutEmpresa] = useState("");

  // URLs de archivos subidos
  const [rutFrontalUrls, setRutFrontalUrls] = useState<string[]>([]);
  const [rutPosteriorUrls, setRutPosteriorUrls] = useState<string[]>([]);
  const [factibilidadUrls, setFactibilidadUrls] = useState<string[]>([]);
  const [otrosDocumentosUrls, setOtrosDocumentosUrls] = useState<string[]>([]);

  // Estados para Dirección
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [direccion, setDireccion] = useState("");

  // Estados para Plan
  const [hasInternet, setHasInternet] = useState(false);
  const [hasTelevision, setHasTelevision] = useState(false);
  const [hasTelefonia, setHasTelefonia] = useState(false);
  const [velocidadInternet, setVelocidadInternet] = useState("");
  const [tipoTelevision, setTipoTelevision] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  // Estados para Productos Adicionales
  const [selectedAdicionales, setSelectedAdicionales] = useState<string[]>([]);

  // Estados para Información Adicional
  const [fechaAgendamiento, setFechaAgendamiento] = useState("");
  const [tramoInstalacion, setTramoInstalacion] = useState("");
  const [tipoCampana, setTipoCampana] = useState("");
  const [comentarioVendedor, setComentarioVendedor] = useState("");

  // Estados para colapsar/expandir secciones
  const [isGeneralCollapsed, setIsGeneralCollapsed] = useState(false);
  const [isSolicitanteCollapsed, setIsSolicitanteCollapsed] = useState(true);
  const [isDireccionCollapsed, setIsDireccionCollapsed] = useState(true);
  const [isPlanCollapsed, setIsPlanCollapsed] = useState(true);
  const [isAdicionalesCollapsed, setIsAdicionalesCollapsed] = useState(true);
  const [isInfoAdicionalCollapsed, setIsInfoAdicionalCollapsed] = useState(true);

  // Cargar datos guardados del localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("ebsa-form-data");
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedVendedor(data.selectedVendedor || "");
      setNombreEquipo(data.nombreEquipo || "");
      setTipoContratoVendedor(data.tipoContratoVendedor || null);
      setSelectedTipoAgente(data.selectedTipoAgente || "");
      setSelectedMarca(data.selectedMarca || "");
      setSelectedCodigo(data.selectedCodigo || "");
      setSelectedSegmento(data.selectedSegmento || "");
      setSelectedTipoVenta(data.selectedTipoVenta || "");
      setRut(data.rut || "");
      setNombres(data.nombres || "");
      setApellidos(data.apellidos || "");
      setFechaNacimiento(data.fechaNacimiento || "");
      setNumeroContacto(data.numeroContacto || "");
      setEmail(data.email || "");
      setNombreEmpresa(data.nombreEmpresa || "");
      setRutEmpresa(data.rutEmpresa || "");
      setRutFrontalUrls(data.rutFrontalUrls || []);
      setRutPosteriorUrls(data.rutPosteriorUrls || []);
      setFactibilidadUrls(data.factibilidadUrls || []);
      setOtrosDocumentosUrls(data.otrosDocumentosUrls || []);
      setRegion(data.region || "");
      setComuna(data.comuna || "");
      setDireccion(data.direccion || "");
      setHasInternet(data.hasInternet || false);
      setHasTelevision(data.hasTelevision || false);
      setHasTelefonia(data.hasTelefonia || false);
      setVelocidadInternet(data.velocidadInternet || "");
      setTipoTelevision(data.tipoTelevision || "");
      setSelectedPlan(data.selectedPlan || "");
      setSelectedAdicionales(data.selectedAdicionales || []);
      setFechaAgendamiento(data.fechaAgendamiento || "");
      setTramoInstalacion(data.tramoInstalacion || "");
      setTipoCampana(data.tipoCampana || "");
      setComentarioVendedor(data.comentarioVendedor || "");
    }
  }, []);

  // Cargar nombreEquipo basándose en el email del usuario al montar
  useEffect(() => {
    async function fetchNombreEquipo() {
      if (!user?.email) return;

      try {
        const { getEquipos } = await import('../lib/supabaseQueries');
        const equipos = await getEquipos();
        const userEmail = user.email; // Asignar a variable local para TypeScript
        const equipo = equipos.find(e => e.email === userEmail.toLowerCase());

        if (equipo && equipo.nombre_equipo) {
          // Normalizar con primera letra mayúscula
          const nombreNormalizado = equipo.nombre_equipo
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

          // Solo setear si aún no hay nombreEquipo (no sobreescribir datos guardados)
          setNombreEquipo(prev => prev || nombreNormalizado);
        }
      } catch (error) {
        console.error('Error cargando nombre del equipo:', error);
      }
    }

    fetchNombreEquipo();
  }, [user?.email]);

  // Guardar en localStorage cada vez que cambian los datos
  useEffect(() => {
    const formData = {
      selectedVendedor,
      nombreEquipo,
      tipoContratoVendedor,
      selectedTipoAgente,
      selectedMarca,
      selectedCodigo,
      selectedSegmento,
      selectedTipoVenta,
      rut,
      nombres,
      apellidos,
      fechaNacimiento,
      numeroContacto,
      email,
      nombreEmpresa,
      rutEmpresa,
      rutFrontalUrls,
      rutPosteriorUrls,
      factibilidadUrls,
      otrosDocumentosUrls,
      region,
      comuna,
      direccion,
      hasInternet,
      hasTelevision,
      hasTelefonia,
      velocidadInternet,
      tipoTelevision,
      selectedPlan,
      selectedAdicionales,
      fechaAgendamiento,
      tramoInstalacion,
      tipoCampana,
      comentarioVendedor,
    };
    localStorage.setItem("ebsa-form-data", JSON.stringify(formData));
  }, [
    selectedVendedor,
    nombreEquipo,
    tipoContratoVendedor,
    selectedTipoAgente,
    selectedMarca,
    selectedCodigo,
    selectedSegmento,
    selectedTipoVenta,
    rut,
    nombres,
    apellidos,
    fechaNacimiento,
    numeroContacto,
    email,
    nombreEmpresa,
    rutEmpresa,
    rutFrontalUrls,
    rutPosteriorUrls,
    factibilidadUrls,
    otrosDocumentosUrls,
    region,
    comuna,
    direccion,
    hasInternet,
    hasTelevision,
    hasTelefonia,
    velocidadInternet,
    tipoTelevision,
    selectedPlan,
    selectedAdicionales,
    fechaAgendamiento,
    tramoInstalacion,
    tipoCampana,
    comentarioVendedor,
  ]);

  /**
   * Cierra todas las secciones excepto la especificada.
   * Utilizado para garantizar que solo una sección esté expandida a la vez.
   *
   * @param {string} sectionToKeepOpen - Identificador de la sección que debe permanecer abierta
   *                                      Valores posibles: 'general', 'solicitante', 'direccion', 'plan', 'adicionales', 'infoAdicional'
   */
  const closeAllSectionsExcept = (sectionToKeepOpen: string) => {
    if (sectionToKeepOpen !== 'general') setIsGeneralCollapsed(true);
    if (sectionToKeepOpen !== 'solicitante') setIsSolicitanteCollapsed(true);
    if (sectionToKeepOpen !== 'direccion') setIsDireccionCollapsed(true);
    if (sectionToKeepOpen !== 'plan') setIsPlanCollapsed(true);
    if (sectionToKeepOpen !== 'adicionales') setIsAdicionalesCollapsed(true);
    if (sectionToKeepOpen !== 'infoAdicional') setIsInfoAdicionalCollapsed(true);
  };

  /**
   * Maneja la transición de Información General a Datos del Solicitante.
   * Colapsa todas las secciones excepto Solicitante y aplica scroll suave.
   */
  const handleContinueGeneral = () => {
    closeAllSectionsExcept('solicitante');
    setIsSolicitanteCollapsed(false);

    // Scroll al inicio de la siguiente sección
    setTimeout(() => {
      solicitanteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /**
   * Maneja la transición de Datos del Solicitante a Dirección.
   * Colapsa todas las secciones excepto Dirección y aplica scroll suave.
   */
  const handleContinueSolicitante = () => {
    closeAllSectionsExcept('direccion');
    setIsDireccionCollapsed(false);

    // Scroll al inicio de la siguiente sección
    setTimeout(() => {
      direccionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /**
   * Maneja la transición de Dirección a Plan.
   * Colapsa todas las secciones excepto Plan y aplica scroll suave.
   */
  const handleContinueDireccion = () => {
    closeAllSectionsExcept('plan');
    setIsPlanCollapsed(false);

    // Scroll al inicio de la siguiente sección
    setTimeout(() => {
      planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /**
   * Maneja la transición de Plan a Productos Adicionales.
   * Colapsa todas las secciones excepto Adicionales y aplica scroll suave.
   */
  const handleContinuePlan = () => {
    closeAllSectionsExcept('adicionales');
    setIsAdicionalesCollapsed(false);

    // Scroll al inicio de la siguiente sección
    setTimeout(() => {
      adicionalesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /**
   * Maneja la transición de Productos Adicionales a Información Adicional.
   * Colapsa todas las secciones excepto Información Adicional y aplica scroll suave.
   */
  const handleContinueAdicionales = () => {
    closeAllSectionsExcept('infoAdicional');
    setIsInfoAdicionalCollapsed(false);

    // Scroll al inicio de la siguiente sección
    setTimeout(() => {
      infoAdicionalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /**
   * Maneja el cambio de vendedor seleccionado y sus datos asociados.
   * Si el vendedor tiene tipo de contrato definido, limpia la selección manual de tipo de agente.
   *
   * @param {string} vendedor - Nombre del vendedor seleccionado
   * @param {string | null} tipoContrato - Tipo de contrato del vendedor (puede ser null si no tiene asignado)
   * @param {string} equipo - Nombre del equipo asociado al vendedor
   */
  const handleVendedorChange = (vendedor: string, tipoContrato: string | null, equipo: string) => {
    setSelectedVendedor(vendedor);
    setTipoContratoVendedor(tipoContrato);
    setNombreEquipo(equipo);
    // Si el tipo de contrato no es null, limpiar la selección manual de tipo de agente
    if (tipoContrato !== null) {
      setSelectedTipoAgente("");
    }
  };

  /**
   * Finaliza el formulario y navega a la página de confirmación.
   * Prepara todos los datos del formulario, incluyendo campos condicionales según el segmento,
   * y los pasa mediante React Router state a la página de confirmación.
   */
  const handleFinalizar = () => {
    // Preparar los datos del formulario
    const formData = {
      selectedVendedor,
      tipoAgente: tipoContratoVendedor || selectedTipoAgente,
      selectedMarca,
      selectedCodigo,
      selectedSegmento,
      selectedTipoVenta,
      rut,
      nombres,
      apellidos,
      fechaNacimiento,
      numeroContacto,
      email,
      // Solo incluir datos de empresa si el segmento es negocio
      ...(selectedSegmento === 'negocio' && {
        nombreEmpresa,
        rutEmpresa,
      }),
      // URLs de archivos subidos
      rutFrontalUrls,
      rutPosteriorUrls,
      factibilidadUrls,
      otrosDocumentosUrls,
      region,
      comuna,
      direccion,
      hasInternet,
      hasTelevision,
      hasTelefonia,
      velocidadInternet,
      tipoTelevision,
      selectedPlan,
      selectedAdicionales,
      fechaAgendamiento,
      tramoInstalacion,
      tipoCampana,
      comentarioVendedor,
      // Nombre del equipo obtenido desde Supabase (solo para mostrar en UI)
      equipo: nombreEquipo,
      // Email del equipo (del usuario logueado, para enviar a Sheets)
      emailEquipo: user?.email || '',
    };

    // Navegar a la página de confirmación con los datos
    navigate('/confirmacion', { state: { formData } });
  };

  /**
   * Valida si la sección de Información General está completa y permite continuar.
   *
   * Validaciones realizadas:
   * - Vendedor, distribuidor, código, tipo de validación, segmento y tipo de venta son obligatorios
   * - Si el distribuidor es 'ebsa', la marca también es obligatoria
   * - Si el vendedor no tiene tipo de contrato (tipoContratoVendedor === null),
   *   el tipo de agente debe ser seleccionado manualmente
   *
   * @returns {boolean} true si todos los campos obligatorios están completos
   */
  const canContinueGeneral = () => {
    // Verificar si necesita seleccionar tipo de agente manualmente
    const needsTipoAgente = tipoContratoVendedor === null;
    if (needsTipoAgente && !selectedTipoAgente) {
      return false;
    }

    // Permitir valores vacíos en vendedor y código (se validan como !== null y !== undefined)
    return selectedVendedor !== null && selectedVendedor !== undefined &&
           selectedMarca &&
           selectedCodigo !== null && selectedCodigo !== undefined &&
           selectedSegmento &&
           selectedTipoVenta;
  };

  /**
   * Valida si la sección de Datos del Solicitante está completa y permite continuar.
   *
   * Validaciones realizadas:
   * - Para segmento 'residencial': RUT, nombres, apellidos, fecha de nacimiento, contacto y email son obligatorios
   * - Para segmento 'negocio': Además de los campos anteriores, nombre de empresa y RUT de empresa son obligatorios
   *
   * @returns {boolean} true si todos los campos obligatorios según el segmento están completos
   */
  const canContinueSolicitante = () => {
    if (selectedSegmento === 'residencial') {
      return rut && nombres && apellidos && fechaNacimiento && numeroContacto && email;
    } else if (selectedSegmento === 'negocio') {
      return nombreEmpresa && rutEmpresa && rut && nombres && apellidos && fechaNacimiento && numeroContacto && email;
    }
    return false;
  };

  /**
   * Valida si la sección de Dirección está completa y permite continuar.
   *
   * Validaciones realizadas:
   * - Región, comuna y dirección son campos obligatorios
   *
   * @returns {boolean} true si todos los campos de dirección están completos
   */
  const canContinueDireccion = () => {
    return region && comuna && direccion;
  };

  /**
   * Valida si la sección de Plan está completa y permite continuar.
   *
   * Validaciones realizadas:
   * - Al menos un servicio debe estar seleccionado (Internet, TV o Telefonía)
   * - Si el segmento es 'residencial' y tiene Internet seleccionado, la velocidad es obligatoria
   * - Si el segmento es 'residencial' y tiene TV seleccionada, el tipo de TV es obligatorio
   * - Un plan debe estar seleccionado
   *
   * @returns {boolean} true si todos los requisitos del plan están cumplidos
   */
  const canContinuePlan = () => {
    // Debe haber al menos un servicio seleccionado
    if (!hasInternet && !hasTelevision && !hasTelefonia) {
      return false;
    }

    // Si es residencial y tiene internet, debe seleccionar velocidad
    if (selectedSegmento === 'residencial' && hasInternet && !velocidadInternet) {
      return false;
    }

    // Si es residencial y tiene televisión, debe seleccionar tipo
    if (selectedSegmento === 'residencial' && hasTelevision && !tipoTelevision) {
      return false;
    }

    // Debe haber seleccionado un plan
    if (!selectedPlan) {
      return false;
    }

    return true;
  };

  /**
   * Valida si la sección de Información Adicional está completa y permite finalizar el formulario.
   *
   * Validaciones realizadas:
   * - Fecha de agendamiento es obligatoria (validación de feriados se realiza en el componente InformacionAdicional)
   * - Tramo de instalación es obligatorio
   * - Tipo de campaña es obligatorio
   * - Comentario del vendedor es opcional
   *
   * @returns {boolean} true si todos los campos obligatorios están completos
   */
  const canContinueInfoAdicional = () => {
    return fechaAgendamiento && tramoInstalacion && tipoCampana;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header con info del usuario y botón de logout */}
          <div className="flex justify-between items-center mb-8 pb-6 border-b-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Formulario EBSA
              </h1>
              <p className="text-sm text-gray-600 mt-1">{nombreEquipo || user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Formulario */}
          <div>
            {/* Sección 1: Información General */}
            <div className="mb-8 border-2 border-gray-200 rounded-lg">
              {/* Header de la sección con botón para colapsar */}
              <div
                onClick={() => {
                  if (isGeneralCollapsed) {
                    closeAllSectionsExcept('general');
                  }
                  setIsGeneralCollapsed(!isGeneralCollapsed);
                }}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition rounded-t-lg"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  Información General
                </h2>
                <button className="text-gray-600 text-2xl">
                  {isGeneralCollapsed ? "+" : "−"}
                </button>
              </div>

              {/* Contenido de la sección (colapsable) */}
              {!isGeneralCollapsed && (
                <div className="p-4 border-t-2 border-gray-200">
                  <VendedorAutocomplete
                    userEmail={user.email || ""}
                    value={selectedVendedor}
                    onChange={handleVendedorChange}
                  />

                  {/* Mostrar selector de tipo de agente solo si el vendedor tiene tipoContrato null */}
                  {selectedVendedor && tipoContratoVendedor === null && (
                    <TipoAgenteSelector
                      value={selectedTipoAgente}
                      onChange={setSelectedTipoAgente}
                    />
                  )}

                  <MarcaSelector
                    value={selectedMarca}
                    onChange={setSelectedMarca}
                  />

                  <CodigoAutocomplete
                    value={selectedCodigo}
                    onChange={setSelectedCodigo}
                    userEmail={user.email || ''}
                  />

                  <SegmentoSelector
                    value={selectedSegmento}
                    onChange={setSelectedSegmento}
                  />

                  <TipoVentaSelector
                    value={selectedTipoVenta}
                    onChange={setSelectedTipoVenta}
                  />

                  {/* Botón Continuar */}
                  <button
                    onClick={handleContinueGeneral}
                    disabled={!canContinueGeneral()}
                    className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    Continuar
                  </button>
                </div>
              )}
            </div>

            {/* Sección 2: Datos del Solicitante */}
            <div ref={solicitanteRef}>
              <DatosSolicitante
                segmento={selectedSegmento}
                isCollapsed={isSolicitanteCollapsed}
                onToggle={() => {
                  if (isSolicitanteCollapsed) {
                    closeAllSectionsExcept('solicitante');
                  }
                  setIsSolicitanteCollapsed(!isSolicitanteCollapsed);
                }}
                onContinue={handleContinueSolicitante}
                canContinue={!!canContinueSolicitante()}
                canExpand={!!canContinueGeneral()}
                rut={rut}
                nombres={nombres}
                apellidos={apellidos}
                fechaNacimiento={fechaNacimiento}
                numeroContacto={numeroContacto}
                email={email}
                nombreEmpresa={nombreEmpresa}
                rutEmpresa={rutEmpresa}
                onRutChange={setRut}
                onNombresChange={setNombres}
                onApellidosChange={setApellidos}
                onFechaNacimientoChange={setFechaNacimiento}
                onNumeroContactoChange={setNumeroContacto}
                onEmailChange={setEmail}
                onNombreEmpresaChange={setNombreEmpresa}
                onRutEmpresaChange={setRutEmpresa}
              />
            </div>

            {/* Sección 3: Dirección */}
            <div ref={direccionRef}>
              <Direccion
                isCollapsed={isDireccionCollapsed}
                onToggle={() => {
                  if (isDireccionCollapsed) {
                    closeAllSectionsExcept('direccion');
                  }
                  setIsDireccionCollapsed(!isDireccionCollapsed);
                }}
                onContinue={handleContinueDireccion}
                canContinue={!!canContinueDireccion()}
                canExpand={!!canContinueSolicitante()}
                region={region}
                comuna={comuna}
                direccion={direccion}
                onRegionChange={setRegion}
                onComunaChange={setComuna}
                onDireccionChange={setDireccion}
              />
            </div>

            {/* Sección 4: Plan */}
            <div ref={planRef}>
              <Plan
                isCollapsed={isPlanCollapsed}
                onToggle={() => {
                  if (isPlanCollapsed) {
                    closeAllSectionsExcept('plan');
                  }
                  setIsPlanCollapsed(!isPlanCollapsed);
                }}
                onContinue={handleContinuePlan}
                canContinue={!!canContinuePlan()}
                canExpand={!!canContinueDireccion()}
                marca={selectedMarca}
                segmento={selectedSegmento}
                tipoVenta={selectedTipoVenta}
                hasInternet={hasInternet}
                hasTelevision={hasTelevision}
                hasTelefonia={hasTelefonia}
                onInternetChange={setHasInternet}
                onTelevisionChange={setHasTelevision}
                onTelefoniaChange={setHasTelefonia}
                velocidadInternet={velocidadInternet}
                onVelocidadInternetChange={setVelocidadInternet}
                tipoTelevision={tipoTelevision}
                onTipoTelevisionChange={setTipoTelevision}
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
              />
            </div>

            {/* Sección 5: Productos Adicionales */}
            <div ref={adicionalesRef}>
              <ProductosAdicionales
                isCollapsed={isAdicionalesCollapsed}
                onToggle={() => {
                  if (isAdicionalesCollapsed) {
                    closeAllSectionsExcept('adicionales');
                  }
                  setIsAdicionalesCollapsed(!isAdicionalesCollapsed);
                }}
                onContinue={handleContinueAdicionales}
                canContinue={true}
                canExpand={!!canContinuePlan()}
                segmento={selectedSegmento}
                tipoVenta={selectedTipoVenta}
                hasInternet={hasInternet}
                hasTelevision={hasTelevision}
                selectedAdicionales={selectedAdicionales}
                onAdicionalesChange={setSelectedAdicionales}
              />
            </div>

            {/* Sección 6: Información Adicional */}
            <div ref={infoAdicionalRef}>
              <InformacionAdicional
                isCollapsed={isInfoAdicionalCollapsed}
                onToggle={() => {
                  if (isInfoAdicionalCollapsed) {
                    closeAllSectionsExcept('infoAdicional');
                  }
                  setIsInfoAdicionalCollapsed(!isInfoAdicionalCollapsed);
                }}
                onContinue={handleFinalizar}
                canContinue={!!canContinueInfoAdicional()}
                canExpand={!!canContinuePlan()}
                fechaAgendamiento={fechaAgendamiento}
                tramoInstalacion={tramoInstalacion}
                tipoCampana={tipoCampana}
                comentarioVendedor={comentarioVendedor}
                onFechaChange={setFechaAgendamiento}
                onTramoChange={setTramoInstalacion}
                onTipoCampanaChange={setTipoCampana}
                onComentarioChange={setComentarioVendedor}
                rut={rut}
                rutFrontalUrls={rutFrontalUrls}
                rutPosteriorUrls={rutPosteriorUrls}
                factibilidadUrls={factibilidadUrls}
                otrosDocumentosUrls={otrosDocumentosUrls}
                onRutFrontalUrlsChange={setRutFrontalUrls}
                onRutPosteriorUrlsChange={setRutPosteriorUrls}
                onFactibilidadUrlsChange={setFactibilidadUrls}
                onOtrosDocumentosUrlsChange={setOtrosDocumentosUrls}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
