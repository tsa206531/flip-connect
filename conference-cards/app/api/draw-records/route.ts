import { NextResponse } from "next/server"
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function DELETE() {
  try {
    console.log("=== Clear All Draw Records API Called ===")

    let deletedCount = 0
    let errors: string[] = []

    try {
      // 1. 清空所有用戶的抽卡記錄
      console.log("Step 1: 清空 Firestore 中所有用戶的抽卡記錄...")
      
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const drawRecordRef = doc(db, 'users', userDoc.id, 'drawRecords', 'main')
          await deleteDoc(drawRecordRef)
          deletedCount++
          console.log(`✓ 已清空用戶 ${userDoc.id} 的抽卡記錄`)
        } catch (userError) {
          console.error(`✗ 清空用戶 ${userDoc.id} 的抽卡記錄失敗:`, userError)
          errors.push(`用戶 ${userDoc.id}: ${userError}`)
        }
      }
      
      console.log(`✓ 總共清空了 ${deletedCount} 個用戶的抽卡記錄`)
      
    } catch (firestoreError) {
      console.error("✗ Firestore 清空失敗:", firestoreError)
      errors.push(`Firestore: ${firestoreError}`)
    }

    // 2. 返回結果
    const response = {
      success: true,
      message: `已清空 ${deletedCount} 個用戶的抽卡記錄`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    }

    if (errors.length > 0) {
      response.message += ` (有 ${errors.length} 個錯誤)`
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error("=== Clear All Draw Records API Error ===")
    console.error("Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "清空抽卡記錄失敗",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}