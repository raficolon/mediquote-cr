import { getRFPsDoctor, getProfile } from '@/lib/db'
import Link from 'next/link'
import type { RFP } from '@/types'

const statusLabel: Record<string, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  con_cotizaciones: 'Con cotizaciones',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

const statusBadge: Record<string, string> = {
  borrador: 'badge-pending',
  enviada: 'badge-pending',
  con_cotizaciones: 'badge-new',
  completada: 'badge-accepted',
  cancelada: 'badge-rejected',
}

export default async function DoctorDashboard() {
  const [rfps, profile] = await Promise.all([getRFPsDoctor(), getProfile()])

  const stats = {
    total: rfps.length,
    conCotizaciones: rfps.filter(r => r.status === 'con_cotizaciones').length,
    completadas: rfps.filter(r => r.status === 'completada').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Bienvenido, {profile?.nombre.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500">{profile?.especialidad}</p>
        </div>
        <Link href="/rfp/nueva" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva RFP
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">RFPs enviadas</div>
          <div className="text-2xl font-medium text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Con cotizaciones</div>
          <div className="text-2xl font-medium text-blue-600">{stats.conCotizaciones}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Completadas</div>
          <div className="text-2xl font-medium text-teal-600">{stats.completadas}</div>
        </div>
      </div>

      {/* RFP List */}
      <div className="section-title">Solicitudes activas</div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {rfps.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No hay solicitudes aún.{' '}
            <Link href="/rfp/nueva" className="text-teal-600 hover:underline">Crear una RFP</Link>
          </div>
        ) : (
          rfps.map((rfp: RFP) => {
            const numCotizaciones = (rfp.cotizaciones as any[])?.length ?? 0
            return (
              <Link key={rfp.id} href={`/rfp/${rfp.id}`} className="list-row group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {rfp.paciente_nombre} — {rfp.procedimiento}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(rfp.created_at).toLocaleDateString('es-CR')}
                    {numCotizaciones > 0 && ` · ${numCotizaciones} cotización${numCotizaciones > 1 ? 'es' : ''}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`badge ${statusBadge[rfp.status]}`}>
                    {statusLabel[rfp.status]}
                  </span>
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
