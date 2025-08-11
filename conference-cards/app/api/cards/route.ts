import { NextResponse } from "next/server"

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

export async function GET() {
  try {
    console.log("=== Cards API Called ===")

    let uploadedCards: any[] = []

    // Safely access global storage
    try {
      uploadedCards = getCardsStorage()
      console.log("Found uploaded cards:", uploadedCards.length)

      if (uploadedCards.length > 0) {
        // Log storage statistics
        const storageSize = JSON.stringify(uploadedCards).length
        console.log("Current storage size (characters):", storageSize)
        console.log("Estimated storage size (MB):", (storageSize / 1024 / 1024).toFixed(2))
        console.log("Storage capacity utilization:", `${uploadedCards.length}/300 cards`)
      }
    } catch (storageError) {
      console.warn("Storage access failed:", storageError)
      uploadedCards = []
    }

    // Return cards with pagination support for large datasets
    const page = 1 // Could be extracted from query params in the future
    const limit = 300 // Support up to 300 cards per page
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCards = uploadedCards.slice(startIndex, endIndex)

    console.log("Total cards to return:", paginatedCards.length)

    // Always return only real uploaded cards, never mock data
    return NextResponse.json({
      success: true,
      cards: paginatedCards, // Only real uploaded cards
      count: paginatedCards.length,
      totalCount: uploadedCards.length,
      page: page,
      totalPages: Math.ceil(uploadedCards.length / limit),
      hasMore: uploadedCards.length > endIndex,
    })
  } catch (error) {
    console.error("=== Cards API Error ===")
    console.error("Error:", error)

    // Return empty array on error, never mock data
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cards",
        cards: [], // Always empty array on error
        count: 0,
        totalCount: 0,
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    console.log("=== Delete Cards API Called ===")

    let deletedCount = 0

    // Clear uploaded cards safely
    try {
      const currentCards = getCardsStorage()
      deletedCount = currentCards.length
      setCardsStorage([])
      console.log(`Cleared ${deletedCount} uploaded cards`)
    } catch (storageError) {
      console.warn("Storage clear failed:", storageError)
      deletedCount = 0
    }

    return NextResponse.json({
      success: true,
      message: `All ${deletedCount} uploaded cards deleted`,
      deletedCount: deletedCount,
    })
  } catch (error) {
    console.error("=== Delete Cards API Error ===")
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
