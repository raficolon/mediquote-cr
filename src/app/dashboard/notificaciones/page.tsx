import { getNotificaciones } from '@/lib/db'
import Link from 'next/link'

const tipoIcon: Record<string, string> = {
  nueva_rfp: '📋',
  nueva_cotizacion: '💰',
  cotizacion_aceptada: '✅',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)} día${Math.floor(hrs/24) > 1 ? 's' : ''}`
}

export default async function NotificacionesPage() {
  const notifs = await getNotificaciones()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="btn btn-secondary btn-sm">← Volver</Link>
        <h1 className="text-base font-medium text-gray-900">Notificaciones</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {notifs.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay notificaciones.</div>
        ) : (
          notifs.map(n => (
            <div
              key={n.id}
              className={`flex gap-3 px-5 py-4 border-b border-gray-50 last:border-0 ${!n.leida ? 'bg-blue-50/40' : ''}`}
            >
              <div className="text-base mt-0.5" style={{fontSize:'16px'}}>{tipoIcon[n.tipo] ?? '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{n.titulo}</div>
                {n.cuerpo && <div className="text-xs text-gray-500 mt-0.5">{n.cuerpo}</div>}
                <div className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</div>
              </div>
              {!n.leida && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
