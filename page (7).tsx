import { NextRequest, NextResponse } from 'next/server'
import { rechazarRFP } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { rfp_id, hospital_id } = await req.json()
    await rechazarRFP(rfp_id, hospital_id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error rechazando RFP:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
