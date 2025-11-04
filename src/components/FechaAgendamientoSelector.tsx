/**
 * @fileoverview Selector de fecha de agendamiento con calendario visual.
 * Excluye domingos y feriados, mostrando solo días hábiles.
 * Datos de feriados obtenidos desde Supabase.
 */

import { useMemo, useState, useEffect } from "react";
import { getFeriados } from "../lib/supabaseQueries";

/**
 * Props para el componente FechaAgendamientoSelector.
 * @interface FechaAgendamientoSelectorProps
 */
interface FechaAgendamientoSelectorProps {
  /** Fecha seleccionada en formato YYYY-MM-DD */
  value: string;
  /** Función callback que se ejecuta cuando cambia la fecha */
  onChange: (value: string) => void;
}

/**
 * Representa un día en el calendario con sus propiedades.
 * @interface DiaCalendario
 */
interface DiaCalendario {
  /** Objeto Date del día */
  fecha: Date;
  /** Fecha en formato string YYYY-MM-DD */
  fechaStr: string;
  /** Nombre del día de la semana */
  diaNombre: string;
  /** Número del día del mes (1-31) */
  dia: number;
  /** Nombre del mes */
  mes: string;
  /** Año */
  año: number;
  /** true si es domingo */
  esDomingo: boolean;
  /** true si es feriado según feriados.json */
  esFeriado: boolean;
  /** true si es día hábil (no domingo ni feriado) */
  esHabil: boolean;
}

/**
 * Componente de calendario para seleccionar fecha de agendamiento.
 * Muestra aproximadamente 3 semanas de fechas futuras, excluyendo domingos y feriados.
 *
 * @component
 * @param {FechaAgendamientoSelectorProps} props - Props del componente
 * @returns {JSX.Element} Calendario interactivo para selección de fecha
 *
 * @example
 * <FechaAgendamientoSelector
 *   value={fechaAgendamiento}
 *   onChange={setFechaAgendamiento}
 * />
 *
 * @description
 * Características:
 * - Muestra 21 días desde mañana
 * - Excluye domingos automáticamente
 * - Excluye feriados según data/feriados.json
 * - Organiza días en semanas para mejor visualización
 * - Resalta la fecha seleccionada
 * - Deshabilita días no hábiles
 */
export function FechaAgendamientoSelector({ value, onChange }: FechaAgendamientoSelectorProps) {
  const [feriadosDB, setFeriadosDB] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar feriados desde Supabase
  useEffect(() => {
    async function fetchFeriados() {
      setLoading(true)
      try {
        const data = await getFeriados()
        // Convertir array de objetos a array de fechas string
        const fechasFeriados = data.map(f => f.fecha)
        setFeriadosDB(fechasFeriados)
      } catch (error) {
        console.error('Error cargando feriados:', error)
        setFeriadosDB([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeriados()
  }, [])

  // Generar 10 días a partir de mañana
  const diasCalendario = useMemo(() => {
    const dias: DiaCalendario[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let offset = 1; offset <= 10; offset++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + offset);

      const fechaStr = fecha.toISOString().split('T')[0];
      const diaSemana = fecha.getDay();
      const esDomingo = diaSemana === 0;
      const esFeriado = feriadosDB.includes(fechaStr);
      const esHabil = !esDomingo && !esFeriado;

      dias.push({
        fecha,
        fechaStr,
        diaNombre: diasSemana[diaSemana],
        dia: fecha.getDate(),
        mes: meses[fecha.getMonth()],
        año: fecha.getFullYear(),
        esDomingo,
        esFeriado,
        esHabil,
      });
    }

    return dias;
  }, [feriadosDB]);

  // Organizar días en filas de 5
  const filas = useMemo(() => {
    const resultado: DiaCalendario[][] = [];
    for (let i = 0; i < diasCalendario.length; i += 5) {
      resultado.push(diasCalendario.slice(i, i + 5));
    }
    return resultado;
  }, [diasCalendario]);

  const handleDiaClick = (dia: DiaCalendario) => {
    if (dia.esHabil) {
      onChange(dia.fechaStr);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2">
        Fecha de Agendamiento Preferida <span className="text-red-500">*</span>
      </label>

      {loading ? (
        <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-center text-gray-600">
          Cargando calendario...
        </div>
      ) : (
        <>
          {/* Grilla de fechas: 2 filas de 5 columnas */}
          <div className="space-y-3">
        {filas.map((fila, filaIndex) => (
          <div key={filaIndex} className="grid grid-cols-5 gap-3">
            {fila.map((dia) => {
              const isSelected = value === dia.fechaStr;
              const isDisabled = !dia.esHabil;

              // Formato DD/MM
              const diaFormatted = String(dia.dia).padStart(2, '0');
              const mesNumero = String(dia.fecha.getMonth() + 1).padStart(2, '0');

              return (
                <button
                  key={dia.fechaStr}
                  type="button"
                  onClick={() => handleDiaClick(dia)}
                  disabled={isDisabled}
                  className={`
                    p-3 rounded-lg border-2 transition
                    flex flex-col items-center justify-center min-h-[80px]
                    ${isSelected
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : isDisabled
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                    }
                  `}
                >
                  <span className={`text-xl font-bold ${isSelected ? 'text-white' : ''}`}>
                    {diaFormatted}/{mesNumero}
                  </span>
                  <span className={`text-sm mt-1 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {dia.diaNombre.substring(0, 3)}
                  </span>
                  {dia.esFeriado && !dia.esDomingo && (
                    <span className="text-[10px] text-red-500 font-semibold mt-1">
                      Feriado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
          </div>

          <p className="text-sm text-gray-500 mt-3">
            <strong>Observación:</strong> Si necesitas una fecha más distante, indícalo en el campo de comentario adicional al final del formulario.
          </p>
        </>
      )}
    </div>
  );
}
