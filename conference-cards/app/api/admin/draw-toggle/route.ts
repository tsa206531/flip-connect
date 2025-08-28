import { NextResponse } from 'next/server'
import { getDrawToggle, setDrawToggle } from '@/lib/appConfig'

export async function GET() {
  try {
    const enabled = await getDrawToggle()
    return NextResponse.json({ success: true, enabled })
  } catch (e) {
    return NextResponse.json({ success: false, enabled: true }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    const cookie = (request.headers.get('cookie') || '').split(';').map(v=>v.trim()).find(v=>v.startsWith('admin_session='))?.split('=')[1]
    const isAuthed = !!cookie && !!adminPassword && cookie === adminPassword
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const enabled = Boolean(body?.enabled)
    await setDrawToggle(enabled, 'admin')
    return NextResponse.json({ success: true, enabled })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 })
  }
}
