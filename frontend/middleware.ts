import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/health']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Check for auth token in localStorage (client-side) or Authorization header
  const authToken = request.headers.get('authorization')
  
  // If accessing a protected route without auth token, redirect to login
  if (!isPublicRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}


