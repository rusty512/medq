import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const supabase = createClient()

export async function POST(request: NextRequest) {
  try {
    // Extract the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    console.log('Frontend API - Auth header check:', {
      hasAuthHeader: !!authHeader,
      authHeaderLength: authHeader?.length
    })
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      })
    }

    const { establishmentId } = await request.json()
    
    if (!establishmentId) {
      return new Response(JSON.stringify({ error: 'Establishment ID is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    console.log('Frontend API - Forwarding to backend:', {
      establishmentId,
      backendUrl: process.env.BACKEND_URL,
      authHeaderLength: authHeader.length
    })

    // Forward to backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/me/establishments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ establishmentId }),
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.json()
      return new Response(JSON.stringify(error), {
        status: backendResponse.status,
        headers: { 'content-type': 'application/json' }
      })
    }

    const result = await backendResponse.json()
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Error adding establishment:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
