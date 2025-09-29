import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: ['/', '/login', '/register', '/health'],
})

export const config = {
  matcher: ['/((?!.+\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}


