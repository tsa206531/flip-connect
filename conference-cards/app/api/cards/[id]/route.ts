import { type NextRequest, NextResponse } from "next/server"

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== Delete Single Card API Called ===")
    console.log("Card ID to delete:", params.id)

    let currentCards: any[] = []
    let cardToDelete: any = null
    let finalLength = 0

    try {
      // Get current cards
      currentCards = getCardsStorage()
      const initialLength = currentCards.length

      // Find the card to delete
      cardToDelete = currentCards.find((card) => card.id === params.id)

      if (!cardToDelete) {
        return NextResponse.json(
          {
            success: false,
            error: "Card not found",
          },
          { status: 404 },
        )
      }

      // Remove card from storage
      const updatedCards = currentCards.filter((card) => card.id !== params.id)
      finalLength = updatedCards.length

      // Save updated cards
      setCardsStorage(updatedCards)

      console.log(`Cards before deletion: ${initialLength}`)
      console.log(`Cards after deletion: ${finalLength}`)
    } catch (storageError) {
      console.error("Storage operation failed:", storageError)
      return NextResponse.json(
        {
          success: false,
          error: "Storage operation failed",
        },
        { status: 500 },
      )
    }

    // Note: Blob cleanup is not implemented in this simplified version
    // In production, you would clean up any external storage here

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
      deletedId: params.id,
      remainingCards: finalLength,
    })
  } catch (error) {
    console.error("=== Delete Single Card API Error ===")
    console.error("Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete card",
      },
      { status: 500 },
    )
  }
}
