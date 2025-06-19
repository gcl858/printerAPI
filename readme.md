# 印字機API控制庫

一個通用的JavaScript庫，提供統一的印字機操作介面與現代化Bootstrap UI。

## 功能特色

- 🖨️ **完整的印字機控制流程** - 支援Lock、Status、Insert、Print、Eject、Unlock等API
- 🎨 **現代化UI設計** - 基於Bootstrap 5的響應式設計
- 📱 **跨平台相容** - 支援桌面與行動裝置
- 🔒 **安全驗證** - 支援API Key驗證機制
- ⚡ **即時狀態顯示** - 流程執行狀態即時更新
- 🎯 **簡單易用** - 提供簡潔的API介面

## 快速開始

### 1. 引入相關檔案

```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Font Awesome -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<!-- 印字機API庫 -->
<script src="printer-api.js"></script>
```

### 2. 基本使用方式

#### 方法1: 使用Promise (推薦)

```javascript
const success = await startPrinting({
    systemName: '庫存管理系統',
    displayMessage: '準備列印出貨單據，請確認印字機已準備就緒',
    apiKey: 'your-api-key-here',
    printContent: '要列印的內容...'
});

if (success) {
    console.log('列印成功！');
} else {
    console.log('列印失敗！');
}
```

#### 方法2: 使用類別實例

```javascript
const printer = new PrinterAPI();
printer.start({
    systemName: '庫存管理系統',
    displayMessage: '準備列印出貨單據，請確認印字機已準備就緒',
    apiKey: 'your-api-key-here',
    printContent: '要列印的內容...',
    onComplete: (success) => {
        if (success) {
            console.log('列印成功！');
        } else {
            console.log('列印失敗！');
        }
    }
});
```

## API參數說明

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `systemName` | string | ✓ | 系統名稱，會顯示在彈窗標題 |
| `displayMessage` | string | ✓ | 顯示訊息，會顯示在彈窗內容區域 |
| `apiKey` | string | ✓ | API金鑰，用於身份驗證 |
| `printContent` | string | ✓ | 要列印的內容 |
| `onComplete` | function | ✗ | 完成回調函數，接收boolean參數表示是否成功 |

## 執行流程

庫會依序執行以下步驟，每個步驟都會顯示即時狀態：

1. **Lock** - 占用印字機
2. **Status** - 檢查紙張狀態
3. **Insert** - 吸入紙張
4. **Print** - 執行列印
5. **Eject** - 排出紙張
6. **Unlock** - 解除占用

如果任何步驟失敗，流程會停止並顯示錯誤訊息，使用者可以選擇結束操作。

## API端點配置

預設API基礎URL為 `https://127.0.0.1:443`，對應的端點為：

- `POST /lock` - 占用印字機
- `POST /status` - 檢查狀態
- `POST /insert` - 吸入紙張
- `POST /print` - 列印（需要在body中傳送content參數）
- `POST /eject` - 排出紙張
- `POST /unlock` - 解除占用

### 請求格式

```json
{
  "content": "列印內容..."  // 僅Print API需要此參數
}
```

### 請求標頭

```
Content-Type: application/json
Authorization: Bearer {your-api-key}
```

## 自訂配置

如果需要修改API基礎URL或其他設定，可以在創建PrinterAPI實例後修改：

```javascript
const printer = new PrinterAPI();
printer.baseURL = 'https://your-custom-domain.com:443';
```

## 錯誤處理

庫內建完整的錯誤處理機制：

- **網路錯誤** - 自動捕獲並顯示連線失敗訊息
- **API錯誤** - 顯示具體的HTTP錯誤狀態碼與訊息
- **流程中斷** - 使用者可以隨時點擊「結束」按鈕中斷流程

## 瀏覽器支援

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 開發與測試

1. 複製專案檔案到本地
2. 開啟 `index.html` 進行測試
3. 確保印字機API服務正在運行
4. 在表單中輸入相關參數並測試

## 授權

本專案採用 MIT 授權條款。

## 技術支援

如有問題或建議，請聯繫開發團隊。
