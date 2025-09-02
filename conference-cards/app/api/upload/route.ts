import { type NextRequest, NextResponse } from "next/server"
import { randomUUID, createHash } from "crypto"
import { uploadCardToFirestore, userHasCardInFirestore } from "@/lib/firestore"

// Use global storage to persist across requests
declare global {
  var cardsStorage: any[]
}

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

// Initialize global storage safely
try {
  if (typeof global !== "undefined" && !global.cardsStorage) {
    global.cardsStorage = []
  }
} catch (error) {
  console.warn("Cannot initialize global storage:", error)
}

export const runtime = 'nodejs'

// HTTP-based Cloudinary upload (no SDK required)
function cloudinarySignature(paramsToSign: Record<string, string>, apiSecret: string) {
  // Sort params alphabetically and build the string to sign: key=value&key2=value2... + api_secret
  const sorted = Object.keys(paramsToSign).sort().map(k => `${k}=${paramsToSign[k]}`).join('&')
  const toSign = `${sorted}${apiSecret}`
  return createHash('sha1').update(toSign).digest('hex')
}

async function uploadFileToCloudinary(file: File, publicId: string) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const folder = process.env.CLOUDINARY_FOLDER || 'cards'
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string
  const apiKey = process.env.CLOUDINARY_API_KEY as string
  const apiSecret = process.env.CLOUDINARY_API_SECRET as string

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary env vars missing')
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const timestamp = Math.floor(Date.now() / 1000)
  const eager = '' // you can set eager transformations if needed

  const params: Record<string, string> = {
    public_id: publicId,
    folder,
    overwrite: 'true',
    timestamp: String(timestamp),
    // if you set 'eager', include here
    ...(eager ? { eager } : {}),
  }

  const signature = cloudinarySignature(params, apiSecret)

  const body = new FormData()
  body.append('file', new Blob([buffer]))
  body.append('public_id', publicId)
  body.append('folder', folder)
  body.append('overwrite', 'true')
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  if (eager) body.append('eager', eager)
  body.append('signature', signature)

  const resp = await fetch(url, { method: 'POST', body })
  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error(`Cloudinary HTTP upload failed: ${resp.status} ${txt}`)
  }
  const json = await resp.json()
  return { url: json.secure_url || json.url, public_id: json.public_id }
}

export async function POST(request: NextRequest) {
  console.log("=== Upload API Called ===")

  try {
    // Step 1: Parse form data
    console.log("Step 1: Parsing form data...")
    let formData: FormData
    try {
      formData = await request.formData()
      console.log("✓ FormData parsed successfully")
    } catch (formError) {
      console.error("✗ FormData parsing failed:", formError)
      return NextResponse.json(
        {
          success: false,
          error: "無法解析表單資料",
          step: "formData",
        },
        { status: 400 },
      )
    }

    // Step 2: Extract form fields
    console.log("Step 2: Extracting form fields...")
    let name: string, position: string, frontImage: File, backImage: File, userId: string, userEmail: string
    try {
      name = formData.get("name") as string
      position = formData.get("position") as string
      frontImage = formData.get("frontImage") as File
      backImage = formData.get("backImage") as File
      userId = formData.get("userId") as string
      userEmail = (formData.get("userEmail") as string) || ""

      console.log("✓ Form fields extracted:", {
        name: name || "missing",
        position: position || "missing",
        userId: userId || "missing",
        userEmail: userEmail || "missing",
        frontImageName: frontImage?.name || "missing",
        frontImageSize: frontImage?.size || "missing",
        backImageName: backImage?.name || "missing",
        backImageSize: backImage?.size || "missing",
      })
    } catch (extractError) {
      console.error("✗ Field extraction failed:", extractError)
      return NextResponse.json(
        {
          success: false,
          error: "無法提取表單欄位",
          step: "extraction",
        },
        { status: 400 },
      )
    }

    // Step 3: Validate required fields
    console.log("Step 3: Validating required fields...")
    if (!name || !position || !userId) {
      console.log("✗ Missing required fields")
      return NextResponse.json(
        {
          success: false,
          error: "姓名、職位和用戶ID為必填欄位",
          step: "validation",
        },
        { status: 400 },
      )
    }

    if (!frontImage || !backImage) {
      console.log("✗ Missing images")
      return NextResponse.json(
        {
          success: false,
          error: "請上傳封面和封底圖片",
          step: "validation",
        },
        { status: 400 },
      )
    }

    // Step 4: Validate file types and sizes
    console.log("Step 4: Validating file types and sizes...")
    try {
      if (!frontImage.type.startsWith("image/") || !backImage.type.startsWith("image/")) {
        console.log("✗ Invalid file types")
        return NextResponse.json(
          {
            success: false,
            error: "請上傳有效的圖片文件",
            step: "validation",
          },
          { status: 400 },
        )
      }

      const maxFileSize = 1.5 * 1024 * 1024
      const isBypass = (userEmail && userEmail.toLowerCase() === 'tsa206531@gmail.com')
      if (!isBypass && (frontImage.size > maxFileSize || backImage.size > maxFileSize)) {
        console.log("✗ File size too large")
        return NextResponse.json(
          {
            success: false,
            error: "圖片大小不能超過 1.5MB",
            step: "validation",
          },
          { status: 400 },
        )
      }

      console.log("✓ File validation passed")
    } catch (validationError) {
      console.error("✗ File validation failed:", validationError)
      return NextResponse.json(
        {
          success: false,
          error: "文件驗證失敗",
          step: "validation",
        },
        { status: 400 },
      )
    }

    // Step 5: Generate card ID
    console.log("Step 5: Generating card ID...")
    let cardId: string
    try {
      cardId = randomUUID()
      console.log("✓ Card ID generated:", cardId)
    } catch (idError) {
      console.error("✗ ID generation failed:", idError)
      return NextResponse.json(
        {
          success: false,
          error: "無法生成卡片ID",
          step: "idGeneration",
        },
        { status: 500 },
      )
    }

    // Step 6: Upload images to Cloudinary
    console.log("Step 6: Uploading images to Cloudinary...")

    let frontUpload, backUpload
    try {
      const publicBase = `card_${cardId}`
      ;[frontUpload, backUpload] = await Promise.all([
        uploadFileToCloudinary(frontImage, `${publicBase}_front`),
        uploadFileToCloudinary(backImage, `${publicBase}_back`),
      ])
      console.log("✓ Cloudinary uploads success:", { front: frontUpload.public_id, back: backUpload.public_id })
    } catch (cloudErr) {
      console.error("✗ Cloudinary upload failed:", cloudErr)
      return NextResponse.json(
        {
          success: false,
          error: "圖片上傳雲端失敗",
          step: "cloudinary",
        },
        { status: 500 },
      )
    }

    const frontImageUrl = frontUpload.url
    const backImageUrl = backUpload.url

    // Step 8: Create card data
    console.log("Step 8: Creating card data...")
    let cardData: any
    try {
      cardData = {
        id: cardId,
        userId: userId, // 保存 userId 到本地備援資料
        name: name.trim(),
        position: position.trim(),
        frontImageUrl,
        backImageUrl,
        createdAt: new Date().toISOString(),
        storageType: "cloudinary",
      }
      console.log("✓ Card data created")
    } catch (dataError) {
      console.error("✗ Card data creation failed:", dataError)
      return NextResponse.json(
        {
          success: false,
          error: "卡片資料創建失敗",
          step: "dataCreation",
        },
        { status: 500 },
      )
    }

    // Step 9: Enforce one-card-per-user and upload to Firestore
    console.log("Step 9: Enforcing one-card-per-user and uploading to Firestore...")
    let firestoreCard = null
    try {
      const alreadyHas = await userHasCardInFirestore(userId)
      const isBypass = (userEmail && userEmail.toLowerCase() === 'tsa206531@gmail.com') || (userId && typeof userId === 'string' && userId.toLowerCase() === 'tsa206531@gmail.com')
      if (alreadyHas && !isBypass) {
        console.warn("User already has a card, rejecting upload", { userId })
        return NextResponse.json(
          {
            success: false,
            error: "您已上傳過名片，每個帳號僅能上傳一張。如需更新，請聯繫工作人員或等待更新功能。",
            step: "duplicate-check",
          },
          { status: 409 },
        )
      }

      firestoreCard = await uploadCardToFirestore({
        userId: userId,
        name: cardData.name,
        position: cardData.position,
        frontImageUrl: cardData.frontImageUrl,
        backImageUrl: cardData.backImageUrl
      })
      console.log("✓ Card uploaded to Firestore successfully")
    } catch (firestoreError) {
      console.error("✗ Firestore check/upload failed:", firestoreError)
      // 強制策略：無法驗證或寫入時，拒絕請求，避免繞過一人一張限制
      return NextResponse.json(
        {
          success: false,
          error: "目前無法驗證上傳狀態，請稍後再試",
          step: "firestore-unavailable",
        },
        { status: 503 },
      )
    }

    // Step 10: Store in global storage (as backup)
    console.log("Step 10: Storing in global storage...")
    let currentCards: any[] = []
    let totalCardsCount = 0
    try {
      // Get current cards
      currentCards = getCardsStorage()
      console.log("✓ Current cards retrieved:", currentCards.length)

      // Add new card
      currentCards.push(cardData)
      totalCardsCount = currentCards.length

      // Save back to storage
      const storageSuccess = setCardsStorage(currentCards)
      if (storageSuccess) {
        console.log("✓ Card stored successfully. Total cards:", totalCardsCount)
      } else {
        console.warn("⚠ Storage not available, card saved temporarily")
      }
    } catch (storageError) {
      console.error("✗ Storage failed:", storageError)
      // Don't fail the request, just warn
      console.warn("⚠ Continuing without persistent storage")
      totalCardsCount = 1 // At least we have this card
    }

    // Step 11: Create response
    console.log("Step 11: Creating response...")
    try {
      const response = {
        success: true,
        card: {
          id: cardData.id,
          userId: cardData.userId,
          name: cardData.name,
          position: cardData.position,
          createdAt: cardData.createdAt,
          storageType: cardData.storageType,
        },
        message: `${cardData.name} 的名片已成功上傳`,
        totalCards: totalCardsCount,
      }

      console.log("✓ Upload completed successfully")
      return NextResponse.json(response)
    } catch (responseError) {
      console.error("✗ Response creation failed:", responseError)
      return NextResponse.json(
        {
          success: false,
          error: "回應創建失敗",
          step: "response",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("=== Upload API Error ===")
    console.error("Error type:", typeof error)
    console.error("Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack available")

    return NextResponse.json(
      {
        success: false,
        error: "系統錯誤，請重試",
        details: error instanceof Error ? error.message : String(error),
        step: "unknown",
      },
      { status: 500 },
    )
  }
}
