import { getRFPsPaciente, getProfile } from '@/lib/db'
import Link from 'next/link'

export default async function PacienteDashboard() {
  const [rfps, profile] = await Promise.all([getRFPsPaciente(), getProfile()])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900">Hola, {profile?.nombre.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500">Sus cotizaciones médicas</p>
      </div>

      <div className="section-title">Mis casos</div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {rfps.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No tiene cotizaciones activas. Su médico le enviará una cuando esté listo.
          </div>
        ) : (
          rfps.map((rfp: any) => {
            const cotizaciones = rfp.cotizaciones ?? []
            const aceptada = cotizaciones.find((c: any) => c.status === 'aceptada')
            const numCots = cotizaciones.filter((c: any) => c.status === 'enviada').length

            const badge = aceptada ? 'badge-accepted' : numCots > 0 ? 'badge-new' : 'badge-pending'
            const label = aceptada ? 'Confirmado' : numCots > 0 ? `${numCots} cotización${numCots > 1 ? 'es' : ''}` : 'Esperando'

            return (
              <Link key={rfp.id} href={`/paciente/${rfp.id}`} className="list-row group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{rfp.procedimiento}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {rfp.especialidad} · {new Date(rfp.created_at).toLocaleDateString('es-CR')}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`badge ${badge}`}>{label}</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
