export type UserRole = 'doctor' | 'admisiones' | 'paciente'
export type UrgenciaType = 'electiva' | 'semi_urgente' | 'urgente'
export type RfpStatus = 'borrador' | 'enviada' | 'con_cotizaciones' | 'completada' | 'cancelada'
export type QuoteStatus = 'pendiente' | 'enviada' | 'aceptada' | 'rechazada'

export interface Profile {
  id: string
  role: UserRole
  nombre: string
  email: string
  telefono?: string
  especialidad?: string
  cedula_medica?: string
  hospital_id?: string
  cedula?: string
  created_at: string
}

export interface Hospital {
  id: string
  nombre: string
  zona?: string
  provincia?: string
  telefono?: string
  email_admisiones?: string
  whatsapp?: string
  activo: boolean
}

export interface RFP {
  id: string
  doctor_id: string
  paciente_id?: string
  procedimiento: string
  especialidad: string
  urgencia: UrgenciaType
  fecha_deseada?: string
  notas_clinicas?: string
  tags?: string[]
  paciente_nombre: string
  paciente_cedula?: string
  status: RfpStatus
  created_at: string
  updated_at: string
  // joins
  doctor?: Profile
  cotizaciones?: Cotizacion[]
  hospitales?: Hospital[]
}

export interface RfpHospital {
  id: string
  rfp_id: string
  hospital_id: string
  notificado_at?: string
  hospital?: Hospital
}

export interface Cotizacion {
  id: string
  rfp_id: string
  hospital_id: string
  admisiones_id?: string
  precio: number
  disponibilidad: string
  tiempo_estimado?: string
  incluye?: string[]
  observaciones?: string
  status: QuoteStatus
  enviada_at: string
  updated_at: string
  // joins
  hospital?: Hospital
  rfp?: RFP
}

export interface Notificacion {
  id: string
  usuario_id: string
  tipo: string
  titulo: string
  cuerpo?: string
  leida: boolean
  rfp_id?: string
  cotizacion_id?: string
  created_at: string
}

// Forms
export interface NuevaRFPForm {
  procedimiento: string
  especialidad: string
  urgencia: UrgenciaType
  fecha_deseada: string
  notas_clinicas: string
  paciente_nombre: string
  paciente_cedula: string
  hospital_ids: string[]
}

export interface NuevaCotizacionForm {
  precio: number
  disponibilidad: string
  tiempo_estimado: string
  incluye: string[]
  observaciones: string
}
