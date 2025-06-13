# TixGuard Sepolia 快速入門指南

## 🚀 5分鐘快速部署

### 第一步：環境準備 (2分鐘)

```bash
# 1. 確保已安裝 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 2. 設定私鑰環境變數 (替換為您的私鑰)
export PRIVATE_KEY=0x你的私鑰

# 3. 設定 RPC URL (可選，有預設值)
export SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### 第二步：一鍵部署 (2分鐘)

```bash
# 給腳本執行權限
chmod +x scripts/utils/deploy_sepolia.sh

# 執行自動部署
./scripts/utils/deploy_sepolia.sh
```

### 第三步：設定合約地址 (1分鐘)

```bash
# 從部署輸出中複製地址並設定環境變數
export VERIFICATION_REGISTRY=0x部署的驗證註冊合約地址
export CONCERT_TICKET_NFT=0x部署的票券NFT合約地址

# 保存到 .env 文件 (推薦)
echo "VERIFICATION_REGISTRY=$VERIFICATION_REGISTRY" >> .env
echo "CONCERT_TICKET_NFT=$CONCERT_TICKET_NFT" >> .env
```

### 第四步：開始測試

```bash
# 給互動腳本執行權限
chmod +x scripts/utils/interact_sepolia.sh

# 啟動互動式測試
./scripts/utils/interact_sepolia.sh
```

## 📋 完整步驟 vs 範例對比

| 範例 (ERC-20) | TixGuard (NFT) | 說明 |
|---------------|----------------|------|
| `export PRIVATE_KEY=<key>` | `export PRIVATE_KEY=<key>` | ✅ 相同 |
| `forge script script/MyToken.s.sol` | `forge script scripts/deploy/DeployTixGuard.s.sol` | 📝 腳本路徑不同 |
| `cast call $CONTRACT "totalSupply()"` | `cast call $CONCERT_TICKET_NFT "name()"` | 📝 函數名不同 |
| `cast send $CONTRACT "mint(address,uint256)"` | `cast send $CONCERT_TICKET_NFT "createConcert(...)"` | 📝 功能不同 |

## 🎯 核心概念解釋

### 1. **智能合約架構差異**

#### ERC-20 代幣 (範例)
```solidity
contract MyToken is ERC20 {
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external;
}
```

#### TixGuard NFT 系統 (您的專案)
```solidity
contract ConcertTicketNFT is ERC721 {
    function createConcert(...) external;
    function purchaseTicket(...) external payable;
    function listForResale(...) external;
}

contract VerificationRegistry {
    function verifyUser(...) external;
}
```

### 2. **部署複雜度對比**

| 項目 | ERC-20 | TixGuard |
|------|--------|----------|
| 合約數量 | 1個 | 2個 (互相依賴) |
| 建構參數 | 簡單 | 複雜 (需要註冊合約地址) |
| 初始設定 | 無 | 需要驗證用戶、創建演出 |

### 3. **Foundry 框架深度應用**

#### **Forge** (編譯和測試)
```bash
# 編譯合約
forge build

# 運行測試
forge test -vv

# 詳細測試報告
forge test --gas-report
```

#### **Cast** (區塊鏈互動)
```bash
# 查詢函數 (view/pure)
cast call $CONTRACT "functionName()(returnType)"

# 執行交易 (state-changing)
cast send $CONTRACT "functionName(paramType)" paramValue

# 查詢事件日誌
cast logs --address $CONTRACT "EventName(indexed address,uint256)"
```

#### **Script** (部署腳本)
```solidity
contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();  // 開始廣播交易
        
        // 部署合約
        MyContract contract = new MyContract();
        
        vm.stopBroadcast();   // 停止廣播
    }
}
```

## 🔄 從範例到專案的轉換

### 1. **環境變數對應**

```bash
# 範例中
export CONTRACT_ADDRESS=0x...

# 您的專案中
export VERIFICATION_REGISTRY=0x...
export CONCERT_TICKET_NFT=0x...
```

### 2. **命令對應表**

| 範例命令 | TixGuard 等效命令 | 功能 |
|----------|-------------------|------|
| `cast call $CONTRACT "totalSupply()"` | `cast call $CONCERT_TICKET_NFT "_tokenIdCounter()"` | 查詢總量 |
| `cast call $CONTRACT "name()"` | `cast call $CONCERT_TICKET_NFT "name()"` | 查詢名稱 |
| `cast send $CONTRACT "mint(...)"` | `cast send $CONCERT_TICKET_NFT "createConcert(...)"` | 創建功能 |
| `cast send $CONTRACT "transfer(...)"` | `cast send $CONCERT_TICKET_NFT "purchaseTicket(...)"` | 轉移/購買 |

### 3. **高級功能擴展**

```bash
# 查詢 NFT 擁有者
cast call $CONCERT_TICKET_NFT "ownerOf(uint256)" 票券ID

# 查詢用戶票券數量
cast call $CONCERT_TICKET_NFT "balanceOf(address)" 用戶地址

# 查詢已授權的操作員
cast call $CONCERT_TICKET_NFT "getApproved(uint256)" 票券ID

# 查詢演出詳細信息
cast call $CONCERT_TICKET_NFT "concerts(uint256)" 演出ID
```

## 🛠️ 故障排除快速參考

| 錯誤 | 原因 | 解決方案 |
|------|------|----------|
| `insufficient funds` | ETH 不足 | 從水龍頭獲取測試 ETH |
| `execution reverted` | 函數執行失敗 | 檢查參數和權限 |
| `nonce too high` | 交易順序問題 | 重新啟動 MetaMask |
| `gas estimation failed` | Gas 估算錯誤 | 手動設定 gas limit |

## 📚 延伸學習

### 1. **測試網路擴展**
- Polygon Mumbai: `https://rpc-mumbai.maticvigil.com`
- BSC Testnet: `https://data-seed-prebsc-1-s1.binance.org:8545`
- Arbitrum Goerli: `https://goerli-rollup.arbitrum.io/rpc`

### 2. **進階部署技巧**
```bash
# 使用 Create2 確定性部署
forge create contracts/MyContract.sol:MyContract --constructor-args arg1 arg2

# 多重簽名部署
forge script scripts/MultiSigDeploy.s.sol --rpc-url $RPC_URL

# 驗證合約原始碼
forge verify-contract $CONTRACT_ADDRESS src/MyContract.sol:MyContract --etherscan-api-key $API_KEY
```

### 3. **監控和維護**
```bash
# 監控合約事件
cast logs --address $CONTRACT --from-block latest

# 檢查合約狀態
cast storage $CONTRACT 0  # 查詢存儲槽 0

# 升級合約 (使用代理模式)
cast send $PROXY_CONTRACT "upgrade(address)" $NEW_IMPLEMENTATION
```

## 🎉 成功部署檢查清單

- [ ] ✅ Foundry 工具已安裝
- [ ] ✅ MetaMask 錢包已設定
- [ ] ✅ Sepolia 測試 ETH 已獲取
- [ ] ✅ 私鑰環境變數已設定
- [ ] ✅ 合約編譯成功
- [ ] ✅ 測試全部通過
- [ ] ✅ 部署腳本執行成功
- [ ] ✅ 合約地址已保存
- [ ] ✅ Etherscan 驗證成功
- [ ] ✅ 基本功能測試完成

**🎊 恭喜！您已成功將 TixGuard 部署到 Sepolia 測試網！** 