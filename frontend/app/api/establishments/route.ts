import { supabase } from '@/lib/supabase-client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const offsetParam = searchParams.get('offset') || '0'
  const limitParam = searchParams.get('limit') || '100'

  const offset = Math.max(parseInt(offsetParam, 10) || 0, 0)
  const limit = Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 500)

  const hasSupabaseEnv = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Try Supabase first
  if (hasSupabaseEnv) {
    try {
      const from = offset
      const to = offset + limit - 1

      // Select shape expected by the UI
      let query = supabase
        .from('establishments')
        .select(
          'id, code, name, address, category, establishment_type, region_code, region_name, municipality, postal_code, is_active, codes'
        )
        .order('name', { ascending: true })
        .range(from, to)

      if (search) {
        // Match on common text fields. Array matching for codes may vary by schema, so keep it simple.
        query = query.or(
          `name.ilike.%${search}%,address.ilike.%${search}%,code.ilike.%${search}%,region_name.ilike.%${search}%`
        )
      }

      const { data, error } = await query
      if (!error && Array.isArray(data)) {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-data-source': 'supabase' },
        })
      }
      // If Supabase errors, fall back to backend proxy below
    } catch {
      // Fall back to backend proxy
    }
  }

  // Backend fallback (existing behavior)
  const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'
  const qs = new URLSearchParams()
  if (search) qs.set('search', search)
  qs.set('offset', String(offset))
  qs.set('limit', String(limit))
  const url = `${backend}/establishments${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  const headers: Record<string, string> = { 'x-data-source': 'backend' }
  const body = await res.text()
  return new Response(body, { status: res.status, headers })
}

