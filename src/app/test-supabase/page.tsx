'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestSupabasePage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase.from('profiles').select('*').limit(5)
      if (error) setError(error.message)
      else setProfiles(data || [])
    }
    loadProfiles()
  }, [])

  if (error) return <div className="p-6 text-red-600">Erreur : {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Test connexion Supabase</h1>
      {profiles.length === 0 ? (
        <p>Aucun profil trouvé.</p>
      ) : (
        <ul className="list-disc pl-6">
          {profiles.map((p) => (
            <li key={p.id}>{p.display_name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
