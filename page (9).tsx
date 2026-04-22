import { NextRequest, NextResponse } from 'next/server'
import { aceptarCotizacion } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { cotizacion_id, rfp_id } = await req.json()
    await aceptarCotizacion(cotizacion_id, rfp_id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error aceptando cotización:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
