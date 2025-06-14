// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./VerificationRegistry.sol";

// 主要票券合約
contract ConcertTicketNFT is ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    uint256 private _tokenIdCounter;
    uint256 private _concertIdCounter;

    VerificationRegistry public verificationRegistry;
    IERC20 public fltToken;

    // 演出結構（優化版）
    struct Concert {
        uint256 id;
        string name;
        string artist;
        string venue;
        uint256 date;
        uint256 totalTickets;
        uint256 soldTickets;
        uint256 originalPrice;
        uint256 maxResalePrice;
        uint256 resaleCooldown;
        address organizer;
        bool transferEnabled;
        bool whitelistOnly;
        bool isActive;
        uint8 minVerificationLevel;
    }

    // 票券結構（優化版）
    struct Ticket {
        uint256 concertId;
        uint256 seatNumber;
        string seatSection;
        address originalBuyer;
        uint256 purchaseTime;
        uint256 originalPrice;
        bytes32 identityHash;
        bool isUsed;
        uint8 transferCount;
        bool isRefundable;
    }

    // 轉售訂單
    struct ResaleOrder {
        uint256 ticketId;
        address seller;
        uint256 price;
        uint256 listTime;
        uint256 deadline;
        bool isActive;
    }

    // 購票限制
    struct PurchaseLimit {
        uint256 perWallet;
        uint256 perIdentity;
        uint256 timeWindow;
    }

    // 狀態變數
    mapping(uint256 => Concert) public concerts;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => ResaleOrder) public resaleOrders;
    mapping(uint256 => PurchaseLimit) public concertLimits;
    mapping(uint256 => mapping(address => uint256)) public purchaseCount;
    mapping(uint256 => mapping(bytes32 => uint256)) public identityPurchaseCount;
    mapping(address => uint256[]) public userTickets;
    mapping(address => mapping(uint256 => uint256)) public lastPurchaseTime;

    // 常數
    uint256 public constant PLATFORM_FEE = 500; // 5% in basis points
    uint256 public constant MAX_TRANSFER_COUNT = 2;
    uint256 public constant MIN_PURCHASE_INTERVAL = 1 hours;
    uint256 private _orderIdCounter;

    // 事件
    event ConcertCreated(
        uint256 indexed concertId, string name, address indexed organizer, uint256 totalTickets, uint256 price
    );
    event TicketMinted(
        uint256 indexed ticketId,
        uint256 indexed concertId,
        address indexed buyer,
        uint256 seatNumber,
        string seatSection
    );
    event TicketListed(uint256 indexed orderId, uint256 indexed ticketId, uint256 price, address indexed seller);
    event TicketSold(uint256 indexed orderId, uint256 indexed ticketId, address indexed buyer, uint256 price);
    event TicketUsed(uint256 indexed ticketId, uint256 timestamp);
    event ConcertStatusChanged(uint256 indexed concertId, bool isActive);
    event EmergencyWithdrawal(address indexed organizer, uint256 amount);

    modifier onlyOrganizer(uint256 concertId) {
        require(concerts[concertId].organizer == msg.sender, "Not concert organizer");
        _;
    }

    modifier validConcert(uint256 concertId) {
        require(concerts[concertId].isActive, "Concert not active");
        require(concerts[concertId].date > block.timestamp, "Concert already ended");
        _;
    }

    modifier notBlacklisted() {
        require(!verificationRegistry.blacklist(msg.sender), "User blacklisted");
        _;
    }

    constructor(address _verificationRegistry, address _fltToken) ERC721("Concert Ticket NFT", "CTN") Ownable(msg.sender) {
        verificationRegistry = VerificationRegistry(_verificationRegistry);
        fltToken = IERC20(_fltToken);
    }

    // =================
    // 演出管理功能
    // =================

    function createConcert(
        string memory _name,
        string memory _artist,
        string memory _venue,
        uint256 _date,
        uint256 _totalTickets,
        uint256 _originalPrice,
        uint256 _resaleCooldown,
        bool _whitelistOnly,
        uint8 _minVerificationLevel
    ) external whenNotPaused returns (uint256) {
        require(_date > block.timestamp, "Date must be in future");
        require(_totalTickets > 0, "Must have tickets");
        require(_originalPrice > 0, "Price must be positive");
        require(_minVerificationLevel <= 3, "Invalid verification level");

        _concertIdCounter++;
        uint256 concertId = _concertIdCounter;

        concerts[concertId] = Concert({
            id: concertId,
            name: _name,
            artist: _artist,
            venue: _venue,
            date: _date,
            totalTickets: _totalTickets,
            soldTickets: 0,
            originalPrice: _originalPrice,
            maxResalePrice: (_originalPrice * 11000) / 10000, // 110%
            resaleCooldown: _resaleCooldown,
            organizer: msg.sender,
            transferEnabled: true,
            whitelistOnly: _whitelistOnly,
            isActive: true,
            minVerificationLevel: _minVerificationLevel
        });

        // 設定預設購票限制
        concertLimits[concertId] = PurchaseLimit({perWallet: 4, perIdentity: 2, timeWindow: 24 hours});

        emit ConcertCreated(concertId, _name, msg.sender, _totalTickets, _originalPrice);
        return concertId;
    }

    function updateConcertSettings(
        uint256 concertId,
        uint256 _maxResalePrice,
        bool _transferEnabled,
        uint8 _minVerificationLevel
    ) external onlyOrganizer(concertId) {
        Concert storage concert = concerts[concertId];
        concert.maxResalePrice = _maxResalePrice;
        concert.transferEnabled = _transferEnabled;
        concert.minVerificationLevel = _minVerificationLevel;
    }

    function setPurchaseLimits(uint256 concertId, uint256 _perWallet, uint256 _perIdentity, uint256 _timeWindow)
        external
        onlyOrganizer(concertId)
    {
        concertLimits[concertId] =
            PurchaseLimit({perWallet: _perWallet, perIdentity: _perIdentity, timeWindow: _timeWindow});
    }

    // =================
    // 票券購買功能
    // =================

    function purchaseTicket(uint256 concertId, uint256 seatNumber, string memory seatSection)
        external
        nonReentrant
        whenNotPaused
        validConcert(concertId)
        notBlacklisted
    {
        Concert storage concert = concerts[concertId];
        require(concert.soldTickets < concert.totalTickets, "Sold out");

        // 驗證等級檢查
        require(
            verificationRegistry.isUserVerified(msg.sender, concert.minVerificationLevel),
            "Insufficient verification level"
        );

        // 白名單檢查
        if (concert.whitelistOnly) {
            require(verificationRegistry.isUserVerified(msg.sender, 3), "Whitelist access requires full verification");
        }

        // 購買限制檢查
        _checkPurchaseLimits(concertId, msg.sender);

        // FLT 代幣支付
        require(fltToken.balanceOf(msg.sender) >= concert.originalPrice, "Insufficient FLT balance");
        require(fltToken.allowance(msg.sender, address(this)) >= concert.originalPrice, "Insufficient FLT allowance");
        
        // 轉移 FLT 代幣到合約
        require(fltToken.transferFrom(msg.sender, address(this), concert.originalPrice), "FLT transfer failed");

        // 鑄造票券
        uint256 ticketId = _mintTicket(concertId, seatNumber, seatSection, msg.sender);

        // 更新狀態
        concert.soldTickets++;
        purchaseCount[concertId][msg.sender]++;
        lastPurchaseTime[msg.sender][concertId] = block.timestamp;
        userTickets[msg.sender].push(ticketId);

        // 更新身份購買計數
        VerificationRegistry.UserVerification memory verification = verificationRegistry.getUserVerification(msg.sender);
        if (verification.identityHash != bytes32(0)) {
            identityPurchaseCount[concertId][verification.identityHash]++;
        }

        // 分配 FLT 代幣給主辦方（扣除平台費用）
        uint256 platformFee = (concert.originalPrice * PLATFORM_FEE) / 10000;
        uint256 organizerAmount = concert.originalPrice - platformFee;

        require(fltToken.transfer(concert.organizer, organizerAmount), "Transfer to organizer failed");

        emit TicketMinted(ticketId, concertId, msg.sender, seatNumber, seatSection);
    }

    function _checkPurchaseLimits(uint256 concertId, address buyer) internal view {
        PurchaseLimit memory limits = concertLimits[concertId];

        // 檢查錢包購買限制
        require(purchaseCount[concertId][buyer] < limits.perWallet, "Wallet purchase limit exceeded");

        // 檢查購買間隔
        require(block.timestamp >= lastPurchaseTime[buyer][concertId] + MIN_PURCHASE_INTERVAL, "Purchase too frequent");

        // 檢查身份購買限制
        VerificationRegistry.UserVerification memory verification = verificationRegistry.getUserVerification(buyer);
        if (verification.identityHash != bytes32(0)) {
            require(
                identityPurchaseCount[concertId][verification.identityHash] < limits.perIdentity,
                "Identity purchase limit exceeded"
            );
        }
    }

    function _mintTicket(uint256 concertId, uint256 seatNumber, string memory seatSection, address buyer)
        internal
        returns (uint256)
    {
        _tokenIdCounter++;
        uint256 ticketId = _tokenIdCounter;

        // 獲取買家身份hash
        VerificationRegistry.UserVerification memory verification = verificationRegistry.getUserVerification(buyer);

        tickets[ticketId] = Ticket({
            concertId: concertId,
            seatNumber: seatNumber,
            seatSection: seatSection,
            originalBuyer: buyer,
            purchaseTime: block.timestamp,
            originalPrice: concerts[concertId].originalPrice,
            identityHash: verification.identityHash,
            isUsed: false,
            transferCount: 0,
            isRefundable: true
        });

        _mint(buyer, ticketId);

        // 設置 metadata URI（應該指向 IPFS）
        string memory tokenURI = _generateTokenURI(ticketId);
        _setTokenURI(ticketId, tokenURI);

        return ticketId;
    }

    function _generateTokenURI(uint256 ticketId) internal pure returns (string memory) {
        // 簡化實現，實際應該生成完整的 JSON metadata
        return string(abi.encodePacked("https://api.concerttickets.com/metadata/", Strings.toString(ticketId)));
    }

    // =================
    // 二手票交易系統
    // =================

    function listTicketForSale(uint256 ticketId, uint256 price, uint256 deadline)
        external
        whenNotPaused
        notBlacklisted
    {
        require(ownerOf(ticketId) == msg.sender, "Not ticket owner");

        Ticket storage ticket = tickets[ticketId];
        Concert storage concert = concerts[ticket.concertId];

        require(concert.transferEnabled, "Transfer disabled");
        require(!ticket.isUsed, "Ticket already used");
        require(ticket.transferCount < MAX_TRANSFER_COUNT, "Max transfers exceeded");
        require(price <= concert.maxResalePrice, "Price exceeds maximum");
        require(deadline > block.timestamp, "Invalid deadline");

        // 檢查冷卻期
        require(block.timestamp >= ticket.purchaseTime + concert.resaleCooldown, "Still in cooldown period");

        uint256 orderId = ++_orderIdCounter;
        resaleOrders[orderId] = ResaleOrder({
            ticketId: ticketId,
            seller: msg.sender,
            price: price,
            listTime: block.timestamp,
            deadline: deadline,
            isActive: true
        });

        emit TicketListed(orderId, ticketId, price, msg.sender);
    }

    function buyResaleTicket(uint256 orderId) external nonReentrant whenNotPaused notBlacklisted {
        ResaleOrder storage order = resaleOrders[orderId];
        require(order.isActive, "Order not active");
        require(block.timestamp <= order.deadline, "Order expired");

        Ticket storage ticket = tickets[order.ticketId];
        require(!ticket.isUsed, "Ticket already used");

        address seller = order.seller;
        require(seller != msg.sender, "Cannot buy own ticket");

        // FLT 代幣支付檢查
        require(fltToken.balanceOf(msg.sender) >= order.price, "Insufficient FLT balance");
        require(fltToken.allowance(msg.sender, address(this)) >= order.price, "Insufficient FLT allowance");
        
        // 轉移 FLT 代幣到合約
        require(fltToken.transferFrom(msg.sender, address(this), order.price), "FLT transfer failed");

        // 轉移票券
        _transfer(seller, msg.sender, order.ticketId);

        // 更新票券狀態
        ticket.transferCount++;

        // 分配 FLT 收益
        uint256 platformFee = (order.price * PLATFORM_FEE) / 10000;
        uint256 sellerAmount = order.price - platformFee;

        require(fltToken.transfer(seller, sellerAmount), "Transfer to seller failed");

        // 關閉訂單
        order.isActive = false;

        emit TicketSold(orderId, order.ticketId, msg.sender, order.price);
    }

    function cancelResaleOrder(uint256 orderId) external {
        ResaleOrder storage order = resaleOrders[orderId];
        require(order.seller == msg.sender, "Not order creator");
        require(order.isActive, "Order not active");

        order.isActive = false;
    }

    // =================
    // 入場驗證系統
    // =================

    function verifyTicketForEntry(uint256 ticketId, bytes32 identityHash, bytes memory signature)
        external
        view
        returns (bool isValid, string memory reason)
    {
        if (_ownerOf(ticketId) == address(0)) {
            return (false, "Ticket does not exist");
        }

        Ticket memory ticket = tickets[ticketId];

        if (ticket.isUsed) {
            return (false, "Ticket already used");
        }

        Concert memory concert = concerts[ticket.concertId];
        if (concert.date <= block.timestamp) {
            return (false, "Concert already ended");
        }

        if (ticket.identityHash != identityHash) {
            return (false, "Identity mismatch");
        }

        // 驗證數位簽名
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                ticketId,
                identityHash,
                block.timestamp / 300 // 5分鐘時間窗口
            )
        );

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recovered = ECDSA.recover(ethSignedMessageHash, signature);
        if (recovered != ownerOf(ticketId)) {
            return (false, "Invalid signature");
        }

        return (true, "Valid ticket");
    }

    function useTicket(uint256 ticketId) external onlyOwner {
        require(_ownerOf(ticketId) != address(0), "Ticket does not exist");
        tickets[ticketId].isUsed = true;
        emit TicketUsed(ticketId, block.timestamp);
    }

    // =================
    // 查詢功能
    // =================

    function getTicketDetails(uint256 ticketId)
        external
        view
        returns (
            uint256 concertId,
            uint256 seatNumber,
            string memory seatSection,
            address originalBuyer,
            address currentOwner,
            bool isUsed,
            uint8 transferCount,
            uint256 originalPrice
        )
    {
        require(_ownerOf(ticketId) != address(0), "Ticket does not exist");
        Ticket memory ticket = tickets[ticketId];

        return (
            ticket.concertId,
            ticket.seatNumber,
            ticket.seatSection,
            ticket.originalBuyer,
            ownerOf(ticketId),
            ticket.isUsed,
            ticket.transferCount,
            ticket.originalPrice
        );
    }

    function getConcertDetails(uint256 concertId)
        external
        view
        returns (
            string memory name,
            string memory artist,
            string memory venue,
            uint256 date,
            uint256 originalPrice,
            uint256 maxResalePrice,
            uint256 soldTickets,
            uint256 totalTickets,
            bool isActive
        )
    {
        Concert memory concert = concerts[concertId];
        return (
            concert.name,
            concert.artist,
            concert.venue,
            concert.date,
            concert.originalPrice,
            concert.maxResalePrice,
            concert.soldTickets,
            concert.totalTickets,
            concert.isActive
        );
    }

    function getUserTickets(address user) external view returns (uint256[] memory) {
        uint256[] memory ownedTickets = new uint256[](balanceOf(user));
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < userTickets[user].length; i++) {
            uint256 ticketId = userTickets[user][i];
            if (ownerOf(ticketId) == user) {
                ownedTickets[currentIndex] = ticketId;
                currentIndex++;
            }
        }

        // 調整陣列大小
        uint256[] memory result = new uint256[](currentIndex);
        for (uint256 i = 0; i < currentIndex; i++) {
            result[i] = ownedTickets[i];
        }

        return result;
    }

    function getActiveResaleOrders(uint256 limit, uint256 offset) external view returns (ResaleOrder[] memory orders) {
        uint256 activeCount = 0;

        // 計算活躍訂單數量
        for (uint256 i = 1; i <= _orderIdCounter; i++) {
            if (resaleOrders[i].isActive && block.timestamp <= resaleOrders[i].deadline) {
                activeCount++;
            }
        }

        // 應用分頁
        uint256 startIndex = offset;
        uint256 endIndex = startIndex + limit;
        if (endIndex > activeCount) {
            endIndex = activeCount;
        }

        orders = new ResaleOrder[](endIndex - startIndex);
        uint256 currentIndex = 0;
        uint256 foundCount = 0;

        for (uint256 i = 1; i <= _orderIdCounter && currentIndex < orders.length; i++) {
            if (resaleOrders[i].isActive && block.timestamp <= resaleOrders[i].deadline) {
                if (foundCount >= startIndex) {
                    orders[currentIndex] = resaleOrders[i];
                    currentIndex++;
                }
                foundCount++;
            }
        }

        return orders;
    }

    // =================
    // 管理功能
    // =================

    function toggleConcert(uint256 concertId) external onlyOrganizer(concertId) {
        concerts[concertId].isActive = !concerts[concertId].isActive;
        emit ConcertStatusChanged(concertId, concerts[concertId].isActive);
    }

    function emergencyWithdraw(uint256 concertId) external onlyOrganizer(concertId) {
        Concert memory concert = concerts[concertId];
        require(concert.date + 30 days < block.timestamp, "Can only withdraw 30 days after concert");

        uint256 ethAmount = address(this).balance;
        if (ethAmount > 0) {
            (bool success,) = payable(concert.organizer).call{value: ethAmount}("");
            require(success, "Emergency ETH withdrawal failed");
        }

        emit EmergencyWithdrawal(concert.organizer, ethAmount);
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 fltAmount = fltToken.balanceOf(address(this));
        if (fltAmount > 0) {
            require(fltToken.transfer(owner(), fltAmount), "Platform FLT fee withdrawal failed");
        }

        uint256 ethAmount = address(this).balance;
        if (ethAmount > 0) {
            (bool success,) = payable(owner()).call{value: ethAmount}("");
            require(success, "Platform ETH fee withdrawal failed");
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateVerificationRegistry(address newRegistry) external onlyOwner {
        verificationRegistry = VerificationRegistry(newRegistry);
    }

    // =================
    // 覆寫函數
    // =================

    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        whenNotPaused
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // 檢查轉移限制
        if (from != address(0) && to != address(0)) {
            // 不是鑄造或銷毀
            Ticket storage ticket = tickets[tokenId];
            Concert memory concert = concerts[ticket.concertId];

            require(concert.transferEnabled, "Transfer disabled for this concert");
            require(ticket.transferCount < MAX_TRANSFER_COUNT, "Max transfers exceeded");
        }

        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
