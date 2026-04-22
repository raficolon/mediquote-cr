import { NextRequest, NextResponse } from 'next/server'
import { enviarCotizacion } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { rfp_id, hospital_id, ...form } = body
    const cot = await enviarCotizacion(rfp_id, hospital_id, form)
    return NextResponse.json({ id: cot.id })
  } catch (err) {
    console.error('Error enviando cotización:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
