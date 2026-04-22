import { createClient } from './supabase/server'
import type { NuevaCotizacionForm, NuevaRFPForm } from '@/types'

// ─── Perfil ───────────────────────────────────────────────
export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*, hospital:hospitales(*)')
    .eq('id', user.id)
    .single()
  return data
}

// ─── Hospitales ───────────────────────────────────────────
export async function getHospitales() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hospitales')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  return data ?? []
}

// ─── RFPs ─────────────────────────────────────────────────
export async function getRFPsDoctor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('rfps')
    .select(`
      *,
      cotizaciones(*, hospital:hospitales(*)),
      rfp_hospitales(*, hospital:hospitales(*))
    `)
    .eq('doctor_id', user!.id)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getRFPsAdmisiones(hospitalId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rfps')
    .select(`
      *,
      rfp_hospitales!inner(hospital_id),
      cotizaciones(id, status, hospital_id)
    `)
    .eq('rfp_hospitales.hospital_id', hospitalId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getRFPsPaciente() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('rfps')
    .select(`
      *,
      cotizaciones(*, hospital:hospitales(*))
    `)
    .eq('paciente_id', user!.id)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getRFPById(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rfps')
    .select(`
      *,
      doctor:profiles!doctor_id(nombre, especialidad),
      cotizaciones(*, hospital:hospitales(*)),
      rfp_hospitales(*, hospital:hospitales(*))
    `)
    .eq('id', id)
    .single()
  return data
}

// ─── Crear RFP ────────────────────────────────────────────
export async function crearRFP(form: NuevaRFPForm) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rfp, error } = await supabase
    .from('rfps')
    .insert({
      doctor_id: user!.id,
      procedimiento: form.procedimiento,
      especialidad: form.especialidad,
      urgencia: form.urgencia,
      fecha_deseada: form.fecha_deseada,
      notas_clinicas: form.notas_clinicas,
      paciente_nombre: form.paciente_nombre,
      paciente_cedula: form.paciente_cedula,
      status: 'enviada',
    })
    .select()
    .single()

  if (error || !rfp) throw error

  // Asociar hospitales
  if (form.hospital_ids.length > 0) {
    await supabase.from('rfp_hospitales').insert(
      form.hospital_ids.map(hid => ({ rfp_id: rfp.id, hospital_id: hid }))
    )
  }

  // Crear notificaciones para cada hospital de admisiones
  const { data: admisiones } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admisiones')
    .in('hospital_id', form.hospital_ids)

  if (admisiones?.length) {
    await supabase.from('notificaciones').insert(
      admisiones.map(a => ({
        usuario_id: a.id,
        tipo: 'nueva_rfp',
        titulo: 'Nueva solicitud de cotización',
        cuerpo: `${form.procedimiento} para ${form.paciente_nombre}`,
        rfp_id: rfp.id,
      }))
    )
  }

  return rfp
}

// ─── Cotizaciones ─────────────────────────────────────────
export async function getCotizacionesByRFP(rfpId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cotizaciones')
    .select('*, hospital:hospitales(*)')
    .eq('rfp_id', rfpId)
    .order('precio')
  return data ?? []
}

export async function enviarCotizacion(rfpId: string, hospitalId: string, form: NuevaCotizacionForm) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cotizacion, error } = await supabase
    .from('cotizaciones')
    .insert({
      rfp_id: rfpId,
      hospital_id: hospitalId,
      admisiones_id: user!.id,
      precio: form.precio,
      disponibilidad: form.disponibilidad,
      tiempo_estimado: form.tiempo_estimado,
      incluye: form.incluye,
      observaciones: form.observaciones,
      status: 'enviada',
    })
    .select()
    .single()

  if (error) throw error

  // Actualizar status de la RFP
  await supabase
    .from('rfps')
    .update({ status: 'con_cotizaciones' })
    .eq('id', rfpId)

  // Notificar al doctor
  const { data: rfp } = await supabase
    .from('rfps')
    .select('doctor_id, procedimiento, paciente_nombre')
    .eq('id', rfpId)
    .single()

  if (rfp) {
    const { data: hospital } = await supabase
      .from('hospitales')
      .select('nombre')
      .eq('id', hospitalId)
      .single()

    await supabase.from('notificaciones').insert({
      usuario_id: rfp.doctor_id,
      tipo: 'nueva_cotizacion',
      titulo: 'Nueva cotización recibida',
      cuerpo: `${hospital?.nombre} cotizó ${rfp.procedimiento} — ₡${form.precio.toLocaleString('es-CR')}`,
      rfp_id: rfpId,
      cotizacion_id: cotizacion.id,
    })
  }

  return cotizacion
}

export async function rechazarRFP(rfpId: string, hospitalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('cotizaciones').insert({
    rfp_id: rfpId,
    hospital_id: hospitalId,
    admisiones_id: user!.id,
    precio: 0,
    disponibilidad: '',
    status: 'rechazada',
  })
}

export async function aceptarCotizacion(cotizacionId: string, rfpId: string) {
  const supabase = await createClient()

  // Marcar esta como aceptada
  await supabase
    .from('cotizaciones')
    .update({ status: 'aceptada' })
    .eq('id', cotizacionId)

  // Marcar las demás como rechazadas
  await supabase
    .from('cotizaciones')
    .update({ status: 'rechazada' })
    .eq('rfp_id', rfpId)
    .neq('id', cotizacionId)

  // Cerrar RFP
  await supabase
    .from('rfps')
    .update({ status: 'completada' })
    .eq('id', rfpId)

  // Notificar al hospital ganador
  const { data: cot } = await supabase
    .from('cotizaciones')
    .select('hospital_id, rfp:rfps(paciente_nombre, procedimiento)')
    .eq('id', cotizacionId)
    .single()

  if (cot) {
    const { data: admisiones } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admisiones')
      .eq('hospital_id', cot.hospital_id)

    if (admisiones?.length) {
      const rfp = cot.rfp as any
      await supabase.from('notificaciones').insert(
        admisiones.map(a => ({
          usuario_id: a.id,
          tipo: 'cotizacion_aceptada',
          titulo: 'Cotización aceptada',
          cuerpo: `El paciente ${rfp?.paciente_nombre} aceptó su cotización para ${rfp?.procedimiento}`,
          rfp_id: rfpId,
          cotizacion_id: cotizacionId,
        }))
      )
    }
  }
}

// ─── Notificaciones ───────────────────────────────────────
export async function getNotificaciones() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function marcarLeida(notifId: string) {
  const supabase = await createClient()
  await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', notifId)
}
