# TixGuard 專案架構說明

## 📁 專案結構概覽

```
TixGuard/
│
├── contracts/                # 智能合約核心
│   ├── ConcertTicketNFT.sol     # 主要票券 NFT 合約
│   ├── VerificationRegistry.sol  # 身份驗證註冊合約
│   └── interfaces/              # 合約介面定義
│       └── (未來擴展)
│
├── scripts/                  # 部署與管理腳本
│   ├── deploy/
│   │   ├── DeployTixGuard.s.sol    # 主要部署腳本
│   │   └── Counter.s.sol           # 舊版部署腳本（保留）
│   └── utils/
│       ├── deploy_sepolia.sh       # Sepolia 自動部署腳本
│       ├── interact_sepolia.sh     # 合約互動腳本
│       └── verify_deployment.sh    # 部署驗證腳本
│
├── test/                     # 測試案例
│   ├── ConcertTicketNFT.t.sol     # 票券合約測試
│   ├── VerificationRegistry.t.sol  # 驗證合約測試
│   └── (未來整合測試)
│
├── docs/                     # 文檔系統
│   ├── ARCHITECTURE.md             # 本檔案 - 架構說明
│   ├── TixGuard_Internal_TicketLogic.md  # 內部技術邏輯
│   ├── SEPOLIA_DEPLOYMENT_GUIDE.md # Sepolia 部署指南
│   ├── QUICK_START_SEPOLIA.md      # 快速入門指南
│   └── (未來 API 文檔)
│
├── frontend/                 # 前端 DApp（規劃中）
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── public/
│   └── package.json
│
├── backend/                  # 後端服務（規劃中）
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   └── package.json
│
├── deployments/              # 部署記錄
│   ├── sepolia_YYYYMMDD_HHMMSS.txt
│   ├── mainnet.json          # 主網部署記錄（未來）
│   └── .gitkeep
│
├── .github/                  # CI/CD 自動化
│   └── workflows/
│       └── test.yml          # 自動測試工作流
│
├── lib/                      # 外部依賴
│   └── openzeppelin-contracts/
│
├── cache/                    # Foundry 編譯快取
├── out/                      # 編譯輸出
│
├── .env                      # 環境變數（本地，勿上傳）
├── .gitignore               # Git 忽略規則
├── .gitmodules              # Git 子模組配置
├── foundry.toml             # Foundry 框架配置
├── package.json             # Node.js 依賴（未來）
├── README.md                # 專案說明
└── LICENSE                  # 授權條款
```

## 🏗️ 核心架構設計

### 1. 智能合約層 (`contracts/`)

#### 主要合約
- **`ConcertTicketNFT.sol`** - 核心票券 NFT 合約
  - 演出管理（創建、設定、狀態控制）
  - 票券購買與鑄造
  - 二手票交易系統
  - 入場驗證機制
  - 權限控制與安全機制

- **`VerificationRegistry.sol`** - 身份驗證系統
  - 用戶身份驗證（電話、郵箱、身份證）
  - 信任分數計算
  - 黑名單管理
  - 身份哈希映射

#### 合約關係
```
┌─────────────────────┐    依賴    ┌─────────────────────┐
│ ConcertTicketNFT    │◄──────────│ VerificationRegistry │
│ (主要業務邏輯)       │           │ (身份驗證)           │
└─────────────────────┘           └─────────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│ ERC721URIStorage    │           │ Ownable             │
│ (NFT 標準)          │           │ (權限控制)           │
└─────────────────────┘           └─────────────────────┘
```

### 2. 部署與腳本層 (`scripts/`)

#### 部署腳本
- **`DeployTixGuard.s.sol`** - Foundry 部署腳本
  - 自動化雙合約部署
  - 依賴關係處理
  - 部署驗證
  - 日誌記錄

#### 工具腳本
- **`deploy_sepolia.sh`** - 一鍵部署到 Sepolia
- **`interact_sepolia.sh`** - 互動式合約測試
- **`verify_deployment.sh`** - 部署後驗證

### 3. 測試層 (`test/`)

#### 測試策略
```
單元測試 (Unit Tests)
├── VerificationRegistry.t.sol (3 個測試)
│   ├── 用戶驗證功能
│   ├── 黑名單管理
│   └── 驗證等級檢查
│
└── ConcertTicketNFT.t.sol (12 個測試)
    ├── 演出管理測試
    ├── 票券購買測試
    ├── 轉售系統測試
    ├── 入場驗證測試
    └── 權限控制測試
```

### 4. 文檔層 (`docs/`)

#### 文檔分類
- **技術文檔**
  - `ARCHITECTURE.md` - 架構說明（本檔案）
  - `TixGuard_Internal_TicketLogic.md` - 內部邏輯說明
  
- **部署文檔**
  - `SEPOLIA_DEPLOYMENT_GUIDE.md` - 詳細部署指南
  - `QUICK_START_SEPOLIA.md` - 快速入門

- **未來規劃**
  - API 文檔
  - 用戶手冊
  - 開發者指南

## 🔧 技術棧

### 區塊鏈開發
- **Solidity** `^0.8.20` - 智能合約語言
- **Foundry** - 開發框架
  - **Forge** - 編譯與測試
  - **Cast** - 區塊鏈互動
  - **Anvil** - 本地測試網
- **OpenZeppelin** - 安全合約庫

### 開發工具
- **Git** - 版本控制
- **GitHub Actions** - CI/CD 自動化
- **VS Code** - 推薦 IDE

### 測試網路
- **Sepolia** - 主要測試網路
- **本地 Anvil** - 開發測試

## 📊 數據流架構

### 票券生命週期
```
1. 演出創建
   ┌─────────────┐
   │ 主辦方      │
   │ createConcert│
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │ Concert     │
   │ 結構體儲存   │
   └─────────────┘

2. 用戶驗證
   ┌─────────────┐
   │ 管理員      │
   │ verifyUser  │
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │ Verification│
   │ Registry    │
   └─────────────┘

3. 票券購買
   ┌─────────────┐
   │ 用戶        │
   │ purchaseTicket│
   └─────────────┘
          │
          ▼
   ┌─────────────┐    鑄造    ┌─────────────┐
   │ 驗證檢查    │ ────────► │ NFT Token   │
   └─────────────┘           └─────────────┘

4. 二手交易
   ┌─────────────┐
   │ 票券擁有者   │
   │ listForSale │
   └─────────────┘
          │
          ▼
   ┌─────────────┐    購買    ┌─────────────┐
   │ ResaleOrder │ ────────► │ 轉移擁有權   │
   └─────────────┘           └─────────────┘
```

## 🔒 安全機制

### 合約安全
- **ReentrancyGuard** - 防重入攻擊
- **Pausable** - 緊急暫停機制
- **Ownable** - 權限控制
- **限制檢查** - 購買限制、價格限制、轉移限制

### 身份安全
- **多層驗證** - 電話、郵箱、身份證
- **身份哈希** - 隱私保護
- **黑名單機制** - 惡意用戶管理
- **冷卻期** - 防止快速轉售

## 🚀 部署策略

### 測試網部署
1. **Sepolia 測試網**
   - 開發測試
   - 功能驗證
   - 用戶體驗測試

### 主網部署（未來）
1. **安全審計**
2. **Gas 優化**
3. **多重簽名部署**
4. **逐步上線**

## 📈 擴展規劃

### 短期目標
- [ ] 前端 DApp 開發
- [ ] 後端 API 服務
- [ ] IPFS 元數據存儲
- [ ] 更多測試網支持

### 中期目標
- [ ] 主網部署
- [ ] 移動端應用
- [ ] 支付網關整合
- [ ] 多鏈支持

### 長期目標
- [ ] DAO 治理機制
- [ ] 跨鏈橋接
- [ ] NFT 市場整合
- [ ] 企業級功能

## 🛠️ 開發指南

### 環境設置
```bash
# 1. 克隆專案
git clone <repository-url>
cd TixGuard

# 2. 安裝 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 3. 安裝依賴
forge install

# 4. 編譯合約
forge build

# 5. 運行測試
forge test
```

### 開發流程
1. **功能開發** - 在 `contracts/` 中開發新功能
2. **測試編寫** - 在 `test/` 中編寫對應測試
3. **文檔更新** - 更新 `docs/` 中的相關文檔
4. **部署測試** - 使用 `scripts/` 中的腳本部署測試

### 代碼規範
- 遵循 Solidity 最佳實踐
- 使用 `forge fmt` 格式化代碼
- 編寫完整的測試覆蓋
- 維護清晰的文檔

## 📞 聯絡資訊

- **專案維護者**: [維護者資訊]
- **技術支援**: [支援聯絡方式]
- **問題回報**: [GitHub Issues]

---

*本文檔隨專案發展持續更新，最後更新時間：2024年12月* 