import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Todos los concursos visibles (no draft), del más nuevo al más viejo.
// Puede haber varios activos a la vez: cada uno vive su propia fase.
export async function getActiveContests() {
  const { data } = await supabase
    .from('contests')
    .select('*, categories(*)')
    .neq('phase', 'draft')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getContest(id) {
  const { data } = await supabase
    .from('contests')
    .select('*, categories(*)')
    .eq('id', id)
    .single()
  return data ?? null
}

export function getName() { return localStorage.getItem('turbina_name') || '' }
export function setName(n) { localStorage.setItem('turbina_name', n.trim()) }
