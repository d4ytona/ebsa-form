/**
 * @fileoverview Componente de sección para capturar los datos personales del solicitante.
 * Este componente maneja tanto clientes residenciales como negocios, mostrando campos
 * adicionales para empresas cuando el segmento es negocio. Incluye validaciones en tiempo
 * real para RUT, nombres, apellidos, teléfono y email.
 */

import { useState } from 'react'
import { TextInput } from './TextInput'
import {
  validateRut,
  formatRut,
  validateName,
  capitalizeName,
  validatePhone,
  formatPhone,
  validateEmail,
  errorMessages
} from '../utils/validators'

/**
 * @interface DatosSolicitanteProps
 * @description Propiedades del componente DatosSolicitante que controla la captura de datos personales.
 *
 * @property {string} segmento - Tipo de cliente: 'residencial' o 'negocio'
 * @property {boolean} isCollapsed - Estado de colapso de la sección
 * @property {function} onToggle - Callback para alternar el estado de colapso
 * @property {function} [onContinue] - Callback opcional al presionar el botón Continuar
 * @property {boolean} [canContinue] - Indica si el botón Continuar debe estar habilitado
 * @property {boolean} [canExpand] - Indica si la sección puede expandirse/colapsarse
 * @property {string} rut - RUT del solicitante (o representante legal en caso de negocio)
 * @property {string} nombres - Nombres del solicitante
 * @property {string} apellidos - Apellidos del solicitante
 * @property {string} fechaNacimiento - Fecha de nacimiento en formato YYYY-MM-DD
 * @property {string} numeroContacto - Número de teléfono de contacto
 * @property {string} email - Dirección de correo electrónico
 * @property {string} nombreEmpresa - Nombre de la empresa (solo para segmento negocio)
 * @property {string} rutEmpresa - RUT de la empresa (solo para segmento negocio)
 * @property {function} onRutChange - Handler para cambios en el RUT
 * @property {function} onNombresChange - Handler para cambios en los nombres
 * @property {function} onApellidosChange - Handler para cambios en los apellidos
 * @property {function} onFechaNacimientoChange - Handler para cambios en la fecha de nacimiento
 * @property {function} onNumeroContactoChange - Handler para cambios en el número de contacto
 * @property {function} onEmailChange - Handler para cambios en el email
 * @property {function} onNombreEmpresaChange - Handler para cambios en el nombre de empresa
 * @property {function} onRutEmpresaChange - Handler para cambios en el RUT de empresa
 */
interface DatosSolicitanteProps {
  segmento: string
  isCollapsed: boolean
  onToggle: () => void
  onContinue?: () => void
  canContinue?: boolean
  canExpand?: boolean
  // Campos compartidos (persona)
  rut: string
  nombres: string
  apellidos: string
  numeroContacto: string
  email: string
  // Campos solo para negocio
  nombreEmpresa: string
  rutEmpresa: string
  // Handlers
  onRutChange: (value: string) => void
  onNombresChange: (value: string) => void
  onApellidosChange: (value: string) => void
  onNumeroContactoChange: (value: string) => void
  onEmailChange: (value: string) => void
  onNombreEmpresaChange: (value: string) => void
  onRutEmpresaChange: (value: string) => void
}

/**
 * @component DatosSolicitante
 * @description Sección del formulario que captura la información personal y de contacto del solicitante.
 * Es la primera sección del formulario y adapta sus campos según el tipo de cliente.
 *
 * @param {DatosSolicitanteProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección colapsable con formulario de datos del solicitante
 *
 * @description
 * Campos incluidos:
 * - Para segmento 'negocio':
 *   - RUT de la Empresa (con validación y formateo automático)
 *   - Nombre de la Empresa
 *   - RUT del Representante Legal (con validación y formateo automático)
 *   - Nombres del representante (con validación y capitalización automática)
 *   - Apellidos del representante (con validación y capitalización automática)
 *   - Fecha de Nacimiento (usando componente FechaNacimientoSelector)
 *   - Número de Contacto (con validación y formateo automático)
 *   - Email (con validación de formato)
 *
 * - Para segmento 'residencial':
 *   - RUT (con validación y formateo automático)
 *   - Nombres (con validación y capitalización automática)
 *   - Apellidos (con validación y capitalización automática)
 *   - Fecha de Nacimiento (usando componente FechaNacimientoSelector)
 *   - Número de Contacto (con validación y formateo automático)
 *   - Email (con validación de formato)
 *
 * Validaciones aplicadas:
 * - RUT: Valida formato y dígito verificador chileno, formatea automáticamente
 * - Nombres/Apellidos: Solo permite letras, espacios y tildes, capitaliza automáticamente
 * - Teléfono: Valida formato chileno (9 dígitos), formatea automáticamente
 * - Email: Valida formato de correo electrónico estándar
 *
 * Lógica condicional:
 * - Los campos de empresa (RUT y nombre) solo se muestran cuando segmento === 'negocio'
 * - El label del campo RUT cambia según el segmento:
 *   - 'negocio': "RUT del Representante Legal"
 *   - 'residencial': "RUT"
 * - Todas las validaciones se ejecutan en tiempo real mientras el usuario escribe
 * - Los nombres y apellidos se capitalizan automáticamente al perder el foco (onBlur)
 *
 * Componentes hijos utilizados:
 * - TextInput: Para RUT, nombres, apellidos, teléfono, email, nombre empresa, RUT empresa
 * - FechaNacimientoSelector: Para selección de fecha de nacimiento con validación de edad
 *
 * @example
 * ```tsx
 * <DatosSolicitante
 *   segmento="residencial"
 *   isCollapsed={false}
 *   onToggle={() => setIsCollapsed(!isCollapsed)}
 *   onContinue={() => handleContinue()}
 *   canContinue={isFormValid}
 *   canExpand={true}
 *   rut={formData.rut}
 *   nombres={formData.nombres}
 *   apellidos={formData.apellidos}
 *   fechaNacimiento={formData.fechaNacimiento}
 *   numeroContacto={formData.numeroContacto}
 *   email={formData.email}
 *   nombreEmpresa=""
 *   rutEmpresa=""
 *   onRutChange={(value) => setFormData({...formData, rut: value})}
 *   onNombresChange={(value) => setFormData({...formData, nombres: value})}
 *   onApellidosChange={(value) => setFormData({...formData, apellidos: value})}
 *   onFechaNacimientoChange={(value) => setFormData({...formData, fechaNacimiento: value})}
 *   onNumeroContactoChange={(value) => setFormData({...formData, numeroContacto: value})}
 *   onEmailChange={(value) => setFormData({...formData, email: value})}
 *   onNombreEmpresaChange={() => {}}
 *   onRutEmpresaChange={() => {}}
 * />
 * ```
 */
export function DatosSolicitante(props: DatosSolicitanteProps) {
  const isNegocio = props.segmento === 'negocio'

  // Estados para errores
  const [rutError, setRutError] = useState('')
  const [rutEmpresaError, setRutEmpresaError] = useState('')
  const [nombresError, setNombresError] = useState('')
  const [apellidosError, setApellidosError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')

  // Handler para RUT con validación
  const handleRutChange = (value: string) => {
    const formatted = formatRut(value)
    props.onRutChange(formatted)
    if (formatted && !validateRut(formatted)) {
      setRutError(errorMessages.rut)
    } else {
      setRutError('')
    }
  }

  // Handler para RUT empresa
  const handleRutEmpresaChange = (value: string) => {
    const formatted = formatRut(value)
    props.onRutEmpresaChange(formatted)
    if (formatted && !validateRut(formatted)) {
      setRutEmpresaError(errorMessages.rut)
    } else {
      setRutEmpresaError('')
    }
  }

  // Handler para nombres con validación y capitalización
  const handleNombresChange = (value: string) => {
    if (value === '' || validateName(value)) {
      props.onNombresChange(value)
      setNombresError('')
    } else {
      setNombresError(errorMessages.name)
    }
  }

  const handleNombresBlur = () => {
    if (props.nombres) {
      props.onNombresChange(capitalizeName(props.nombres))
    }
  }

  // Handler para apellidos con validación y capitalización
  const handleApellidosChange = (value: string) => {
    if (value === '' || validateName(value)) {
      props.onApellidosChange(value)
      setApellidosError('')
    } else {
      setApellidosError(errorMessages.name)
    }
  }

  const handleApellidosBlur = () => {
    if (props.apellidos) {
      props.onApellidosChange(capitalizeName(props.apellidos))
    }
  }

  // Handler para teléfono con validación
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    props.onNumeroContactoChange(formatted)
    if (formatted && !validatePhone(formatted)) {
      setPhoneError(errorMessages.phone)
    } else {
      setPhoneError('')
    }
  }

  // Handler para email con validación
  const handleEmailBlur = () => {
    if (props.email && !validateEmail(props.email)) {
      setEmailError(errorMessages.email)
    } else {
      setEmailError('')
    }
  }

  return (
    <div className="mb-8 border-2 border-gray-200 rounded-lg">
      {/* Header */}
      <div
        onClick={props.canExpand ? props.onToggle : undefined}
        className={`flex justify-between items-center p-4 transition rounded-t-lg ${
          props.canExpand ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900">
          Datos del Solicitante
        </h2>
        <button className="text-gray-600 text-2xl">
          {props.isCollapsed ? "+" : "−"}
        </button>
      </div>

      {/* Contenido */}
      {!props.isCollapsed && (
        <div className="p-4 border-t-2 border-gray-200">
          {/* Campos solo para NEGOCIO */}
          {isNegocio && (
            <>
              <TextInput
                label="RUT de la Empresa"
                value={props.rutEmpresa}
                onChange={handleRutEmpresaChange}
                placeholder="12345678-9"
                error={rutEmpresaError}
                maxLength={10}
              />
              <TextInput
                label="Nombre de la Empresa"
                value={props.nombreEmpresa}
                onChange={props.onNombreEmpresaChange}
                placeholder="Empresa SPA"
              />
            </>
          )}

          {/* Campos compartidos (RESIDENCIAL y NEGOCIO) */}
          <TextInput
            label={isNegocio ? "RUT del Representante Legal" : "RUT"}
            value={props.rut}
            onChange={handleRutChange}
            placeholder="12345678-9"
            error={rutError}
            maxLength={10}
          />
          <TextInput
            label="Nombres"
            value={props.nombres}
            onChange={handleNombresChange}
            onBlur={handleNombresBlur}
            placeholder="Juan Carlos"
            error={nombresError}
          />
          <TextInput
            label="Apellidos"
            value={props.apellidos}
            onChange={handleApellidosChange}
            onBlur={handleApellidosBlur}
            placeholder="Pérez González"
            error={apellidosError}
          />
          <TextInput
            label="Número de Contacto"
            value={props.numeroContacto}
            onChange={handlePhoneChange}
            type="tel"
            placeholder="912345678"
            error={phoneError}
            maxLength={9}
          />
          <TextInput
            label="Email"
            value={props.email}
            onChange={props.onEmailChange}
            onBlur={handleEmailBlur}
            type="email"
            placeholder="correo@ejemplo.com"
            error={emailError}
          />

          {/* Botón Continuar */}
          {props.onContinue && (
            <button
              onClick={props.onContinue}
              disabled={!props.canContinue}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Continuar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
