# TixGuard Sepolia 測試網部署完整指南

## 📋 目錄
1. [前置作業](#前置作業)
2. [環境設定](#環境設定)
3. [部署流程](#部署流程)
4. [合約互動](#合約互動)
5. [驗證部署](#驗證部署)
6. [故障排除](#故障排除)

## 🚀 前置作業

### 1. MetaMask 錢包設定

#### 安裝 MetaMask
```bash
# 前往 https://metamask.io 下載並安裝 MetaMask 瀏覽器擴充功能
```

#### 創建新帳戶 (重要！)
⚠️ **安全提醒**: 使用全新帳戶進行測試，切勿使用含有真實資產的錢包

1. 開啟 MetaMask
2. 點擊右上角頭像 → "創建帳戶"
3. 輸入帳戶名稱 → "創建"
4. **備份私鑰**: 帳戶詳情 → 匯出私鑰

#### 添加 Sepolia 網路
1. 網路選擇器 → "添加網路"
2. 選擇 "Sepolia 測試網路"
3. 或手動添加：
   - 網路名稱: `Sepolia`
   - RPC URL: `https://ethereum-sepolia-rpc.publicnode.com`
   - 鏈 ID: `11155111`
   - 符號: `ETH`
   - 區塊瀏覽器: `https://sepolia.etherscan.io`

### 2. 獲取測試 ETH

#### 官方水龍頭
```bash
# 訪問以下任一水龍頭服務：
# 1. https://cloud.google.com/application/web3/faucet/ethereum/sepolia
# 2. https://www.alchemy.com/faucets/ethereum-sepolia
# 3. https://sepoliafaucet.com

# ⚠️ 注意事項：
# - 每日限制: 0.05 ETH
# - 需要 Google 帳戶驗證
# - 如遇問題請更換 Google 帳戶
```

#### 驗證餘額
```bash
# 在 MetaMask 中檢查 Sepolia 網路餘額
# 確保至少有 0.01 ETH 用於部署
```

## ⚙️ 環境設定

### 1. 環境變數設定

#### 設定私鑰 (必須)
```bash
# ⚠️ 安全提醒: 絕對不要在命令行直接輸入私鑰！

# 方法 1: 終端設定 (推薦)
export PRIVATE_KEY=your_private_key_here

# 方法 2: .env 文件 (更安全)
echo "PRIVATE_KEY=your_private_key_here" > .env

# 驗證設定
echo $PRIVATE_KEY
```

#### 設定 RPC URL
```bash
export SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# 替代 RPC (如果官方服務不穩定)
# export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# export SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### 2. 專案準備

#### 編譯合約
```bash
# 清理之前的編譯結果
forge clean

# 編譯所有合約
forge build

# 確保編譯成功，無錯誤或警告
```

#### 運行測試
```bash
# 執行所有測試確保合約正常
forge test -vv

# 確保所有測試通過
```

## 🚀 部署流程

### 第一步：預檢查

```bash
# 檢查網路連接
cast chain-id --rpc-url $SEPOLIA_RPC_URL

# 檢查帳戶餘額
cast balance $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $SEPOLIA_RPC_URL

# 估算部署 gas 費用
forge script scripts/deploy/DeployTixGuard.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### 第二步：執行部署

```bash
# 部署 TixGuard 系統到 Sepolia
forge script scripts/deploy/DeployTixGuard.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# 解釋參數：
# --rpc-url: Sepolia RPC 端點
# --private-key: 部署者私鑰
# --broadcast: 實際發送交易到區塊鏈
# --verify: 在 Etherscan 上驗證合約原始碼
# --etherscan-api-key: Etherscan API 金鑰 (可選)
```

### 第三步：記錄部署地址

```bash
# 部署成功後，從輸出中複製合約地址：
export VERIFICATION_REGISTRY=0x... # VerificationRegistry 地址
export CONCERT_TICKET_NFT=0x...    # ConcertTicketNFT 地址

# 保存到配置文件
echo "VERIFICATION_REGISTRY=$VERIFICATION_REGISTRY" >> .env
echo "CONCERT_TICKET_NFT=$CONCERT_TICKET_NFT" >> .env
```

## 🔍 合約互動

### 1. 基本查詢操作

#### 檢查 NFT 基本信息
```bash
# 查詢 NFT 合約名稱
cast call $CONCERT_TICKET_NFT "name()(string)" --rpc-url $SEPOLIA_RPC_URL

# 查詢 NFT 合約符號
cast call $CONCERT_TICKET_NFT "symbol()(string)" --rpc-url $SEPOLIA_RPC_URL

# 查詢合約擁有者
cast call $CONCERT_TICKET_NFT "owner()(address)" --rpc-url $SEPOLIA_RPC_URL

# 查詢驗證註冊合約地址
cast call $CONCERT_TICKET_NFT "verificationRegistry()(address)" --rpc-url $SEPOLIA_RPC_URL
```

#### 檢查系統狀態
```bash
# 檢查合約是否暫停
cast call $CONCERT_TICKET_NFT "paused()(bool)" --rpc-url $SEPOLIA_RPC_URL

# 查詢當前演出 ID 計數器
cast call $CONCERT_TICKET_NFT "_concertIdCounter()(uint256)" --rpc-url $SEPOLIA_RPC_URL

# 查詢票券 ID 計數器
cast call $CONCERT_TICKET_NFT "_tokenIdCounter()(uint256)" --rpc-url $SEPOLIA_RPC_URL
```

### 2. 創建測試演出

```bash
# 設定演出參數
CONCERT_NAME="Taylor Swift Eras Tour"
ARTIST="Taylor Swift"
VENUE="Taipei Arena"
DATE=$(($(date +%s) + 86400 * 30))  # 30天後
TOTAL_TICKETS=1000
PRICE=100000000000000000  # 0.1 ETH (18 decimals)
COOLDOWN=3600  # 1小時轉售冷卻期
WHITELIST_ONLY=false
MIN_VERIFICATION=1

# 創建演出
cast send $CONCERT_TICKET_NFT \
  "createConcert(string,string,string,uint256,uint256,uint256,uint256,bool,uint8)" \
  "$CONCERT_NAME" "$ARTIST" "$VENUE" $DATE $TOTAL_TICKETS $PRICE $COOLDOWN $WHITELIST_ONLY $MIN_VERIFICATION \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# 查詢創建的演出信息
cast call $CONCERT_TICKET_NFT "concerts(uint256)" 1 --rpc-url $SEPOLIA_RPC_URL
```

### 3. 用戶驗證

```bash
# 為測試用戶添加驗證 (需要合約擁有者權限)
TEST_USER=0x...  # 測試用戶地址
IDENTITY_HASH=0x1234567890123456789012345678901234567890123456789012345678901234

cast send $VERIFICATION_REGISTRY \
  "verifyUser(address,bool,bool,bool,bytes32)" \
  $TEST_USER true true false $IDENTITY_HASH \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY

# 查詢用戶驗證狀態
cast call $VERIFICATION_REGISTRY "verifications(address)" $TEST_USER --rpc-url $SEPOLIA_RPC_URL
```

### 4. 購買票券

```bash
# 購買票券 (需要切換到買家帳戶)
BUYER_PRIVATE_KEY=...  # 買家私鑰
CONCERT_ID=1
SEAT_NUMBER=1
SEAT_SECTION="A"

cast send $CONCERT_TICKET_NFT \
  "purchaseTicket(uint256,uint256,string)" \
  $CONCERT_ID $SEAT_NUMBER "$SEAT_SECTION" \
  --value $PRICE \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $BUYER_PRIVATE_KEY

# 查詢票券信息
cast call $CONCERT_TICKET_NFT "tickets(uint256)" 1 --rpc-url $SEPOLIA_RPC_URL
```

## ✅ 驗證部署

### 1. Etherscan 驗證

```bash
# 在 Sepolia Etherscan 查看合約
# https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

# 檢查項目：
# ✓ 合約已驗證 (綠色勾選)
# ✓ 原始碼可見
# ✓ 交易記錄正常
# ✓ 事件日誌正確
```

### 2. MetaMask 導入

```bash
# 在 MetaMask 中添加 NFT
# 1. 資產 → 導入 NFT
# 2. 地址: $CONCERT_TICKET_NFT
# 3. ID: 票券 NFT ID (如果已購買)
```

### 3. 功能測試

```bash
# 測試清單：
# ✓ 創建演出
# ✓ 用戶驗證
# ✓ 購買票券
# ✓ 查詢票券
# ✓ 轉售功能 (進階)
# ✓ 黑名單功能 (進階)
```

## 🔧 故障排除

### 常見錯誤與解決方案

#### 1. 餘額不足
```bash
# 錯誤: "insufficient funds for gas * price + value"
# 解決: 從水龍頭獲取更多測試 ETH
```

#### 2. 私鑰錯誤
```bash
# 錯誤: "invalid private key"
# 解決: 檢查私鑰格式，確保以 0x 開頭
```

#### 3. RPC 連接失敗
```bash
# 錯誤: "connection refused"
# 解決: 更換 RPC URL 或檢查網路連接
```

#### 4. Gas 估算失敗
```bash
# 錯誤: "execution reverted"
# 解決: 檢查合約邏輯，確保參數正確
```

### 進階除錯

```bash
# 使用 -vvvv 參數獲取詳細日誌
forge script scripts/deploy/DeployTixGuard.s.sol --rpc-url $SEPOLIA_RPC_URL -vvvv

# 檢查交易詳情
cast tx YOUR_TX_HASH --rpc-url $SEPOLIA_RPC_URL

# 模擬交易執行
cast call $CONTRACT_ADDRESS "functionName()" --rpc-url $SEPOLIA_RPC_URL
```

## 📚 進一步學習

### 有用資源
- [Foundry 官方文檔](https://book.getfoundry.sh/)
- [Sepolia 區塊瀏覽器](https://sepolia.etherscan.io/)
- [以太坊開發者資源](https://ethereum.org/developers/)
- [OpenZeppelin 合約庫](https://docs.openzeppelin.com/contracts/)

### 下一步
1. 部署到其他測試網 (Polygon Mumbai, BSC Testnet)
2. 實現前端介面
3. 整合 IPFS 存儲票券元數據
4. 添加支付網關整合
5. 準備主網部署 