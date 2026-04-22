'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    load()
  }, [])

  if (!profile) return <div className="text-sm text-gray-400 py-12 text-center">Cargando...</div>

  if (profile.role === 'doctor') return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium">Bienvenido, {profile.nombre.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500">{profile.especialidad}</p>
        </div>
        <Link href="/rfp/nueva" className="btn btn-primary">+ Nueva RFP</Link>
      </div>
      <p className="text-sm text-gray-500">No hay solicitudes aún. Cree su primera RFP.</p>
    </div>
  )

  if (profile.role === 'admisiones') return (
    <div>
      <h1 className="text-lg font-medium mb-2">Panel de Admisiones</h1>
      <p className="text-sm text-gray-500">No hay solicitudes pendientes.</p>
    </div>
  )

  if (profile.role === 'paciente') return (
    <div>
      <h1 className="text-lg font-medium mb-2">Hola, {profile.nombre.split(' ')[0]}</h1>
      <p className="text-sm text-gray-500">No tiene cotizaciones activas.</p>
    </div>
  )

  return <div>Rol desconocido</div>
}