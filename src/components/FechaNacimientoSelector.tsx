/**
 * @fileoverview Selector de fecha de nacimiento con validación de edad mínima.
 * Permite seleccionar fecha mediante tres selectores (día, mes, año).
 */

import { useMemo, useState, useEffect } from "react";

/**
 * Props para el componente FechaNacimientoSelector.
 * @interface FechaNacimientoSelectorProps
 */
interface FechaNacimientoSelectorProps {
  /** Fecha en formato YYYY-MM-DD */
  value: string;
  /** Función callback que se ejecuta cuando cambia la fecha */
  onChange: (value: string) => void;
}

/**
 * Componente para seleccionar fecha de nacimiento con tres selectores separados.
 * Valida que la persona sea mayor de 18 años y ajusta los días según el mes.
 *
 * @component
 * @param {FechaNacimientoSelectorProps} props - Props del componente
 * @returns {JSX.Element} Tres selectores (día, mes, año) para fecha de nacimiento
 *
 * @example
 * <FechaNacimientoSelector
 *   value={fechaNacimiento}
 *   onChange={setFechaNacimiento}
 * />
 *
 * @description
 * Características:
 * - Valida edad mínima de 18 años
 * - Rango de edad: 18 a 100 años
 * - Ajusta días disponibles según mes seleccionado (28, 30 o 31 días)
 * - Maneja años bisiestos correctamente
 */
export function FechaNacimientoSelector({ value, onChange }: FechaNacimientoSelectorProps) {
  // Estados locales para cada selector
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Inicializar desde value si existe
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setYear(y || '');
      setMonth(m || '');
      setDay(d || '');
    }
  }, []);

  // Calcular año mínimo (18 años atrás)
  const añoActual = new Date().getFullYear();
  const añoMinimo = añoActual - 100; // Personas de hasta 100 años
  const añoMaximo = añoActual - 18; // Solo mayores de 18 años

  // Generar arrays de opciones
  const años = useMemo(() => {
    const arr = [];
    for (let i = añoMaximo; i >= añoMinimo; i--) {
      arr.push(i);
    }
    return arr;
  }, [añoMaximo, añoMinimo]);

  const meses = [
    { valor: '01', nombre: 'Enero' },
    { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' },
    { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' },
    { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' },
    { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' },
  ];

  // Calcular días disponibles según el mes y año
  const días = useMemo(() => {
    if (!month || !year) return Array.from({ length: 31 }, (_, i) => i + 1);

    const diasEnMes = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: diasEnMes }, (_, i) => i + 1);
  }, [month, year]);

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    if (newDay && month && year) {
      const paddedDay = newDay.padStart(2, '0');
      onChange(`${year}-${month}-${paddedDay}`);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (newMonth && day && year) {
      const paddedDay = day.padStart(2, '0');
      onChange(`${year}-${newMonth}-${paddedDay}`);
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    if (newYear && month && day) {
      const paddedDay = day.padStart(2, '0');
      onChange(`${newYear}-${month}-${paddedDay}`);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-2">
        Fecha de Nacimiento <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-3">
        {/* Selector de Día */}
        <div>
          <select
            value={day ? parseInt(day).toString() : ''}
            onChange={(e) => handleDayChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
            required
          >
            <option value="">Día</option>
            {días.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Mes */}
        <div>
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
            required
          >
            <option value="">Mes</option>
            {meses.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Año */}
        <div>
          <select
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
            required
          >
            <option value="">Año</option>
            {años.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Solo mayores de 18 años
      </p>
    </div>
  );
}
