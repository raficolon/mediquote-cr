'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Hospital, NuevaRFPForm } from '@/types'

const especialidades = ['Cirugía general','Ortopedia','Cardiología','Ginecología','Urología','Neurología','Pediatría','Medicina interna','Oftalmología','Otorrinolaringología']

export default function NuevaRFPPage() {
  const router = useRouter()
  const supabase = createClient()
  const [hospitales, setHospitales] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<NuevaRFPForm>({
    procedimiento: '', especialidad: '', urgencia: 'electiva',
    fecha_deseada: '', notas_clinicas: '', paciente_nombre: '',
    paciente_cedula: '', hospital_ids: [],
  })

  useEffect(() => {
    supabase.from('hospitales').select('*').eq('activo', true).then(({ data }) => {
      setHospitales(data ?? [])
    })
  }, [])

  function toggleHospital(id: string) {
    setForm(f => ({
      ...f,
      hospital_ids: f.hospital_ids.includes(id)
        ? f.hospital_ids.filter(h => h !== id)
        : [...f.hospital_ids, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.hospital_ids.length === 0) {
      alert('Seleccione al menos un hospital.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/rfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al crear RFP')
      const { id } = await res.json()
      router.push(`/rfp/${id}`)
    } catch (err) {
      alert('Error al enviar la solicitud. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn btn-secondary btn-sm">← Volver</button>
        <h1 className="text-base font-medium text-gray-900">Nueva solicitud de cotización</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Paciente */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Datos del paciente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre completo *</label>
              <input className="input" value={form.paciente_nombre} onChange={e => setForm({...form, paciente_nombre: e.target.value})} required />
            </div>
            <div>
              <label className="label">Cédula</label>
              <input className="input" value={form.paciente_cedula} onChange={e => setForm({...form, paciente_cedula: e.target.value})} placeholder="X-XXXX-XXXX" />
            </div>
          </div>
        </div>

        {/* Procedimiento */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Procedimiento</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Nombre del procedimiento *</label>
              <input className="input" value={form.procedimiento} onChange={e => setForm({...form, procedimiento: e.target.value})} placeholder="Ej. Colecistectomía laparoscópica" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Especialidad *</label>
                <select className="input" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} required>
                  <option value="">Seleccione...</option>
                  {especialidades.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Urgencia *</label>
                <select className="input" value={form.urgencia} onChange={e => setForm({...form, urgencia: e.target.value as any})}>
                  <option value="electiva">Electiva</option>
                  <option value="semi_urgente">Semi-urgente (30 días)</option>
                  <option value="urgente">Urgente (7 días)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Fecha aproximada deseada</label>
              <input className="input" value={form.fecha_deseada} onChange={e => setForm({...form, fecha_deseada: e.target.value})} placeholder="Ej. junio 2025" />
            </div>
            <div>
              <label className="label">Notas clínicas para el hospital</label>
              <textarea
                className="input min-h-[80px]"
                value={form.notas_clinicas}
                onChange={e => setForm({...form, notas_clinicas: e.target.value})}
                placeholder="Comorbilidades, alergias, medicamentos actuales, notas relevantes..."
              />
            </div>
          </div>
        </div>

        {/* Hospitales */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-1">Enviar solicitud a hospitales *</h2>
          <p className="text-xs text-gray-400 mb-4">Seleccione uno o más. Cada hospital recibirá una notificación.</p>
          <div className="space-y-2">
            {hospitales.map(h => (
              <label key={h.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.hospital_ids.includes(h.id) ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="checkbox"
                  checked={form.hospital_ids.includes(h.id)}
                  onChange={() => toggleHospital(h.id)}
                  className="w-4 h-4 accent-teal-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{h.nombre}</div>
                  {h.zona && <div className="text-xs text-gray-400">{h.zona}, {h.provincia}</div>}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Enviando...' : 'Enviar RFP a hospitales'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
