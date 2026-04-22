'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AceptarButton({ cotizacionId, rfpId }: { cotizacionId: string; rfpId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAceptar() {
    if (!confirm('¿Confirmar esta opción? Esta acción notificará al médico y al hospital.')) return
    setLoading(true)
    await fetch('/api/quotes/aceptar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cotizacion_id: cotizacionId, rfp_id: rfpId }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleAceptar}
      disabled={loading}
      className="btn btn-primary w-full justify-center text-xs"
    >
      {loading ? 'Confirmando...' : 'Elegir esta opción'}
    </button>
  )
}
