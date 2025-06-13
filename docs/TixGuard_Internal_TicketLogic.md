# TixGuard 票券發行與交易邏輯（內部技術說明）

本文件說明 TixGuard 智能合約系統中票券發行、購買、轉賣等核心限制邏輯，並標註對應程式碼依據，供內部技術人員查閱。

---

## 1. 票券發行數量限制

- **功能說明**：主辦方發行演唱會時，必須指定票券總數，系統自動限制最多只能賣出這個數量。
- **程式碼依據**：
  - `createConcert` 函數：
    ```solidity
    function createConcert(..., uint256 _totalTickets, ...) external ... {
        require(_totalTickets > 0, "Must have tickets");
        concerts[concertId] = Concert({
            ...
            totalTickets: _totalTickets,
            soldTickets: 0,
            ...
        });
        ...
    }
    ```
  - 購票時檢查：
    ```solidity
    require(concert.soldTickets < concert.totalTickets, "Sold out");
    ```

---

## 2. 票券購買數量限制（每人/每身份）

- **功能說明**：每個錢包（perWallet）和每個身份（perIdentity）都有限制購買的票數，預設分別為 4 張和 2 張，主辦方可調整。
- **程式碼依據**：
  - 結構體與預設值：
    ```solidity
    struct PurchaseLimit {
        uint256 perWallet;
        uint256 perIdentity;
        uint256 timeWindow;
    }
    ...
    concertLimits[concertId] = PurchaseLimit({
        perWallet: 4,
        perIdentity: 2,
        timeWindow: 24 hours
    });
    ```
  - 購票時檢查：
    ```solidity
    function _checkPurchaseLimits(uint256 concertId, address buyer) internal view {
        PurchaseLimit memory limits = concertLimits[concertId];
        require(purchaseCount[concertId][buyer] < limits.perWallet, "Wallet purchase limit exceeded");
        ...
        require(identityPurchaseCount[concertId][verification.identityHash] < limits.perIdentity, "Identity purchase limit exceeded");
    }
    ```
  - 主辦方可用 `setPurchaseLimits` 調整：
    ```solidity
    function setPurchaseLimits(uint256 concertId, uint256 _perWallet, uint256 _perIdentity, uint256 _timeWindow) external onlyOrganizer(concertId) {...}
    ```

---

## 3. 票券轉賣價格上限

- **功能說明**：每場演唱會的票券轉賣價格有上限（預設為原價 110%），超過就不能掛單，主辦方可調整。
- **程式碼依據**：
  - 發行時設定：
    ```solidity
    maxResalePrice: (_originalPrice * 11000) / 10000, // 110%
    ```
  - 轉賣時檢查：
    ```solidity
    require(price <= concert.maxResalePrice, "Price exceeds maximum");
    ```
  - 主辦方可調整：
    ```solidity
    function updateConcertSettings(uint256 concertId, uint256 _maxResalePrice, ...) external onlyOrganizer(concertId) {
        concert.maxResalePrice = _maxResalePrice;
        ...
    }
    ```

---

## 4. 票券轉賣冷卻期

- **功能說明**：購票後必須等到冷卻期過了才能轉賣，冷卻期由主辦方在發行時設定。
- **程式碼依據**：
    ```solidity
    require(block.timestamp >= ticket.purchaseTime + concert.resaleCooldown, "Still in cooldown period");
    ```

---

## 5. 其他相關限制

- **每張票最多可轉移次數**：
    ```solidity
    uint256 public constant MAX_TRANSFER_COUNT = 2;
    require(ticket.transferCount < MAX_TRANSFER_COUNT, "Max transfers exceeded");
    ```
- **購票間隔限制**：
    ```solidity
    uint256 public constant MIN_PURCHASE_INTERVAL = 1 hours;
    require(block.timestamp >= lastPurchaseTime[buyer][concertId] + MIN_PURCHASE_INTERVAL, "Purchase too frequent");
    ```

---

## 6. 參考檔案
- 身份驗證合約：`contracts/VerificationRegistry.sol`
- 主要票券合約：`contracts/ConcertTicketNFT.sol`
- 驗證測試案例：`test/VerificationRegistry.t.sol`
- 票券測試案例：`test/ConcertTicketNFT.t.sol`
- 部署腳本：`scripts/deploy/DeployTixGuard.s.sol`

如需查詢更細節邏輯，請直接檢視上述檔案。 