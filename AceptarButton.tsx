import { getRFPById } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Cotizacion } from '@/types'

const urgenciaLabel: Record<string, string> = {
  electiva: 'Electiva', semi_urgente: 'Semi-urgente', urgente: 'Urgente'
}

function formatPrice(n: number) {
  return '₡' + n.toLocaleString('es-CR')
}

export default async function RFPDetailPage({ params }: { params: { id: string } }) {
  const rfp = await getRFPById(params.id)
  if (!rfp) notFound()

  const cotizaciones: Cotizacion[] = (rfp.cotizaciones ?? []).filter((c: any) => c.status !== 'rechazada')
  const menorPrecio = cotizaciones.length > 0 ? Math.min(...cotizaciones.map((c: any) => c.precio)) : null

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="btn btn-secondary btn-sm">← Volver</Link>
        <h1 className="text-base font-medium text-gray-900">Detalle de RFP</h1>
      </div>

      {/* RFP Info */}
      <div className="card mb-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-base font-medium text-gray-900">{rfp.procedimiento}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Paciente: {rfp.paciente_nombre} {rfp.paciente_cedula && `· ${rfp.paciente_cedula}`}</p>
          </div>
          <span className={`badge ${cotizaciones.length > 0 ? 'badge-new' : 'badge-pending'}`}>
            {cotizaciones.length > 0 ? `${cotizaciones.length} cotización${cotizaciones.length > 1 ? 'es' : ''}` : 'Esperando'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{rfp.especialidad}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{urgenciaLabel[rfp.urgencia]}</span>
          {rfp.fecha_deseada && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{rfp.fecha_deseada}</span>}
        </div>
        {rfp.notas_clinicas && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <span className="font-medium text-gray-400 block mb-1">Notas clínicas</span>
            {rfp.notas_clinicas}
          </div>
        )}
      </div>

      {/* Quotes */}
      {cotizaciones.length === 0 ? (
        <div className="card text-center py-10 text-sm text-gray-400">
          Esperando respuesta de los hospitales...
        </div>
      ) : (
        <>
          <div className="section-title">Comparación de cotizaciones</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {cotizaciones.map((cot: any) => {
              const isBest = cot.precio === menorPrecio
              return (
                <div key={cot.id} className={`card relative ${isBest ? 'border-teal-300 ring-1 ring-teal-300' : ''}`}>
                  {isBest && (
                    <div className="absolute -top-2.5 left-4">
                      <span className="badge badge-quoted text-[11px]">Mejor precio</span>
                    </div>
                  )}
                  <div className="mt-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">{cot.hospital?.nombre}</div>
                    <div className="text-2xl font-medium text-teal-600 mb-3">{formatPrice(cot.precio)}</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Disponibilidad</span><span className="text-gray-700">{cot.disponibilidad}</span></div>
                      {cot.tiempo_estimado && <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Duración</span><span className="text-gray-700">{cot.tiempo_estimado}</span></div>}
                      {cot.incluye?.length > 0 && <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Incluye</span><span className="text-gray-700">{cot.incluye.join(', ')}</span></div>}
                      {cot.observaciones && <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Notas</span><span className="text-gray-700">{cot.observaciones}</span></div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3">
            <Link href={`/rfp/${rfp.id}/enviar-paciente`} className="btn btn-primary">
              Enviar opciones al paciente
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
