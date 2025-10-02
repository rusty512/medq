import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Always allow API routes and Next.js internals to pass through
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/health', '/onboarding', '/signup']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // For client-side auth, we'll handle protection in the components
  // Middleware can't access localStorage, so we'll be permissive here
  // and let the client-side components handle auth checks
  
  return NextResponse.next()
}

export const config = {
  // Match all routes except static files; API is handled early-return above
  matcher: ['/((?!.+\.[\\w]+$|_next).*)', '/'],
}


