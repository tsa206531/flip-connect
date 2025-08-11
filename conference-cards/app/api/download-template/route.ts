import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, you would serve the actual Figma file
    // For now, we'll create a simple template file or redirect to a Figma template

    // Option 1: Redirect to a Figma template URL
    // return NextResponse.redirect('https://www.figma.com/community/file/your-template-id')

    // Option 2: Serve a placeholder file
    const templateContent = `
# UX3 研討會名片設計模板

## 使用說明
1. 在 Figma 中打開此模板
2. 替換為您的個人資訊
3. 匯出為 PNG 或 JPG 格式
4. 上傳到研討會平台

## 設計規範
- 尺寸：235px × 361px (3:4 比例)
- 解析度：300 DPI
- 格式：PNG 或 JPG
- 檔案大小：不超過 1.5MB

## 設計要素
- 封面：個人照片 + 姓名 + 職位
- 封底：聯絡資訊 + 專業技能 + 社群連結

請在 Figma 中使用此模板創建您的專業名片！
    `

    return new NextResponse(templateContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="UX3研討會名片模板說明.txt"',
      },
    })
  } catch (error) {
    console.error("Download template error:", error)
    return NextResponse.json({ error: "Failed to download template" }, { status: 500 })
  }
}
