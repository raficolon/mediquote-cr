import { getRFPsAdmisiones, getProfile } from '@/lib/db'
import Link from 'next/link'

export default async function AdmisionesDashboard() {
  const profile = await getProfile()
  const hospitalId = profile?.hospital_id
  if (!hospitalId) return <div className="text-sm text-red-500">Error: perfil sin hospital asignado.</div>

  const rfps = await getRFPsAdmisiones(hospitalId)

  const nuevas = rfps.filter(r => {
    const hasCot = (r.cotizaciones as any[])?.some((c: any) => c.hospital_id === hospitalId)
    return !hasCot
  })
  const cotizadas = rfps.filter(r => {
    return (r.cotizaciones as any[])?.some((c: any) => c.hospital_id === hospitalId && c.status === 'enviada')
  })
  const aceptadas = rfps.filter(r => {
    return (r.cotizaciones as any[])?.some((c: any) => c.hospital_id === hospitalId && c.status === 'aceptada')
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900">{(profile as any)?.hospital?.nombre ?? 'Hospital'}</h1>
        <p className="text-sm text-gray-500">Departamento de Admisiones</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Nuevas hoy</div>
          <div className={`text-2xl font-medium ${nuevas.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{nuevas.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Total recibidas</div>
          <div className="text-2xl font-medium text-gray-900">{rfps.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Cotizadas</div>
          <div className="text-2xl font-medium text-blue-600">{cotizadas.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Aceptadas</div>
          <div className="text-2xl font-medium text-teal-600">{aceptadas.length}</div>
        </div>
      </div>

      {nuevas.length > 0 && (
        <div className="mb-2">
          <div className="section-title">Solicitudes nuevas</div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">
            {nuevas.map((rfp: any) => (
              <Link key={rfp.id} href={`/quotes/responder/${rfp.id}`} className="list-row group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{rfp.procedimiento}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Paciente: {rfp.paciente_nombre} · {new Date(rfp.created_at).toLocaleDateString('es-CR')}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="badge badge-new">Nueva</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="section-title">Historial de solicitudes</div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {rfps.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay solicitudes aún.</div>
        ) : (
          rfps.map((rfp: any) => {
            const miCot = (rfp.cotizaciones as any[])?.find((c: any) => c.hospital_id === hospitalId)
            const badge = !miCot ? 'badge-new' :
              miCot.status === 'aceptada' ? 'badge-accepted' :
              miCot.status === 'rechazada' ? 'badge-rejected' : 'badge-quoted'
            const label = !miCot ? 'Nueva' :
              miCot.status === 'aceptada' ? 'Aceptada' :
              miCot.status === 'rechazada' ? 'Rechazada' : 'Cotizada'
            return (
              <Link key={rfp.id} href={`/quotes/responder/${rfp.id}`} className="list-row group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{rfp.procedimiento}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Paciente: {rfp.paciente_nombre}</div>
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
