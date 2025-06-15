// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/ConcertTicketNFT.sol";

contract DeployFLTContract is Script {
    function run() external {
        // 從環境變數讀取地址
        address verificationRegistry = vm.envAddress("VERIFICATION_REGISTRY");
        address fltTokenAddress = vm.envAddress("FLT_TOKEN_ADDRESS");
        
        vm.startBroadcast();
        
        // 部署新的 ConcertTicketNFT 合約，支持 FLT 支付
        ConcertTicketNFT concertTicketNFT = new ConcertTicketNFT(
            verificationRegistry,
            fltTokenAddress
        );
        
        vm.stopBroadcast();
        
        console.log("ConcertTicketNFT deployed to:", address(concertTicketNFT));
        console.log("VerificationRegistry:", verificationRegistry);
        console.log("FLT Token Address:", fltTokenAddress);
    }
} 