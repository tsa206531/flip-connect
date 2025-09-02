# Cloudinary 交付優化說明

本文件記錄此次在前端顯示層導入 Cloudinary 動態轉換（f_auto, q_auto 與寬度上限）以加速圖片載入與節省流量的實作細節、使用方法與後續建議。

## 為什麼要做

- 許多原始上傳圖檔偏大（例如 1.5MB），直接傳到使用者端會增加載入時間與流量。
- Cloudinary 提供「動態轉換」與 CDN，能依終端自動挑選最佳格式（WebP/AVIF…）與品質並限制寬度，顯著降低檔案大小。
- 目標：在不更動資料層（Firestore 中仍存原圖 URL）的前提下，於「顯示時」自動加上 f_auto、q_auto 與寬度上限（w），達到最佳化交付。

## 本次做了什麼

### 1) 新增 Cloudinary URL 優化工具

- 檔案：`lib/cloudinary-url.ts`
- 作用：在 client 安全地將 Cloudinary URL（`res.cloudinary.com/.../image/upload/...`）注入以下 transformation：
  - `f_auto`：自動選擇最佳格式（視瀏覽器支援）
  - `q_auto`：自動品質
  - `c_limit,w_{width}`：限制寬度於容器或指定最大值
- 合併策略：若 URL 第一段已含 transformation，會避免重複；只補上缺的 directive。

### 2) 封裝統一的圖片元件 `OptimizedImage`

- 檔案：`components/optimized-image.tsx`
- 功能：
  - 自動判斷來源是否為 Cloudinary，若是則以 `optimizeCloudinaryUrl` 注入 `f_auto,q_auto,c_limit,w`。
  - 以 `width` prop 或容器實際寬度（fallback 為 `maxWidth`, 預設 1200）推算交付寬度。
  - 保留原本的 Next Image 用法（sizes/priority/blur placeholder/onError fallback/lazy loading）。
  - 非 Cloudinary URL 不做改寫（例如第三方大頭貼仍可正常顯示）。

- 支援的額外 prop：
  - `maxWidth?: number`（預設 1200）－限制交付寬度上限。

### 3) 在主要畫面套用 `OptimizedImage`

- 已替換為 `OptimizedImage` 的位置（關乎卡片展示體驗）：
  - `components/card-modal.tsx`（封面/封底）
  - `components/draw-card.tsx`（抽卡結果、已抽卡清單）
  - `components/user-draw-management.tsx`（卡片縮圖）
  - `app/draw/page.tsx` 既已有多處使用 `OptimizedImage`，維持不變
- `components/card-image.tsx` 原本即使用 `OptimizedImage`，保持一致

### 4) Next 圖片設定確認

- `next.config.mjs` 已允許 `res.cloudinary.com` domain，並設置 `images.unoptimized: true`（利用 Cloudinary 交付，而非 Next 內建優化）。

## 使用方式

在任何需要顯示卡片圖片的地方，使用 `OptimizedImage`：

```tsx
import OptimizedImage from "@/components/optimized-image"

<OptimizedImage
  src={cloudinaryImageUrl}
  alt="名片封面"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={false}
  maxWidth={1200}
/>
```

- 若 `src` 為 Cloudinary URL 且包含 `/image/upload/`，顯示時會自動注入 `f_auto,q_auto,c_limit,w`。
- 若 `src` 非 Cloudinary（例如使用者 avatar），不會修改 URL，仍照常顯示。

## 效益

- 一般可見 30%～80% 檔案大小下降（取決於原圖類型與尺寸），行動網路下體感速度明顯提升。
- 對 LCP/INP 也有正面幫助，改善初載體驗。

## 目前尚未全面替換的地方（可選）

以下仍使用 `next/image`，但不影響卡片核心流程。若希望一致化，也可以改成 `OptimizedImage`：

- `components/user-menu.tsx`（使用者頭像）
- `components/google-login-modal.tsx`（若有圖片）
- `components/floating-draw-button.tsx`（若有圖片）
- `app/upload/page.tsx`（若有圖片預覽）
- `app/admin/page.tsx`（部分縮圖區塊結構需精準替換）

## 後續可以再改善什麼

1) 視窗/容器 resize 時動態更新 w
- 目前 `OptimizedImage` 在 mount 時以 `width` 或容器寬度決定 w。
- 若容器寬度會改變（如 responsive 佈局、側邊欄開合），可加上 resize observer，偵測變化並更新 `w`；確保永遠拿到最貼合容器的最佳檔。

2) 加入 `dpr=auto`
- 視網膜螢幕下（device pixel ratio > 1），可讓 Cloudinary 自動挑選適當 DPR，清晰度更好且仍節流。

3) 命名轉換（Named Transformations）
- 將 `f_auto,q_auto,c_limit,w_{x}` 抽成 Named Transformation（例如 `t:card_delivery`），統一在 Cloudinary 後台管理，前端只套用名稱，方便集中調整策略。

4) 更進階的 placeholder / LQIP
- 目前使用簡單的 client 端 blur 佔位（canvas/svg）。
- 可改成由 Cloudinary 產生 LQIP（例如 `e_blur` 或更進階的類似 pHash/AI 生成的預覽），畫面更穩定。

5) 錯誤處理與回退策略
- 已有 `fallbackSrc` 機制；可加入錯誤統計（Sentry）與預設 placeholder 規範，以利排查。

6) Cache 與 CDN 規則
- Cloudinary 本身具備 CDN；可檢視 Cache-Control header 與 TTL，針對不常變動的卡片圖提高快取時效。

7) 建議統一上傳/儲存策略
- 保持 Firestore 只存「基準 URL」（不含轉換），顯示時統一由前端決定轉換。必要時也可在後端提供 helper，避免客端誤用。

## 風險與注意事項

- 僅當 URL 指向 `res.cloudinary.com/.../image/upload/...` 時才會注入轉換；若日後改變上傳管線或網域，需同步調整偵測規則。
- 若原始 URL 已有 transformation，工具會合併；仍建議盡量避免在資料層寫死轉換，避免與前端策略衝突。
- `images.unoptimized: true` 代表不使用 Next 內建優化，交付由 Cloudinary/瀏覽器主導；此策略對目前需求較合理。

## 變更紀錄（實作痕跡）

- 新增：`lib/cloudinary-url.ts`
- 新增/重構：`components/optimized-image.tsx`
- 套用：
  - `components/card-modal.tsx`
  - `components/draw-card.tsx`
  - `components/user-draw-management.tsx`
  - `app/draw/page.tsx`（原本已多處使用）
- 設定：`next.config.mjs` 允許 `res.cloudinary.com`

## 驗收與測試建議

- 使用瀏覽器 DevTools → Network → Img，觀察請求 URL 是否含 `f_auto,q_auto,c_limit,w=`。
- 比較同一張圖最佳化前後的傳輸大小（Content Downloaded / Transferred）。
- 在行動裝置與桌面端分別測試，確認畫質與載入速度。
- 使用 Lighthouse 觀察 LCP 與總體效能是否改善。
