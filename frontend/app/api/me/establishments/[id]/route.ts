import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

const supabase = createClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      })
    }

    const { id } = await params
    const establishmentId = parseInt(id)
    
    if (isNaN(establishmentId)) {
      return new Response(JSON.stringify({ error: 'Invalid establishment ID' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // Forward to backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/me/establishments/${establishmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
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
    console.error('Error removing establishment:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
