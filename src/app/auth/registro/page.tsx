'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types'

export default function RegistroPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole | ''>('')
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', telefono: '',
    especialidad: '', cedula_medica: '', cedula: '', hospital_id: '',
  })
  const [hospitales, setHospitales] = useState<{id:string,nombre:string}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function loadHospitales() {
    const { data } = await supabase.from('hospitales').select('id, nombre').eq('activo', true)
    setHospitales(data ?? [])
  }

  function selectRole(r: UserRole) {
    setRole(r)
    if (r === 'admisiones') loadHospitales()
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Error al registrar.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      especialidad: role === 'doctor' ? form.especialidad : null,
      cedula_medica: role === 'doctor' ? form.cedula_medica : null,
      cedula: role === 'paciente' ? form.cedula : null,
      hospital_id: role === 'admisiones' ? form.hospital_id : null,
    })

    if (profileError) {
      setError('Error al crear perfil. Intente de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const roleLabels: Record<UserRole, string> = {
    doctor: 'Médico',
    admisiones: 'Hospital — Admisiones',
    paciente: 'Paciente',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="text-xl font-medium">MediQuote CR</span>
          </div>
          <p className="text-sm text-gray-500">Crear cuenta</p>
        </div>

        {step === 1 && (
          <div className="card">
            <p className="text-sm font-medium text-gray-900 mb-4">¿Cuál es su rol?</p>
            <div className="space-y-3">
              {(['doctor', 'admisiones', 'paciente'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => selectRole(r)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition-all"
                >
                  <div className="text-sm font-medium text-gray-900">{roleLabels[r]}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-600">← Volver</button>
              <span className="text-sm font-medium text-gray-900">Datos de {roleLabels[role as UserRole]}</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre completo</label>
                <input className="input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div>
                <label className="label">Correo electrónico</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <label className="label">Contraseña</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={8} required />
              </div>
              <div>
                <label className="label">Teléfono (opcional)</label>
                <input className="input" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="+506 8888-8888" />
              </div>

              {role === 'doctor' && (<>
                <div>
                  <label className="label">Especialidad</label>
                  <select className="input" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    <option>Cirugía general</option>
                    <option>Ortopedia</option>
                    <option>Cardiología</option>
                    <option>Ginecología</option>
                    <option>Urología</option>
                    <option>Neurología</option>
                    <option>Pediatría</option>
                    <option>Medicina interna</option>
                  </select>
                </div>
                <div>
                  <label className="label">Número de cédula médica</label>
                  <input className="input" value={form.cedula_medica} onChange={e => setForm({...form, cedula_medica: e.target.value})} required />
                </div>
              </>)}

              {role === 'admisiones' && (
                <div>
                  <label className="label">Hospital</label>
                  <select className="input" value={form.hospital_id} onChange={e => setForm({...form, hospital_id: e.target.value})} required>
                    <option value="">Seleccione hospital...</option>
                    {hospitales.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                  </select>
                </div>
              )}

              {role === 'paciente' && (
                <div>
                  <label className="label">Número de cédula</label>
                  <input className="input" value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} placeholder="X-XXXX-XXXX" required />
                </div>
              )}

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          ¿Ya tiene cuenta?{' '}
          <a href="/auth/login" className="text-teal-600 hover:underline">Ingresar</a>
        </p>
      </div>
    </div>
  )
}
