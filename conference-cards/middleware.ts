import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const adminPassword = process.env.ADMIN_PASSWORD

  // Helper: check session cookie
  const cookie = req.cookies.get('admin_session')?.value
  const isAuthed = !!cookie && !!adminPassword && cookie === adminPassword

  // Protect admin pages (except the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthed) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Protect destructive admin APIs
  const isDestructiveApi =
    req.method === 'DELETE' && (
      pathname === '/api/cards' ||
      pathname.startsWith('/api/cards/') ||
      pathname === '/api/draw-records'
    )

  if (isDestructiveApi && !isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/cards',
    '/api/cards/:path*',
    '/api/draw-records',
  ],
}
