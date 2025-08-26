# Firebase 設定指南

## 📋 完成清單

### ✅ 已完成
- [x] 安裝 Firebase SDK
- [x] 創建 Firebase 配置檔案
- [x] 建立 AuthContext
- [x] 創建 Google 登入組件
- [x] 整合到主應用程式

### 🔧 需要完成的步驟

#### 1. 安裝 Firebase 套件
```bash
npm install firebase
# 或
pnpm add firebase
```

#### 2. 設定 Firebase 專案
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Authentication > Google 登入
4. 建立 Web 應用程式
5. 複製 Firebase 配置

#### 3. 更新 Firebase 配置
編輯 `lib/firebase.ts` 檔案，將以下配置替換為你的 Firebase 專案配置：

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

#### 4. 測試登入功能
1. 啟動開發伺服器：`npm run dev`
2. 訪問首頁
3. 點擊左上角的「登入」按鈕
4. 測試 Google 登入流程

## 🎯 功能說明

### 新增的組件
- **AuthContext**: 管理用戶認證狀態
- **GoogleLoginModal**: Google 登入彈窗
- **UserMenu**: 用戶選單（顯示頭像、登出等）

### 功能特色
- ✨ 一鍵 Google 登入
- 👤 用戶頭像顯示
- 🔒 自動狀態管理
- 📱 響應式設計
- 🎨 與現有設計風格一致

### 登入流程
1. 用戶點擊「登入」按鈕
2. 彈出 Google 登入彈窗
3. 用戶選擇 Google 帳戶
4. 登入成功後顯示用戶選單
5. 可以訪問「上傳名片」功能

## 🚀 下一步
完成 Firebase 設定後，我們可以繼續：
1. 設定 Cloud Firestore 資料庫
2. 修改上傳功能整合用戶認證
3. 實作用戶專屬的卡片管理