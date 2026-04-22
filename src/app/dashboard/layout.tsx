import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import { getProfile, getNotificaciones } from '@/lib/db'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await getProfile()
  if (!profile) redirect('/auth/login')

  const notifs = await getNotificaciones()
  const unread = notifs.filter(n => !n.leida).length

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar profile={profile} unreadCount={unread} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}