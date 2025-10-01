import { headers } from 'next/headers'

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || ''
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `https://${raw}`
}

export async function GET() {
  const headersList = await headers()
  const authorization = headersList.get('authorization')
  
  if (!authorization) {
    return new Response('Unauthorized', { status: 401 })
  }

  const base = getApiBaseUrl()
  if (!base) return new Response('API base URL not configured', { status: 500 })
  const res = await fetch(`${base}/me`, {
    headers: { Authorization: authorization },
    cache: 'no-store',
  })
  return new Response(await res.text(), { status: res.status })
}

export async function PUT(request: Request) {
  const headersList = await headers()
  const headerAuth = headersList.get('authorization')
  const requestAuth = request.headers.get('authorization')
  const authorization = headerAuth || requestAuth

  if (!authorization) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()

  const base = getApiBaseUrl()
  if (!base) return new Response('API base URL not configured', { status: 500 })
  const res = await fetch(`${base}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  })

  return new Response(await res.text(), { status: res.status })
}


