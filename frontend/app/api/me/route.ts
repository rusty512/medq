import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()
  const authorization = headersList.get('authorization')
  
  if (!authorization) {
    return new Response('Unauthorized', { status: 401 })
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
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

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  })

  return new Response(await res.text(), { status: res.status })
}


