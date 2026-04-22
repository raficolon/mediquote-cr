'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { RFP } from '@/types'

const urgenciaLabel: Record<string, string> = {
  electiva: 'Electiva', semi_urgente: 'Semi-urgente', urgente: 'Urgente'
}

const incluye_opciones = [
  'Sala quirúrgica', 'Anestesia', 'Honorarios cirujano',
  'Internamiento 1 noche', 'Laboratorios preop.', 'Medicamentos al alta',
  'Fisioterapia postop.', 'Consulta de seguimiento',
]

export default function ResponderRFPPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [rfp, setRfp] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [miCotizacion, setMiCotizacion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<'quoted' | 'rejected' | null>(null)
  const [form, setForm] = useState({
    precio: '',
    disponibilidad: '',
    tiempo_estimado: '',
    incluye: [] as string[],
    observaciones: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: prof } = await supabase
        .from('profiles')
        .select('*, hospital:hospitales(*)')
        .eq('id', user!.id)
        .single()
      setProfile(prof)

      const { data: rfpData } = await supabase
        .from('rfps')
        .select('*')
        .eq('id', params.id)
        .single()
      setRfp(rfpData)

      if (prof?.hospital_id) {
        const { data: cot } = await supabase
          .from('cotizaciones')
          .select('*')
          .eq('rfp_id', params.id)
          .eq('hospital_id', prof.hospital_id)
          .maybeSingle()
        setMiCotizacion(cot)
        if (cot?.status === 'rechazada') setDone('rejected')
        if (cot?.status === 'enviada' || cot?.status === 'aceptada') setDone('quoted')
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  function toggleIncluye(item: string) {
    setForm(f => ({
      ...f,
      incluye: f.incluye.includes(item)
        ? f.incluye.filter(i => i !== item)
        : [...f.incluye, item],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.precio || !form.disponibilidad) return
    setSubmitting(true)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rfp_id: params.id,
        hospital_id: profile.hospital_id,
        precio: parseInt(form.precio),
        disponibilidad: form.disponibilidad,
        tiempo_estimado: form.tiempo_estimado,
        incluye: form.incluye,
        observaciones: form.observaciones,
      }),
    })
    setSubmitting(false)
    if (res.ok) setDone('quoted')
  }

  async function handleRechazar() {
    if (!confirm('¿Seguro que desea rechazar esta solicitud?')) return
    setSubmitting(true)
    await fetch('/api/quotes/rechazar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfp_id: params.id, hospital_id: profile.hospital_id }),
    })
    setSubmitting(false)
    setDone('rejected')
  }

  if (loading) return <div className="text-sm text-gray-400 py-12 text-center">Cargando...</div>
  if (!rfp) return <div className="text-sm text-red-500">Solicitud no encontrada.</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn btn-secondary btn-sm">← Volver</button>
        <h1 className="text-base font-medium text-gray-900">Detalle de solicitud</h1>
      </div>

      {/* RFP info */}
      <div className="card mb-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-base font-medium text-gray-900">{rfp.procedimiento}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{rfp.especialidad}</p>
          </div>
          <span className="badge badge-new">Nueva</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-0.5">Paciente</div>
            <div className="text-sm font-medium">{rfp.paciente_nombre}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-0.5">Cédula</div>
            <div className="text-sm font-medium">{rfp.paciente_cedula ?? '—'}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-0.5">Urgencia</div>
            <div className="text-sm font-medium">{urgenciaLabel[rfp.urgencia]}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-0.5">Fecha deseada</div>
            <div className="text-sm font-medium">{rfp.fecha_deseada ?? '—'}</div>
          </div>
        </div>
        {rfp.notas_clinicas && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
            <span className="font-medium block mb-1">Notas clínicas</span>
            {rfp.notas_clinicas}
          </div>
        )}
      </div>

      {/* Done states */}
      {done === 'quoted' && (
        <div className="card text-center py-10">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-base font-medium text-gray-900 mb-1">Cotización enviada</div>
          <p className="text-sm text-gray-400 mb-4">El médico fue notificado. Si el paciente acepta, recibirán confirmación.</p>
          {miCotizacion && (
            <div className="inline-block text-left bg-gray-50 rounded-xl px-5 py-4 mb-4">
              <div className="text-xs text-gray-400 mb-0.5">Precio cotizado</div>
              <div className="text-xl font-medium text-teal-600">₡{miCotizacion.precio?.toLocaleString('es-CR')}</div>
              <div className="text-xs text-gray-500 mt-1">{miCotizacion.disponibilidad}</div>
            </div>
          )}
          <div><button onClick={() => router.push('/dashboard')} className="btn btn-secondary">Volver al panel</button></div>
        </div>
      )}

      {done === 'rejected' && (
        <div className="card text-center py-10">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="text-base font-medium text-gray-900 mb-1">Solicitud rechazada</div>
          <p className="text-sm text-gray-400 mb-4">Se notificó al médico que no pueden cotizar en este momento.</p>
          <button onClick={() => router.push('/dashboard')} className="btn btn-secondary">Volver al panel</button>
        </div>
      )}

      {/* Quote form */}
      {!done && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="section-title">Preparar cotización</div>
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Precio total (₡) *</label>
                <input
                  className="input"
                  type="number"
                  value={form.precio}
                  onChange={e => setForm({...form, precio: e.target.value})}
                  placeholder="Ej. 1850000"
                  required
                />
              </div>
              <div>
                <label className="label">Disponibilidad *</label>
                <input
                  className="input"
                  value={form.disponibilidad}
                  onChange={e => setForm({...form, disponibilidad: e.target.value})}
                  placeholder="Ej. 10–15 junio 2025"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Tiempo estimado del procedimiento</label>
              <input
                className="input"
                value={form.tiempo_estimado}
                onChange={e => setForm({...form, tiempo_estimado: e.target.value})}
                placeholder="Ej. 45–60 minutos"
              />
            </div>

            <div>
              <label className="label">¿Qué incluye el precio?</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {incluye_opciones.map(op => (
                  <label
                    key={op}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      form.incluye.includes(op) ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.incluye.includes(op)}
                      onChange={() => toggleIncluye(op)}
                      className="w-3.5 h-3.5 accent-teal-600"
                    />
                    {op}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Observaciones para el médico</label>
              <textarea
                className="input min-h-[72px]"
                value={form.observaciones}
                onChange={e => setForm({...form, observaciones: e.target.value})}
                placeholder="Condiciones especiales, requerimientos previos, notas..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn btn-blue">
              {submitting ? 'Enviando...' : 'Enviar cotización al médico'}
            </button>
            <button
              type="button"
              onClick={handleRechazar}
              disabled={submitting}
              className="btn btn-danger"
            >
              Rechazar solicitud
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
