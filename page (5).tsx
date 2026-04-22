import { NextRequest, NextResponse } from 'next/server'
import { crearRFP } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rfp = await crearRFP(body)
    return NextResponse.json({ id: rfp.id })
  } catch (err) {
    console.error('Error creando RFP:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
