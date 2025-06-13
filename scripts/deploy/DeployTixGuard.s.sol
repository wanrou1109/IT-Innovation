// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VerificationRegistry} from "../../contracts/VerificationRegistry.sol";
import {ConcertTicketNFT} from "../../contracts/ConcertTicketNFT.sol";

contract DeployTixGuard is Script {
    VerificationRegistry public verificationRegistry;
    ConcertTicketNFT public concertTicketNFT;
    
    // 部署參數
    string constant VERIFICATION_NAME = "TixGuard Verification Registry";
    string constant NFT_NAME = "TixGuard Concert Tickets";
    string constant NFT_SYMBOL = "TIXG";

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== TixGuard Deployment Started ===");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        require(deployer.balance > 0, "Insufficient balance for deployment");

        vm.startBroadcast(deployerPrivateKey);

        // 步驟 1: 部署身份驗證註冊合約
        console.log("\n1. Deploying VerificationRegistry...");
        verificationRegistry = new VerificationRegistry();
        console.log("VerificationRegistry deployed at:", address(verificationRegistry));

        // 步驟 2: 部署主要票券 NFT 合約
        console.log("\n2. Deploying ConcertTicketNFT...");
        concertTicketNFT = new ConcertTicketNFT(address(verificationRegistry));
        console.log("ConcertTicketNFT deployed at:", address(concertTicketNFT));

        // 步驟 3: 基本設定驗證
        console.log("\n3. Verifying deployment...");
        require(address(concertTicketNFT.verificationRegistry()) == address(verificationRegistry), 
                "Registry linkage failed");
        require(concertTicketNFT.owner() == deployer, "Ownership verification failed");
        
        vm.stopBroadcast();

        // 步驟 4: 記錄部署信息
        console.log("\n=== Deployment Completed Successfully ===");
        console.log("Network: Sepolia Testnet");
        console.log("Deployer:", deployer);
        console.log("VerificationRegistry:", address(verificationRegistry));
        console.log("ConcertTicketNFT:", address(concertTicketNFT));
        console.log("Gas used: See transaction details above");
        
        // 保存部署地址到文件
        _saveDeploymentInfo(deployer, address(verificationRegistry), address(concertTicketNFT));
    }

    function _saveDeploymentInfo(
        address deployer,
        address registryAddr,
        address nftAddr
    ) internal view {
        string memory deploymentInfo = string(abi.encodePacked(
            "=== TixGuard Sepolia Deployment ===\n",
            "Timestamp: ", vm.toString(block.timestamp), "\n",
            "Deployer: ", vm.toString(deployer), "\n",
            "VerificationRegistry: ", vm.toString(registryAddr), "\n",
            "ConcertTicketNFT: ", vm.toString(nftAddr), "\n",
            "Chain ID: ", vm.toString(block.chainid)
        ));
        
        // 這裡在實際使用時，您可以將信息寫入文件
        console.log("\nDeployment info for records:");
        console.log(deploymentInfo);
    }
}

// 部署後設定腳本
contract SetupTixGuard is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address verificationRegistryAddr = vm.envAddress("VERIFICATION_REGISTRY");
        address concertTicketNFTAddr = vm.envAddress("CONCERT_TICKET_NFT");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 移除未使用的變數，直接使用地址
        console.log("=== Setting up initial configuration ===");
        console.log("VerificationRegistry:", verificationRegistryAddr);
        console.log("ConcertTicketNFT:", concertTicketNFTAddr);
        
        // 這裡可以添加初始設定，例如：
        // - 驗證測試用戶
        // - 創建示範演出
        // - 設定白名單等
        
        console.log("Setup completed");
        
        vm.stopBroadcast();
    }
} 