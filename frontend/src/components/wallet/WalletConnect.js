import React, { useState } from 'react';
import { Wallet, Copy, Check } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet.js';
import '../../styles/components/WalletConnect.css';

const WalletConnect = () => {
    const { 
        isConnected, 
        isConnecting, 
        walletInfo, 
        connectWallet, 
        disconnectWallet, 
        copyAddress, 
        formatAddress 
    } = useWallet();
    
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = async () => {
        const success = await copyAddress();
        if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleConnect = async () => {
        await connectWallet();
    };

    if (!isConnected) {
        return (
        <div className="wallet-connect">
            <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="connect-button"
            >
            <Wallet size={16} />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
        </div>
        );
    }

    return (
        <div className="wallet-info">
        {/* Connection Status */}
        <div className="connection-status">
            <div className="status-indicator">
            <div className="status-dot connected"></div>
            <span className="status-text">Connected</span>
            </div>
        </div>

        {/* Wallet Details */}
        <div className="wallet-details">
            <div className="wallet-name">{walletInfo.name}</div>
            
            <div className="wallet-address">
            <span className="address-text">{formatAddress(walletInfo.address)}</span>
            <button
                onClick={handleCopyAddress}
                className="copy-button"
                title="Copy address"
            >
                {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            </div>

            {/* Balances */}
            <div className="wallet-balances">
            <div className="balance-item">
                <span className="balance-label">FLT:</span>
                <span className="balance-value">{walletInfo.fltBalance.toLocaleString()}</span>
            </div>
            <div className="balance-item">
                <span className="balance-label">ETH:</span>
                <span className="balance-value">{walletInfo.ethBalance}</span>
            </div>
            <div className="balance-item">
                <span className="balance-label">NFTs:</span>
                <span className="balance-value">{walletInfo.nftCount}</span>
            </div>
            </div>
        </div>

        {/* Actions */}
        <div className="wallet-actions">
            <button
            onClick={disconnectWallet}
            className="disconnect-button"
            >
            Disconnect
            </button>
        </div>
        </div>
    );
};

export default WalletConnect;