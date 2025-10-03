// Supabase JWT verification middleware
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

console.log('Backend Auth - Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseServiceKey: !!supabaseServiceKey,
  supabaseUrl: supabaseUrl,
  serviceKeyLength: supabaseServiceKey?.length
})

if (!supabaseUrl || !supabaseServiceKey) {
  // eslint-disable-next-line no-console
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_KEY is not set. Auth middleware will fail.')
}

// Service role client for server-side verification
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    persistSession: false
  }
})

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    console.log('Backend Auth - Headers:', {
      hasAuthHeader: !!authHeader,
      authHeaderLength: authHeader.length,
      hasToken: !!token,
      tokenLength: token?.length,
      path: req.path
    })

    if (!token) {
      console.log('Backend Auth - Missing token')
      return res.status(401).json({ error: 'Missing Authorization header' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    console.log('Backend Auth - Token verification:', {
      hasUser: !!user,
      hasError: !!error,
      errorMessage: error?.message,
      userId: user?.id
    })

    if (error || !user) {
      console.log('Backend Auth - Invalid token:', error?.message)
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Attach user to request for downstream handlers
    req.supabaseUser = user
    return next()
  } catch (err) {
    console.log('Backend Auth - Exception:', err.message)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}


