/**
 * @fileoverview Funciones de validación y formateo para datos de formularios.
 * Incluye validadores para RUT, nombres, teléfonos, emails y direcciones chilenas.
 */

/**
 * Valida el formato de un RUT chileno.
 * @param {string} rut - RUT en formato "12345678-9" o "12345678-k"
 * @returns {boolean} true si el RUT tiene el formato válido, false en caso contrario
 * @example
 * validateRut("12345678-9") // returns true
 * validateRut("1234567") // returns false
 */
export const validateRut = (rut: string): boolean => {
  // Formato esperado: 12345678-9 o 12345678-k
  const rutRegex = /^\d{7,8}-[\dk]$/i
  return rutRegex.test(rut)
}

/**
 * Formatea un RUT eliminando caracteres no válidos y agregando el guión.
 * @param {string} value - Valor ingresado por el usuario
 * @returns {string} RUT formateado en formato "12345678-9"
 * @example
 * formatRut("123456789") // returns "12345678-9"
 * formatRut("12.345.678-9") // returns "12345678-9"
 */
export const formatRut = (value: string): string => {
  // Remover todo excepto números y k
  let cleaned = value.replace(/[^\dkK]/g, '')

  // Convertir k a minúscula
  cleaned = cleaned.toLowerCase()

  // Si tiene más de 1 caracter, agregar el guión antes del último
  if (cleaned.length > 1) {
    const body = cleaned.slice(0, -1)
    const dv = cleaned.slice(-1)
    return `${body}-${dv}`
  }

  return cleaned
}

/**
 * Valida que un nombre contenga solo letras y espacios.
 * Acepta caracteres latinos con acentos y la letra ñ.
 * @param {string} name - Nombre a validar
 * @returns {boolean} true si el nombre es válido, false en caso contrario
 * @example
 * validateName("José María") // returns true
 * validateName("José123") // returns false
 */
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  return nameRegex.test(name)
}

/**
 * Capitaliza cada palabra de un nombre (primera letra en mayúscula, resto en minúscula).
 * @param {string} name - Nombre a capitalizar
 * @returns {string} Nombre con formato de capitalización correcta
 * @example
 * capitalizeName("JOSÉ MARÍA") // returns "José María"
 * capitalizeName("pedro gonzález") // returns "Pedro González"
 */
export const capitalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Valida el formato de un teléfono chileno.
 * Debe tener 9 dígitos y comenzar con 9.
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} true si el teléfono es válido, false en caso contrario
 * @example
 * validatePhone("987654321") // returns true
 * validatePhone("87654321") // returns false
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^9\d{8}$/
  return phoneRegex.test(phone)
}

/**
 * Formatea un teléfono eliminando todos los caracteres que no sean dígitos.
 * Limita la longitud a 9 dígitos.
 * @param {string} value - Valor ingresado por el usuario
 * @returns {string} Teléfono formateado (solo números, máximo 9 dígitos)
 * @example
 * formatPhone("+56 9 8765 4321") // returns "987654321"
 * formatPhone("9876543219999") // returns "987654321"
 */
export const formatPhone = (value: string): string => {
  // Solo permitir números
  return value.replace(/\D/g, '').slice(0, 9)
}

/**
 * Valida el formato de un correo electrónico.
 * @param {string} email - Correo electrónico a validar
 * @returns {boolean} true si el email es válido, false en caso contrario
 * @example
 * validateEmail("usuario@example.com") // returns true
 * validateEmail("usuario@example") // returns false
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida el formato de una dirección.
 * Acepta letras, números, espacios y los caracteres especiales . ' - #
 * @param {string} address - Dirección a validar
 * @returns {boolean} true si la dirección es válida, false en caso contrario
 * @example
 * validateAddress("Av. Libertador 123 #45") // returns true
 * validateAddress("Calle @ Inválida") // returns false
 */
export const validateAddress = (address: string): boolean => {
  const addressRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.'#-]+$/
  return addressRegex.test(address)
}

/**
 * Formatea una dirección eliminando caracteres no permitidos.
 * Solo mantiene letras, números, espacios y los caracteres . ' - #
 * @param {string} value - Valor ingresado por el usuario
 * @returns {string} Dirección formateada
 * @example
 * formatAddress("Av. Libertador 123 @ #45") // returns "Av. Libertador 123  #45"
 */
export const formatAddress = (value: string): string => {
  // Solo permitir caracteres válidos
  return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.'#-]/g, '')
}

/**
 * Mensajes de error predefinidos para validaciones de formulario.
 * @constant
 * @type {Object.<string, string>}
 */
export const errorMessages = {
  rut: "Por favor verifica el RUT, solo números y la letra 'K'",
  name: "Solo se permiten letras y espacios",
  phone: "El teléfono debe comenzar con 9 y tener 9 dígitos",
  email: "Por favor ingresa un correo electrónico válido",
  address: "Solo se permiten letras, números, espacios y los caracteres . ' - #",
  required: "Este campo es obligatorio"
}
