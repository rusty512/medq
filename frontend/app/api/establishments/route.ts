export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const offsetParam = searchParams.get('offset') || '0'
  const limitParam = searchParams.get('limit') || '100'

  const offset = Math.max(parseInt(offsetParam, 10) || 0, 0)
  const limit = Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 500)

  try {
    // Forward request to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
    const queryParams = new URLSearchParams({
      search,
      offset: offset.toString(),
      limit: limit.toString()
    })

    const response = await fetch(`${backendUrl}/establishments?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'content-type': 'application/json', 
        'cache-control': 'no-store',
        'x-data-source': 'backend'
      },
    })
  } catch (error) {
    console.error('Failed to fetch establishments from backend:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to fetch establishments' 
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', 'x-data-source': 'backend-error' },
    })
  }
}

