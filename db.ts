import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/db'

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')

  if (profile.role === 'doctor') redirect('/dashboard/doctor')
  if (profile.role === 'admisiones') redirect('/dashboard/admisiones')
  if (profile.role === 'paciente') redirect('/dashboard/paciente')

  redirect('/auth/login')
}
