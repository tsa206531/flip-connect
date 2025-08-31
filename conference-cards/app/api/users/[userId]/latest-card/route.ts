import { NextRequest, NextResponse } from "next/server"
import { getUserLatestCardFromFirestore } from "@/lib/firestore"

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "缺少 userId" },
        { status: 400 }
      )
    }

    const latest = await getUserLatestCardFromFirestore(userId)
    return NextResponse.json({
      success: true,
      hasCard: !!latest,
      card: latest ? {
        id: latest.id,
        userId: latest.userId,
        name: latest.name,
        position: latest.position,
        createdAt: (latest as any).createdAt?.toDate ? (latest as any).createdAt.toDate().toISOString() : latest.createdAt,
      } : null
    })
  } catch (error) {
    console.error("/api/users/[userId]/latest-card error", error)
    return NextResponse.json({ success: false, error: "查詢失敗" }, { status: 500 })
  }
}
