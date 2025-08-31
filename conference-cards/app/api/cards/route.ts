import { NextResponse } from "next/server"
import { getCardsFromFirestore } from "@/lib/firestore"
import { db } from "@/lib/firebase"

// Helper function to safely access global storage
function getCardsStorage(): any[] {
  try {
    if (typeof global !== "undefined" && global.cardsStorage) {
      return global.cardsStorage
    }
    return []
  } catch (error) {
    console.warn("Cannot access global storage:", error)
    return []
  }
}

// Helper function to safely set global storage
function setCardsStorage(cards: any[]): boolean {
  try {
    if (typeof global !== "undefined") {
      if (!global.cardsStorage) {
        global.cardsStorage = []
      }
      global.cardsStorage = cards
      return true
    }
    return false
  } catch (error) {
    console.warn("Cannot set global storage:", error)
    return false
  }
}

// Access the same storage from upload route
declare global {
  var cardsStorage: any[]
}

// Initialize global storage safely
try {
  if (typeof global !== "undefined" && !global.cardsStorage) {
    global.cardsStorage = []
  }
} catch (error) {
  console.warn("Cannot initialize global storage:", error)
}

export async function GET(request: Request) {
  try {
    console.log("=== Cards API Called (paged) ===")

    const url = new URL(request.url)
    const limitParam = url.searchParams.get("limit")
    const cursorParam = url.searchParams.get("cursor")

    const limitNum = Math.max(1, Math.min(parseInt(limitParam || "12", 10) || 12, 50))

    const { collection, query: fsQuery, orderBy, getDocs, startAfter, limit: fsLimit, Timestamp } = await import('firebase/firestore')

    let firestoreCards: any[] = []
    let nextCursor: string | null = null

    try {
      const cardsRef = collection(db, 'cards')

      try {
        // Primary: order by createdAt desc with cursor
        let q = fsQuery(cardsRef, orderBy('createdAt', 'desc'), fsLimit(limitNum))
        if (cursorParam) {
          const cursorTs = Timestamp.fromDate(new Date(cursorParam))
          q = fsQuery(cardsRef, orderBy('createdAt', 'desc'), startAfter(cursorTs), fsLimit(limitNum))
        }
        const querySnapshot = await getDocs(q)

        firestoreCards = querySnapshot.docs.map((doc: any) => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            position: data.position,
            frontImageUrl: data.frontImageUrl,
            backImageUrl: data.backImageUrl,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            source: 'firestore'
          }
        })

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        if (lastDoc) {
          const lastData = lastDoc.data()
          if (lastData?.createdAt?.toDate) {
            nextCursor = lastData.createdAt.toDate().toISOString()
          } else if (typeof lastData?.createdAt === 'string') {
            nextCursor = lastData.createdAt
          } else {
            nextCursor = null
          }
        }

        console.log(`Fetched ${firestoreCards.length} cards from Firestore (ordered, limit=${limitNum})`)
      } catch (primaryError) {
        console.warn('Primary ordered query failed, falling back to unordered limit:', primaryError)
        // Fallback: simple limit without order (no cursor support)
        const q2 = fsQuery(cardsRef, fsLimit(limitNum))
        const snapshot2 = await getDocs(q2)
        firestoreCards = snapshot2.docs.map((doc: any) => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            position: data.position,
            frontImageUrl: data.frontImageUrl,
            backImageUrl: data.backImageUrl,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            source: 'firestore-unordered'
          }
        })
        nextCursor = null
      }
    } catch (firestoreError) {
      console.warn("Firestore access failed:", firestoreError)
      firestoreCards = []
      nextCursor = null
    }

    // Fallback to in-memory uploaded cards when Firestore has no results
    let uploadedCards: any[] = []
    try {
      uploadedCards = getCardsStorage().map((card: any) => ({
        ...card,
        source: 'local'
      }))
    } catch (e) {
      uploadedCards = []
    }

    if (firestoreCards.length === 0) {
      // Local pagination by createdAt DESC
      const parseTime = (v: any): number => {
        try {
          if (!v) return 0
          if (typeof v === 'string') return new Date(v).getTime() || 0
          if (typeof v === 'number') return v
          if (typeof v?.toDate === 'function') return v.toDate().getTime()
          if (v instanceof Date) return v.getTime()
          return 0
        } catch { return 0 }
      }

      let list = uploadedCards
        .filter(c => c.id && c.name && c.position && c.frontImageUrl && c.backImageUrl)
        .sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt))

      if (cursorParam) {
        const cursorTime = parseTime(cursorParam)
        list = list.filter(item => parseTime(item.createdAt) < cursorTime)
      }

      const pageItems = list.slice(0, limitNum)
      const next = pageItems.length === limitNum ? pageItems[pageItems.length - 1]?.createdAt ?? null : null

      return NextResponse.json({
        success: true,
        cards: pageItems,
        count: pageItems.length,
        nextCursor: next,
        hasMore: pageItems.length === limitNum,
        source: 'local'
      })
    }

    const hasMore = firestoreCards.length === limitNum && !!nextCursor

    return NextResponse.json({
      success: true,
      cards: firestoreCards,
      count: firestoreCards.length,
      nextCursor,
      hasMore,
      source: 'firestore'
    })
  } catch (error) {
    console.error("=== Cards API Error ===")
    console.error("Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cards",
        cards: [],
        count: 0,
        nextCursor: null,
        hasMore: false,
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    console.log("=== Delete All Cards API Called ===")

    let localDeletedCount = 0
    let firestoreDeletedCount = 0

    // Step 1: Clear uploaded cards from local storage
    try {
      const currentCards = getCardsStorage()
      localDeletedCount = currentCards.length
      setCardsStorage([])
      console.log(`✓ Cleared ${localDeletedCount} cards from local storage`)
    } catch (storageError) {
      console.warn("✗ Local storage clear failed:", storageError)
      localDeletedCount = 0
    }

    // Step 2: Clear all cards from Firestore
    try {
      console.log("Attempting to clear all cards from Firestore...")
      const firestoreCards = await getCardsFromFirestore()
      firestoreDeletedCount = firestoreCards.length
      
      if (firestoreDeletedCount > 0) {
        // Import necessary Firestore functions
        const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore')
        
        // Get all cards from Firestore
        const cardsRef = collection(db, 'cards')
        const querySnapshot = await getDocs(cardsRef)
        
        // Delete each card
        const deletePromises = querySnapshot.docs.map(cardDoc => 
          deleteDoc(doc(db, 'cards', cardDoc.id))
        )
        
        await Promise.all(deletePromises)
        console.log(`✓ Cleared ${firestoreDeletedCount} cards from Firestore`)
      } else {
        console.log("No cards found in Firestore to delete")
      }
    } catch (firestoreError) {
      console.error("✗ Firestore clear failed:", firestoreError)
      // Don't fail the entire operation if Firestore fails
    }

    const totalDeleted = localDeletedCount + firestoreDeletedCount
    const sources = []
    if (localDeletedCount > 0) sources.push(`${localDeletedCount} from local storage`)
    if (firestoreDeletedCount > 0) sources.push(`${firestoreDeletedCount} from Firestore`)

    return NextResponse.json({
      success: true,
      message: `All cards deleted: ${sources.join(', ')}`,
      deletedCount: totalDeleted,
      breakdown: {
        localStorage: localDeletedCount,
        firestore: firestoreDeletedCount
      }
    })
  } catch (error) {
    console.error("=== Delete All Cards API Error ===")
    console.error("Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete cards",
      },
      { status: 500 },
    )
  }
}
