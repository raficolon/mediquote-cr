import { getRFPById, aceptarCotizacion } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import AceptarButton from './AceptarButton'

function formatPrice(n: number) {
  return '₡' + n.toLocaleString('es-CR')
}

export default async function PacienteCasoPage({ params }: { params: { id: string } }) {
  const rfp = await getRFPById(params.id)
  if (!rfp) notFound()

  const cotizaciones = ((rfp.cotizaciones ?? []) as any[])
    .filter(c => c.status === 'enviada' || c.status === 'aceptada')
    .sort((a, b) => a.precio - b.precio)

  const menorPrecio = cotizaciones.length > 0 ? cotizaciones[0].precio : null
  const cotAceptada = cotizaciones.find(c => c.status === 'aceptada')
  const completada = rfp.status === 'completada'

  const steps = [
    { label: 'Solicitud enviada', done: true },
    { label: 'Cotizaciones recibidas', done: cotizaciones.length > 0 },
    { label: 'Opción elegida', done: completada },
    { label: 'Confirmado', done: completada },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="btn btn-secondary btn-sm">← Volver</Link>
        <h1 className="text-base font-medium text-gray-900">Mis cotizaciones</h1>
      </div>

      {/* Progress */}
      <div className="card mb-5">
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                  s.done ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  {s.done
                    ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    : i + 1
                  }
                </div>
                <span className={`text-[10px] text-center leading-tight max-w-[60px] ${s.done ? 'text-teal-700 font-medium' : 'text-gray-400'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 ${s.done && steps[i+1].done ? 'bg-teal-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Procedure summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
        <div className="text-sm font-medium text-gray-900">{rfp.procedimiento}</div>
        <div className="text-xs text-gray-500 mt-1">{rfp.especialidad} · {rfp.fecha_deseada ?? 'Fecha por coordinar'}</div>
      </div>

      {/* Confirmed state */}
      {completada && cotAceptada && (
        <div className="card border-teal-200 bg-teal-50 mb-5 text-center py-6">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-base font-medium text-teal-900 mb-1">Selección confirmada</div>
          <p className="text-sm text-teal-700 mb-3">
            Eligió <span className="font-medium">{cotAceptada.hospital?.nombre}</span> por <span className="font-medium">{formatPrice(cotAceptada.precio)}</span>
          </p>
          <p className="text-xs text-teal-600">El hospital se comunicará en las próximas 24–48 horas para coordinar los detalles.</p>
        </div>
      )}

      {/* Quotes */}
      {cotizaciones.length === 0 ? (
        <div className="card text-center py-12 text-sm text-gray-400">
          Esperando cotizaciones de los hospitales...
        </div>
      ) : (
        <>
          {!completada && (
            <div className="section-title">Opciones disponibles — elija la que prefiera</div>
          )}
          {completada && cotizaciones.length > 1 && (
            <div className="section-title">Todas las opciones recibidas</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cotizaciones.map((cot: any) => {
              const isBest = cot.precio === menorPrecio
              const isSelected = cot.status === 'aceptada'
              return (
                <div
                  key={cot.id}
                  className={`card relative flex flex-col ${
                    isSelected ? 'border-teal-400 ring-1 ring-teal-400' :
                    isBest && !completada ? 'border-teal-200' : ''
                  }`}
                >
                  {isBest && !isSelected && (
                    <div className="absolute -top-2.5 left-4">
                      <span className="badge badge-quoted text-[11px]">Mejor precio</span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-2.5 left-4">
                      <span className="badge badge-accepted text-[11px]">Su elección</span>
                    </div>
                  )}
                  <div className="flex-1 mt-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">{cot.hospital?.nombre}</div>
                    <div className={`text-2xl font-medium mb-3 ${isSelected ? 'text-teal-600' : 'text-gray-900'}`}>
                      {formatPrice(cot.precio)}
                    </div>
                    <div className="space-y-1.5 text-xs mb-4">
                      <div className="flex gap-2">
                        <span className="text-gray-400 w-20 shrink-0">Disponibilidad</span>
                        <span className="text-gray-700">{cot.disponibilidad}</span>
                      </div>
                      {cot.tiempo_estimado && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-20 shrink-0">Duración</span>
                          <span className="text-gray-700">{cot.tiempo_estimado}</span>
                        </div>
                      )}
                      {cot.incluye?.length > 0 && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-20 shrink-0">Incluye</span>
                          <span className="text-gray-700">{cot.incluye.join(', ')}</span>
                        </div>
                      )}
                      {cot.hospital?.zona && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-20 shrink-0">Zona</span>
                          <span className="text-gray-700">{cot.hospital.zona}</span>
                        </div>
                      )}
                      {cot.observaciones && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 w-20 shrink-0">Notas</span>
                          <span className="text-gray-700">{cot.observaciones}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!completada && (
                    <AceptarButton cotizacionId={cot.id} rfpId={rfp.id} />
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
