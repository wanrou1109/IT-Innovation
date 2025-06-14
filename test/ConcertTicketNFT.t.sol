// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {VerificationRegistry} from "../contracts/VerificationRegistry.sol";
import {ConcertTicketNFT} from "../contracts/ConcertTicketNFT.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock FLT Token for testing
contract MockFLTToken is ERC20 {
    constructor() ERC20("FLT Token", "FLT") {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ConcertTicketNFTTest is Test {
    VerificationRegistry public verificationRegistry;
    ConcertTicketNFT public concertTicketNFT;
    MockFLTToken public fltToken;
    address public owner;
    address public organizer;
    address public buyer1;
    address public buyer2;
    uint256 public CONCERT_DATE;
    uint256 public constant TICKET_PRICE = 1000 * 10**18; // 1000 FLT tokens
    uint256 public constant TOTAL_TICKETS = 100;
    bytes32 public constant IDENTITY_HASH_1 = keccak256("identity1");
    bytes32 public constant IDENTITY_HASH_2 = keccak256("identity2");

    function setUp() public {
        CONCERT_DATE = block.timestamp + 30 days;
        owner = address(this);
        organizer = makeAddr("organizer");
        buyer1 = makeAddr("buyer1");
        buyer2 = makeAddr("buyer2");
        
        // Deploy FLT token first
        fltToken = new MockFLTToken();
        
        // Deploy contracts
        verificationRegistry = new VerificationRegistry();
        concertTicketNFT = new ConcertTicketNFT(address(verificationRegistry), address(fltToken));
        
        // Mint FLT tokens to test users
        fltToken.mint(buyer1, 10000 * 10**18);
        fltToken.mint(buyer2, 10000 * 10**18);
        fltToken.mint(organizer, 5000 * 10**18);
    }

    // ========== Concert Management Tests ==========

    function test_CreateConcert() public {
        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert",
            "Test Artist",
            "Test Venue",
            CONCERT_DATE,
            TOTAL_TICKETS,
            TICKET_PRICE,
            1 hours, // resale cooldown
            false, // not whitelist only
            1 // min verification level
        );

        assertEq(concertId, 1);

        (
            string memory name,
            string memory artist,
            string memory venue,
            uint256 date,
            uint256 originalPrice,
            uint256 maxResalePrice,
            uint256 soldTickets,
            uint256 totalTickets,
            bool isActive
        ) = concertTicketNFT.getConcertDetails(concertId);

        assertEq(name, "Test Concert");
        assertEq(artist, "Test Artist");
        assertEq(venue, "Test Venue");
        assertEq(date, CONCERT_DATE);
        assertEq(originalPrice, TICKET_PRICE);
        assertEq(maxResalePrice, TICKET_PRICE * 110 / 100); // 110%
        assertEq(soldTickets, 0);
        assertEq(totalTickets, TOTAL_TICKETS);
        assertTrue(isActive);
    }

    function test_UpdateConcertSettings() public {
        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 1 hours, false, 1
        );

        vm.prank(organizer);
        concertTicketNFT.updateConcertSettings(
            concertId,
            TICKET_PRICE * 120 / 100, // new max resale price
            false, // disable transfers
            2 // new min verification level
        );

        // Verify changes were applied
        (,,,,, uint256 maxResalePrice,,,) = concertTicketNFT.getConcertDetails(concertId);

        assertEq(maxResalePrice, TICKET_PRICE * 120 / 100);
    }

    // ========== Ticket Purchase Tests ==========

    function test_PurchaseTicket() public {
        // Setup: verify buyer1 and create concert
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 1 hours, false, 1
        );

        // Warp time to avoid purchase interval restriction
        vm.warp(block.timestamp + 1 hours + 1);

        // Approve FLT tokens for purchase
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE);

        // Purchase ticket
        vm.prank(buyer1);
        concertTicketNFT.purchaseTicket(
            concertId,
            1, // seat number
            "A" // seat section
        );

        // Verify ticket was minted
        assertEq(concertTicketNFT.balanceOf(buyer1), 1);

        // Verify ticket details
        (
            uint256 ticketConcertId,
            uint256 seatNumber,
            string memory seatSection,
            address originalBuyer,
            address currentOwner,
            bool isUsed,
            uint8 transferCount,
            uint256 originalPrice
        ) = concertTicketNFT.getTicketDetails(1);

        assertEq(ticketConcertId, concertId);
        assertEq(seatNumber, 1);
        assertEq(seatSection, "A");
        assertEq(originalBuyer, buyer1);
        assertEq(currentOwner, buyer1);
        assertFalse(isUsed);
        assertEq(transferCount, 0);
        assertEq(originalPrice, TICKET_PRICE);
    }

    function test_PurchaseTicket_InsufficientVerification() public {
        // Create concert requiring level 2 verification
        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert",
            "Test Artist",
            "Test Venue",
            CONCERT_DATE,
            TOTAL_TICKETS,
            TICKET_PRICE,
            1 hours,
            false,
            2 // requires phone + email verification
        );

        // Only verify phone for buyer1
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);

        // Approve FLT tokens
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE);

        // Should fail to purchase
        vm.prank(buyer1);
        vm.expectRevert("Insufficient verification level");
        concertTicketNFT.purchaseTicket(concertId, 1, "A");
    }

    function test_PurchaseTicket_InsufficientFLTBalance() public {
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 1 hours, false, 1
        );

        // Set a specific time to ensure we're past the purchase interval
        vm.warp(1000000); // Set to a specific timestamp
        
        // Get buyer1's current balance and transfer it all away
        uint256 buyer1Balance = fltToken.balanceOf(buyer1);
        vm.prank(buyer1);
        fltToken.transfer(buyer2, buyer1Balance);

        // Verify buyer1 has 0 FLT balance
        assertEq(fltToken.balanceOf(buyer1), 0);

        // Try to approve tokens (should still work even with 0 balance)
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE);

        vm.prank(buyer1);
        vm.expectRevert("Insufficient FLT balance");
        concertTicketNFT.purchaseTicket(concertId, 1, "A");
    }

    function test_PurchaseTicket_InsufficientAllowance() public {
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 1 hours, false, 1
        );

        // Warp time to avoid purchase interval restriction
        vm.warp(block.timestamp + 1 hours + 1);

        // Don't approve tokens or approve insufficient amount
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE - 1);

        vm.prank(buyer1);
        vm.expectRevert("Insufficient FLT allowance");
        concertTicketNFT.purchaseTicket(concertId, 1, "A");
    }

    // ========== Resale Tests ==========

    function test_ListAndBuyResaleTicket() public {
        // Setup: create concert and purchase ticket
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);
        verificationRegistry.verifyUser(buyer2, true, false, false, IDENTITY_HASH_2);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert",
            "Test Artist",
            "Test Venue",
            CONCERT_DATE,
            TOTAL_TICKETS,
            TICKET_PRICE,
            0, // no cooldown for test
            false,
            1
        );

        // Warp time to avoid purchase interval restriction
        vm.warp(block.timestamp + 1 hours + 1);

        // Approve and purchase ticket
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE);
        
        vm.prank(buyer1);
        concertTicketNFT.purchaseTicket(concertId, 1, "A");

        uint256 ticketId = 1;
        uint256 resalePrice = TICKET_PRICE * 105 / 100; // 5% markup
        uint256 deadline = block.timestamp + 1 days;

        // List ticket for resale
        vm.prank(buyer1);
        concertTicketNFT.listTicketForSale(ticketId, resalePrice, deadline);

        // Approve FLT for buyer2 and buy resale ticket
        vm.prank(buyer2);
        fltToken.approve(address(concertTicketNFT), resalePrice);
        
        vm.prank(buyer2);
        concertTicketNFT.buyResaleTicket(1);

        // Verify ownership transfer
        assertEq(concertTicketNFT.ownerOf(ticketId), buyer2);

        // Verify transfer count increased
        (,,,,,, uint8 transferCount,) = concertTicketNFT.getTicketDetails(ticketId);
        assertEq(transferCount, 1);
    }

    function test_ListTicket_ExceedsMaxPrice() public {
        // Setup
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 0, false, 1
        );

        // Warp time to avoid purchase interval restriction
        vm.warp(block.timestamp + 1 hours + 1);

        // Approve and purchase ticket
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE);
        
        vm.prank(buyer1);
        concertTicketNFT.purchaseTicket(concertId, 1, "A");

        uint256 ticketId = 1;
        uint256 excessivePrice = TICKET_PRICE * 120 / 100; // Exceeds 110% limit
        uint256 deadline = block.timestamp + 1 days;

        vm.prank(buyer1);
        vm.expectRevert("Price exceeds maximum");
        concertTicketNFT.listTicketForSale(ticketId, excessivePrice, deadline);
    }

    // ========== Entry Verification Tests ==========

    function test_VerifyTicketForEntry() public {
        // Setup
        verificationRegistry.verifyUser(buyer1, true, true, true, IDENTITY_HASH_1);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 1 hours, false, 1
        );

        // Warp time to avoid purchase interval restriction
        vm.warp(block.timestamp + 1 hours + 1);

        // Approve and purchase ticket
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE);
        
        vm.prank(buyer1);
        concertTicketNFT.purchaseTicket(concertId, 1, "A");

        // Create a dummy signature with correct length (65 bytes)
        bytes memory signature = new bytes(65);

        // This should fail with invalid signature, which is expected
        vm.expectRevert();
        concertTicketNFT.verifyTicketForEntry(1, IDENTITY_HASH_1, signature);
    }

    function test_UseTicket() public {
        // Setup
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 1 hours, false, 1
        );

        // Warp time to avoid purchase interval restriction
        vm.warp(block.timestamp + 1 hours + 1);

        // Approve and purchase ticket
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE);
        
        vm.prank(buyer1);
        concertTicketNFT.purchaseTicket(concertId, 1, "A");

        // Use ticket
        concertTicketNFT.useTicket(1);

        // Verify ticket is used
        (,,,,, bool isUsed,,) = concertTicketNFT.getTicketDetails(1);
        assertTrue(isUsed);
    }

    // ========== Access Control Tests ==========

    function test_OnlyOwnerFunctions() public {
        vm.prank(buyer1);
        vm.expectRevert();
        concertTicketNFT.pause();

        vm.prank(buyer1);
        vm.expectRevert();
        verificationRegistry.verifyUser(buyer2, true, true, true, IDENTITY_HASH_2);
    }

    function test_OnlyOrganizerFunctions() public {
        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert", "Test Artist", "Test Venue", CONCERT_DATE, TOTAL_TICKETS, TICKET_PRICE, 1 hours, false, 1
        );

        vm.prank(buyer1);
        vm.expectRevert("Not concert organizer");
        concertTicketNFT.updateConcertSettings(concertId, TICKET_PRICE * 120 / 100, true, 2);
    }

    // ========== Helper Functions ==========

    function test_GetUserTickets() public {
        // Setup and purchase multiple tickets
        verificationRegistry.verifyUser(buyer1, true, false, false, IDENTITY_HASH_1);

        vm.prank(organizer);
        uint256 concertId = concertTicketNFT.createConcert(
            "Test Concert",
            "Test Artist",
            "Test Venue",
            CONCERT_DATE,
            TOTAL_TICKETS,
            TICKET_PRICE,
            0, // Set cooldown to 0 to avoid interval issues
            false,
            1
        );

        // Set initial time
        uint256 baseTime = block.timestamp + 1 hours;
        vm.warp(baseTime);

        // Approve FLT tokens for multiple purchases
        vm.prank(buyer1);
        fltToken.approve(address(concertTicketNFT), TICKET_PRICE * 2);

        // Purchase first ticket
        vm.prank(buyer1);
        concertTicketNFT.purchaseTicket(concertId, 1, "A");

        // Purchase second ticket with proper interval (MIN_PURCHASE_INTERVAL = 1 hour)
        vm.warp(baseTime + 1 hours + 1);
        vm.prank(buyer1);
        concertTicketNFT.purchaseTicket(concertId, 2, "A");

        uint256[] memory userTickets = concertTicketNFT.getUserTickets(buyer1);
        assertEq(userTickets.length, 2);
        assertEq(userTickets[0], 1);
        assertEq(userTickets[1], 2);
    }
}
