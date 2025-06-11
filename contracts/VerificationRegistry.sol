// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// 身份驗證註冊合約
contract VerificationRegistry is Ownable {
    using ECDSA for bytes32;
    
    struct UserVerification {
        bool phoneVerified;
        bool emailVerified;
        bool idVerified;
        bytes32 identityHash;
        uint256 verificationTime;
        uint256 trustScore;
    }
    
    mapping(address => UserVerification) public verifications;
    mapping(bytes32 => address) public identityHashToUser;
    mapping(address => bool) public blacklist;
    
    event UserVerified(address indexed user, uint8 verificationLevel);
    event UserBlacklisted(address indexed user, string reason);
    
    constructor() Ownable(msg.sender) {}
    
    function verifyUser(
        address user,
        bool phoneVerified,
        bool emailVerified,
        bool idVerified,
        bytes32 identityHash
    ) external onlyOwner {
        require(!blacklist[user], "User is blacklisted");
        require(identityHashToUser[identityHash] == address(0) || 
                identityHashToUser[identityHash] == user, "Identity already used");
        
        UserVerification storage verification = verifications[user];
        verification.phoneVerified = phoneVerified;
        verification.emailVerified = emailVerified;
        verification.idVerified = idVerified;
        verification.identityHash = identityHash;
        verification.verificationTime = block.timestamp;
        
        // 計算信任分數
        verification.trustScore = _calculateTrustScore(verification);
        
        // 更新身份映射
        if (identityHash != bytes32(0)) {
            identityHashToUser[identityHash] = user;
        }
        
        uint8 level = 0;
        if (phoneVerified) level = 1;
        if (emailVerified) level = 2;
        if (idVerified) level = 3;
        
        emit UserVerified(user, level);
    }
    
    function _calculateTrustScore(UserVerification memory verification) 
        internal 
        pure 
        returns (uint256) 
    {
        uint256 score = 10;
        if (verification.phoneVerified) score += 30;
        if (verification.emailVerified) score += 30;
        if (verification.idVerified) score += 30;
        return score;
    }
    
    function addToBlacklist(address user, string memory reason) external onlyOwner {
        blacklist[user] = true;
        emit UserBlacklisted(user, reason);
    }
    
    function removeFromBlacklist(address user) external onlyOwner {
        blacklist[user] = false;
    }
    
    function getUserVerification(address user) 
        external 
        view 
        returns (UserVerification memory) 
    {
        return verifications[user];
    }
    
    function isUserVerified(address user, uint8 minLevel) 
        external 
        view 
        returns (bool) 
    {
        UserVerification memory verification = verifications[user];
        
        if (minLevel == 1) return verification.phoneVerified;
        if (minLevel == 2) return verification.phoneVerified && verification.emailVerified;
        if (minLevel == 3) return verification.phoneVerified && 
                                  verification.emailVerified && 
                                  verification.idVerified;
        
        return false;
    }
}
