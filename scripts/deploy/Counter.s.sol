// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VerificationRegistry} from "../../contracts/VerificationRegistry.sol";
import {ConcertTicketNFT} from "../../contracts/ConcertTicketNFT.sol";

contract ConcertTicketScript is Script {
    VerificationRegistry public verificationRegistry;
    ConcertTicketNFT public concertTicketNFT;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy VerificationRegistry first
        verificationRegistry = new VerificationRegistry();
        console.log("VerificationRegistry deployed at:", address(verificationRegistry));

        // Deploy ConcertTicketNFT contract
        concertTicketNFT = new ConcertTicketNFT(address(verificationRegistry));
        console.log("ConcertTicketNFT deployed at:", address(concertTicketNFT));

        // Log deployment information
        console.log("=== Deployment Successful ===");
        console.log("VerificationRegistry address:", address(verificationRegistry));
        console.log("ConcertTicketNFT address:", address(concertTicketNFT));
        console.log("Contract owner:", msg.sender);

        vm.stopBroadcast();
    }

    // Post-deployment setup function
    function setupInitialConfiguration() public {
        vm.startBroadcast();

        // Add initial configuration here
        // For example: set up verification status for test users
        
        console.log("Initial configuration completed");

        vm.stopBroadcast();
    }
}
