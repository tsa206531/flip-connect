import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = (body?.password || '').toString()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: '密碼不正確' }, { status: 401 })
    }

    // Set HttpOnly cookie
    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_session', adminPassword, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 })
  }
}
