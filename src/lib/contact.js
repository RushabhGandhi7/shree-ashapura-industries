import { company } from '../data/content.js'

export const telHref = (num = company.phone.e164) => `tel:${num}`

export const whatsappHref = (message = '') => {
  const base = `https://wa.me/${company.phone.wa}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const mailtoHref = ({ subject = '', body = '' } = {}) => {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const qs = params.toString().replace(/\+/g, '%20')
  return `mailto:${company.email}${qs ? `?${qs}` : ''}`
}
