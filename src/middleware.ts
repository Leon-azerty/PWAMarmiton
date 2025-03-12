import { updateSession } from '@/lib/session'
import { type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  let session = request.cookies.get(process.env.SESSION_NAME!)

  const url = new URL(request.url)
  if (!session) {
    return Response.redirect(new URL('/login', request.url))
  }

  if (url.pathname === '/login' || url.pathname === '/register') {
    return Response.redirect(new URL('/', request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/settings', '/favorite'],
}
