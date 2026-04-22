'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login')
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-sm font-medium">MediQuote CR</span>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/auth/login' }} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100">
            Salir
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}