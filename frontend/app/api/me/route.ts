import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { getToken } = auth()
  const token = await getToken()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  return new Response(await res.text(), { status: res.status })
}


