/* eslint-disable  @typescript-eslint/no-explicit-any */
import { reactive } from 'vue'

export const messages = reactive({
  isPhone: 'No es un numero de teléfono valido',
  requiredSelect: 'No puede estar vacio',
  minLength: 'No debe contener menos de',
  maxLength: 'No debe contener mas de',
  isCedula: 'No es una cedula valida',
  required: 'No puede estar vacio',
  validateBirthdate: 'Fecha fuera de rango o inválida',
})

export const required = (val: string) => {
  return (val && val.length > 0) || messages.required
}

export const phoneNumberVe = (val: string) => {
  if (typeof val !== 'string') return messages.isPhone
  const trimmedVal = '04' + val.trim()
  return /^(04(12|14|16|24|26))\d{7}$/.test(trimmedVal) || messages.isPhone
}

export const maxLength = (val: string, maxCaracter = 30) => {
  return val.length <= maxCaracter || `${messages.maxLength} ${maxCaracter}`
}

export const minLength = (val: string, minCaracter = 3) => {
  return val.length >= minCaracter || `${messages.minLength} ${minCaracter}`
}

export const isCedula = (val: string) => {
  const cedulaRegex = /^\d{7,8}$/
  return cedulaRegex.test(val) || messages.isCedula
}

export const requiredSelect = (val: any) => {
  return (val.title && val.title.length) || messages.requiredSelect
}

export const isPhone = (val: string) => {
  const valuePhone = '04' + val.trim()
  const phoneRegex =
    /^(?:(?:\+58|58|0)(?:\d{3})?\d{7}|(?:\+57|57|0)(?:\d{3})?\d{7,10}|(?:\+56|56|0)(?:\d{2})?\d{8}|(?:\+593|593|0)(?:\d{2})?\d{7,9}|(?:\+1|1|0)(?:\d{3})?\d{7}|(?:\+34|34|0)(?:\d{2})?\d{8})$/

  const venezuelaPhoneRegex = /^(0412|0424|0414|0416|0426)\d{7}$/

  return (venezuelaPhoneRegex.test(valuePhone) && phoneRegex.test(valuePhone)) || messages.isPhone
}

export const validateBirthdate = (val: string) => {
  if (!val) return 'Campo requerido'
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
  if (!dateRegex.test(val)) return 'Formato inválido: DD/MM/AAAA'

  const [day, month, year] = val.split('/').map(Number)
  if (typeof year === 'undefined' || typeof month === 'undefined' || typeof day === 'undefined') {
    return messages.validateBirthdate
  }

  const birthdate = new Date(year, month - 1, day)
  const today = new Date()

  if (
    year < 1900 ||
    (birthdate > today && year > today.getFullYear()) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    birthdate.getDate() !== day ||
    birthdate.getMonth() !== month - 1 ||
    birthdate.getFullYear() !== year
  ) {
    return messages.validateBirthdate
  }

  return true
}
