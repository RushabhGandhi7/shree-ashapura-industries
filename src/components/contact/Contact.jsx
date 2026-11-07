import { useId, useMemo, useState } from 'react'
import { content, company } from '../../data/content.js'
import { mailtoHref, telHref, whatsappHref } from '../../lib/contact.js'
import Button from '../ui/Button.jsx'
import { MailIcon, PhoneIcon, WhatsAppIcon, ArrowUpRight } from '../ui/Icons.jsx'

const t = content.contact
const f = t.form
const address = company.address.lines.join(', ')
const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(`Shree Ashapura Industries, ${address}`)}&z=16&output=embed`
const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`

function Field({ id, label, optional, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3">
        <span className="label-mono text-steel-700">
          {label}
          {!optional && <span className="text-red" aria-hidden> *</span>}
        </span>
        {optional && <span className="label-mono text-steel-500">{f.optional}</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[12px] text-steel-700">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-[12px] font-medium text-red" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls =
  'block w-full rounded-xs border border-steel-300 bg-paper px-3 py-2.5 text-body text-ink placeholder:text-steel-500 transition-colors focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red aria-[invalid=true]:border-red'

export default function Contact() {
  const uid = useId().replace(/:/g, '')
  const id = (k) => `${uid}-${k}`
  const [v, setV] = useState({ name: '', company: '', phone: '', requirement: '', quantity: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const message = useMemo(() => f.message(v), [v])
  const mail = mailtoHref({ subject: f.subject(v.name || 'website'), body: message })

  const validate = () => {
    const e = {}
    if (!v.name.trim()) e.name = f.errors.name
    if (v.phone.replace(/\D/g, '').length < 8) e.phone = f.errors.phone
    if (!v.requirement.trim()) e.requirement = f.errors.requirement
    setErrors(e)
    return e
  }

  const submit = (ev) => {
    ev.preventDefault()
    const e = validate()
    const first = Object.keys(e)[0]
    if (first) {
      document.getElementById(id(first))?.focus()
      return
    }
    window.open(whatsappHref(message), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  const bind = (k) => ({
    id: id(k),
    name: k,
    value: v[k],
    onChange: (e) => setV((s) => ({ ...s, [k]: e.target.value })),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${id(k)}-err` : undefined,
  })

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative section-y overflow-hidden bg-paper">
      <div className="bp-grid bp-grid-fade pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="container-x relative">
        <p className="label-mono mb-6 flex items-center gap-3 text-steel-700">
          <span className="h-px w-8 bg-red" aria-hidden />
          {t.label}
        </p>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* form */}
          <div className="lg:col-span-7">
            <h2 id="contact-title" className="text-h2">
              {t.title[0]} <span className="text-red">{t.title[1]}</span>
            </h2>
            <p className="mt-5 max-w-[46ch] text-steel-700">{t.lead}</p>

            <form noValidate onSubmit={submit} className="mt-10 grid gap-5 rounded-xs border border-steel-300 bg-paper p-5 sm:grid-cols-2 sm:p-8">
              <Field id={id('name')} label={f.name} error={errors.name}>
                <input {...bind('name')} type="text" autoComplete="name" required className={inputCls} />
              </Field>
              <Field id={id('company')} label={f.company} optional>
                <input {...bind('company')} type="text" autoComplete="organization" className={inputCls} />
              </Field>
              <Field id={id('phone')} label={f.phone} error={errors.phone}>
                <input {...bind('phone')} type="tel" inputMode="tel" autoComplete="tel" required placeholder="+91" className={inputCls} />
              </Field>
              <Field id={id('quantity')} label={f.quantity} optional hint={f.quantityHint}>
                <input {...bind('quantity')} type="text" inputMode="text" aria-describedby={`${id('quantity')}-hint`} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field id={id('requirement')} label={f.requirement} error={errors.requirement} hint={f.requirementHint}>
                  <textarea
                    {...bind('requirement')}
                    rows={4}
                    required
                    aria-describedby={errors.requirement ? `${id('requirement')}-err` : `${id('requirement')}-hint`}
                    className={`${inputCls} resize-y`}
                  />
                </Field>
              </div>
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" icon={<WhatsAppIcon />} magnetic={false} className="sm:w-auto">
                  {f.submit}
                </Button>
                <a href={mail} className="inline-flex items-center gap-2 px-1 py-2 text-small font-medium text-ink underline decoration-steel-300 underline-offset-4 hover:text-red hover:decoration-red">
                  <MailIcon size={16} /> {f.email}
                </a>
              </div>
              {sent && (
                <p className="text-small text-steel-700 sm:col-span-2" role="status">
                  {f.sent}
                </p>
              )}
            </form>
          </div>

          {/* details + map */}
          <aside className="flex flex-col gap-6 lg:col-span-5">
            <div className="grid gap-6 rounded-xs border border-steel-300 bg-paper p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-1">
              <div>
                <h3 className="label-mono mb-3 font-medium [font-stretch:100%] text-steel-500">{t.addressTitle}</h3>
                <address className="text-small leading-relaxed not-italic">
                  <strong className="font-semibold">{company.name}</strong>
                  {company.address.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
                <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-small font-medium text-red hover:text-red-deep">
                  {t.directions} <ArrowUpRight size={14} />
                </a>
              </div>
              <div>
                <h3 className="label-mono mb-3 font-medium [font-stretch:100%] text-steel-500">{t.hoursTitle}</h3>
                <dl className="space-y-1 text-small">
                  {t.hours.map(([d, h]) => (
                    <div key={d} className="flex justify-between gap-4">
                      <dt className="text-steel-700">{d}</dt>
                      <dd className="font-medium">{h}</dd>
                    </div>
                  ))}
                </dl>
                <h3 className="label-mono mt-5 mb-2 font-medium [font-stretch:100%] text-steel-500">{t.callTitle}</h3>
                <p className="text-small">
                  <a href={telHref()} className="inline-block py-1 font-medium hover:text-red">
                    {company.phone.display}
                  </a>
                  <br />
                  <a href={telHref(company.landline.e164)} className="inline-block py-1 font-medium hover:text-red">
                    {company.landline.display}
                  </a>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-1">
                <Button href={telHref()} icon={<PhoneIcon />} aria-label={`${t.call}: ${company.phone.display}`}>
                  {t.call}
                </Button>
                <Button href={whatsappHref(content.whatsappMessages.general)} variant="outline" icon={<WhatsAppIcon />}>
                  {t.whatsapp}
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xs border border-steel-300 bg-paper-2 lg:flex-1">
              <iframe
                title={t.mapTitle}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 [filter:grayscale(0.85)_contrast(0.95)]"
                allowFullScreen
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
