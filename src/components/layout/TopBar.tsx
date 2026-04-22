'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

const roleLabel: Record<string, string> = {
  doctor: 'Médico',
  admisiones: 'Admisiones',
  paciente: 'Paciente',
}

const roleColor: Record<string, string> = {
  doctor: 'bg-teal-100 text-teal-800',
  admisiones: 'bg-blue-100 text-blue-800',
  paciente: 'bg-purple-100 text-purple-800',
}

export default function TopBar({ profile, unreadCount }: { profile: Profile; unreadCount: number }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = profile.nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-sm font-medium text-gray-900">MediQuote CR</span>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <a href="/dashboard/notificaciones" className="relative">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </a>
          )}

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${roleColor[profile.role]}`}>
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-gray-900 leading-tight">{profile.nombre}</div>
              <div className="text-[11px] text-gray-400">{roleLabel[profile.role]}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
