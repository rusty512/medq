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
      // NOTE: Supabase table is named with capital 'E' (Establishment)
      let query = supabase
        .from('Establishment')
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
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'content-type': 'application/json', 'x-data-source': 'supabase', 'x-error': 'supabase-query-failed' },
        })
      }
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
        status: 500,
        headers: { 'content-type': 'application/json', 'x-data-source': 'supabase', 'x-error': 'supabase-exception' },
      })
    }
  }

  // No Supabase config; explicitly return an error instead of localhost fallback on Vercel
  return new Response(JSON.stringify({ error: 'Supabase not configured and no backend available' }), {
    status: 500,
    headers: { 'content-type': 'application/json', 'x-data-source': 'none' },
  })
}

