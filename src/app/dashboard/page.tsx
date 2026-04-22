'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [info, setInfo] = useState<any>('cargando...')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile, error } = await supabase.from('profiles').select('*').single()
      setInfo({ url, user: user?.email, profile, error: error?.message })
    }
    load()
  }, [])

  return <pre style={{padding:'20px', fontSize:'12px'}}>{JSON.stringify(info, null, 2)}</pre>
}