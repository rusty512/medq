import { headers } from 'next/headers'

export async function GET() {
  const headersList = headers()
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


