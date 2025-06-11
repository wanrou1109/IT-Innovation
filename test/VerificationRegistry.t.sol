// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {VerificationRegistry} from "../contracts/VerificationRegistry.sol";

contract VerificationRegistryTest is Test {
    VerificationRegistry public verificationRegistry;
    address public buyer1;
    address public buyer2;
    bytes32 public constant IDENTITY_HASH_1 = keccak256("identity1");
    bytes32 public constant IDENTITY_HASH_2 = keccak256("identity2");

    function setUp() public {
        buyer1 = makeAddr("buyer1");
        buyer2 = makeAddr("buyer2");
        verificationRegistry = new VerificationRegistry();
    }

    function test_VerifyUser() public {
        verificationRegistry.verifyUser(
            buyer1,
            true,  // phone verified
            true,  // email verified
            true,  // id verified
            IDENTITY_HASH_1
        );
        VerificationRegistry.UserVerification memory verification = 
            verificationRegistry.getUserVerification(buyer1);
        assertTrue(verification.phoneVerified);
        assertTrue(verification.emailVerified);
        assertTrue(verification.idVerified);
        assertEq(verification.identityHash, IDENTITY_HASH_1);
        assertEq(verification.trustScore, 100); // 10 + 30 + 30 + 30
    }

    function test_IsUserVerified() public {
        verificationRegistry.verifyUser(buyer1, true, true, false, IDENTITY_HASH_1);
        assertTrue(verificationRegistry.isUserVerified(buyer1, 1)); // phone only
        assertTrue(verificationRegistry.isUserVerified(buyer1, 2)); // phone + email
        assertFalse(verificationRegistry.isUserVerified(buyer1, 3)); // full verification
    }

    function test_Blacklist() public {
        verificationRegistry.addToBlacklist(buyer1, "Fraudulent activity");
        assertTrue(verificationRegistry.blacklist(buyer1));
        verificationRegistry.removeFromBlacklist(buyer1);
        assertFalse(verificationRegistry.blacklist(buyer1));
    }
} 