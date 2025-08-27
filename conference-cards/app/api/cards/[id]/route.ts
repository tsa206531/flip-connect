import { type NextRequest, NextResponse } from "next/server"
import { doc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
    let firestoreDeleted = false

    // Step 1: Try to delete from Firestore first
    try {
      console.log("Step 1: Attempting to delete from Firestore...")
      const cardRef = doc(db, 'cards', params.id)
      
      // Check if document exists in Firestore
      const cardSnap = await getDoc(cardRef)
      if (cardSnap.exists()) {
        await deleteDoc(cardRef)
        console.log("✓ Card deleted from Firestore successfully")
        firestoreDeleted = true
      } else {
        console.log("⚠ Card not found in Firestore, checking local storage...")
      }
    } catch (firestoreError) {
      console.error("✗ Firestore deletion failed:", firestoreError)
      // Continue to local storage deletion even if Firestore fails
    }

    // Step 2: Delete from local storage
    try {
      console.log("Step 2: Attempting to delete from local storage...")
      
      // Get current cards
      currentCards = getCardsStorage()
      const initialLength = currentCards.length

      // Find the card to delete
      cardToDelete = currentCards.find((card) => card.id === params.id)

      if (!cardToDelete && !firestoreDeleted) {
        return NextResponse.json(
          {
            success: false,
            error: "Card not found in either Firestore or local storage",
          },
          { status: 404 },
        )
      }

      if (cardToDelete) {
        // Remove card from storage
        const updatedCards = currentCards.filter((card) => card.id !== params.id)
        finalLength = updatedCards.length

        // Save updated cards
        setCardsStorage(updatedCards)

        console.log(`✓ Local storage: Cards before deletion: ${initialLength}`)
        console.log(`✓ Local storage: Cards after deletion: ${finalLength}`)
      } else {
        console.log("⚠ Card not found in local storage")
        finalLength = currentCards.length
      }
    } catch (storageError) {
      console.error("✗ Local storage operation failed:", storageError)
      
      // If Firestore deletion succeeded but local storage failed, still return success
      if (firestoreDeleted) {
        console.log("Firestore deletion succeeded, ignoring local storage error")
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Storage operation failed",
          },
          { status: 500 },
        )
      }
    }

    // Step 3: Return success response
    const deletionSources = []
    if (firestoreDeleted) deletionSources.push("Firestore")
    if (cardToDelete) deletionSources.push("Local Storage")

    console.log(`✓ Card deleted successfully from: ${deletionSources.join(", ")}`)

    return NextResponse.json({
      success: true,
      message: `Card deleted successfully from ${deletionSources.join(" and ")}`,
      deletedId: params.id,
      remainingCards: finalLength,
      deletedFrom: deletionSources
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
