# TixGuard - 演唱會票券 NFT 平台

TixGuard 是一個基於區塊鏈的演唱會票券 NFT 平台，旨在解決傳統票務系統中的黃牛票、假票和高價轉售等問題。

## 🎯 核心功能

### 身份驗證系統 (VerificationRegistry)
- **多層級驗證**：支援手機、電子郵件、身份證件三層驗證
- **防身份盜用**：每個身份哈希只能綁定一個錢包地址
- **黑名單管理**：可將惡意用戶加入黑名單
- **信任分數**：根據驗證程度計算用戶信任分數

### 票券系統 (ConcertTicketNFT)
- **NFT 票券**：每張票券都是唯一的 NFT，包含完整的座位和購買資訊
- **防重複購買**：限制每個錢包和身份的購票數量
- **購買間隔限制**：防止機器人大量搶票
- **轉移限制**：限制票券轉移次數，防止過度炒作

### 二手票交易系統
- **安全轉售**：內建的二手票交易市場
- **價格限制**：防止惡意高價轉售
- **冷卻期**：購買後需等待一定時間才能轉售
- **平台手續費**：自動分配收益給賣家和平台

### 入場驗證系統
- **數位簽名驗證**：確保票券持有者身份
- **防重複使用**：票券使用後自動標記為已使用
- **時間窗口驗證**：限制簽名有效時間

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                     TixGuard 系統架構                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Web3 DApp)                                      │
│  ├─ 用戶註冊/驗證界面                                          │
│  ├─ 演唱會瀏覽/購票界面                                        │
│  ├─ 票券管理/轉售界面                                          │
│  └─ 入場驗證界面                                              │
├─────────────────────────────────────────────────────────────┤
│  Smart Contracts (Ethereum/Polygon)                        │
│  ├─ VerificationRegistry.sol (身份驗證)                      │
│  └─ ConcertTicketNFT.sol (票券管理)                          │
├─────────────────────────────────────────────────────────────┤
│  Backend Services                                          │
│  ├─ 身份驗證服務 (KYC/AML)                                   │
│  ├─ IPFS 元數據存儲                                          │
│  ├─ 事件監聽服務                                             │
│  └─ 通知服務                                                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 快速開始

### 環境要求
- Node.js >= 16
- Foundry
- Git

### 安裝依賴
```bash
git clone <repository-url>
cd TixGuard
forge install
```

### 編譯合約
```bash
forge build
```

### 運行測試
```bash
forge test
```

### 部署合約
```bash
# 本地測試網路
anvil

# 部署到本地網路
forge script script/Counter.s.sol --fork-url http://localhost:8545 --private-key <PRIVATE_KEY> --broadcast

# 部署到測試網 (以 Sepolia 為例)
forge script script/Counter.s.sol --rpc-url https://sepolia.infura.io/v3/<PROJECT_ID> --private-key <PRIVATE_KEY> --broadcast --verify --etherscan-api-key <ETHERSCAN_API_KEY>
```

## 📝 合約說明

### VerificationRegistry.sol
負責管理用戶身份驗證的合約。

**主要功能：**
- `verifyUser()`: 驗證用戶身份（僅限 owner）
- `isUserVerified()`: 檢查用戶驗證狀態
- `addToBlacklist()`: 加入黑名單
- `getUserVerification()`: 查詢用戶驗證資訊

### ConcertTicketNFT.sol
主要的票券管理合約，繼承自 ERC721。

**主要功能：**
- `createConcert()`: 創建演唱會
- `purchaseTicket()`: 購買票券
- `listTicketForSale()`: 列出轉售票券
- `buyResaleTicket()`: 購買二手票券
- `verifyTicketForEntry()`: 驗證入場票券
- `useTicket()`: 標記票券為已使用

## 🛡️ 安全特性

### 防攻擊機制
- **重入攻擊防護**：使用 OpenZeppelin 的 ReentrancyGuard
- **暫停機制**：緊急情況下可暫停合約功能
- **權限控制**：嚴格的角色權限管理
- **輸入驗證**：所有用戶輸入都經過嚴格驗證

### 防黃牛機制
- **身份綁定**：每個身份只能購買限定數量票券
- **購買間隔**：防止機器人快速購票
- **轉移限制**：限制票券轉移次數
- **價格上限**：限制轉售價格上限

## 🧪 測試案例

項目包含完整的測試套件，涵蓋：

- ✅ 身份驗證系統測試
- ✅ 演唱會創建和管理測試
- ✅ 票券購買流程測試
- ✅ 二手票交易測試
- ✅ 入場驗證測試
- ✅ 權限控制測試
- ✅ 錯誤情況處理測試

## 📊 Gas 優化

- 使用 `via-IR` 編譯選項
- 優化數據結構和儲存布局
- 批量操作減少交易次數
- 事件日誌替代鏈上儲存

## 🔮 未來計劃

### v2.0 功能規劃
- [ ] 支援多種支付代幣
- [ ] 實現票券保險機制
- [ ] 添加票券交換功能
- [ ] 整合 Layer 2 解決方案

### v3.0 功能規劃
- [ ] DAO 治理機制
- [ ] 跨鏈票券轉移
- [ ] AI 防欺詐檢測
- [ ] VR/AR 票券體驗

## 📞 聯絡方式

- **GitHub**: [項目倉庫連結]
- **Discord**: [社群連結]
- **Email**: [聯絡信箱]

## 📄 許可證

MIT License - 查看 [LICENSE](LICENSE) 文件了解詳情。

---

## 🎉 重構完成總結

✅ **成功將原有的 Counter 範例專案重構為完整的演唱會票券 NFT 系統**

### 重構內容：
1. **合約重構**：將 `Counter.sol` 替換為 `VerificationRegistry` 和 `ConcertTicketNFT` 合約
2. **部署腳本重構**：更新 `Counter.s.sol` 以部署新的合約系統
3. **測試套件重構**：全面的測試覆蓋，包含 15 個測試案例
4. **配置優化**：更新 Foundry 配置以支援 OpenZeppelin v5 和優化編譯

### 技術特點：
- 🔗 基於 **OpenZeppelin v5** 的安全合約框架
- 🛡️ 完整的 **身份驗證和防黃牛機制**
- 💎 **ERC721 NFT** 票券標準
- 🔄 **內建二手票交易市場**
- ✅ **100% 測試通過率** (15/15 測試案例)
- ⛽ **Gas 優化**和**防重入攻擊**保護

系統現在已準備好進行部署和進一步開發！
