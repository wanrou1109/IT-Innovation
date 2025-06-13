import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';
import { 
    User, 
    Wallet, 
    Copy, 
    Check, 
    ExternalLink,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import '../styles/pages/Profile.css';

const Profile = ({ profileTab = 'dashboard' }) => {
    const { 
        isConnected, 
        isConnecting, 
        walletInfo, 
        connectWallet, 
        disconnectWallet, 
        copyAddress, 
        formatAddress 
    } = useWallet();

    const [walletForm, setWalletForm] = useState({
        walletName: '',
        walletAddress: '',
        privateKey: '',
        seedPhrase: '',
        networkId: 'auto'
    });
    
    const [connectionStep, setConnectionStep] = useState(1); 
    const [copied, setCopied] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('');

    // 模擬用戶統計數據
    const userStats = {
        fanLevel: 'Gold',
        experience: 850,
        maxExperience: 1000,
        showsAttended: 28,
        nftsOwned: 11,
        totalSpent: 245
    };

    const handleCopyAddress = async () => {
        const success = await copyAddress();
        if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWalletConnect = async () => {
        try {
        setConnectionStatus('connecting');
        
        // 驗證必填字段
        if (!walletForm.walletName || !walletForm.walletAddress) {
            setConnectionStatus('error');
            return;
        }

        // 模擬連接過程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 這裡應該調用真正的錢包連接邏輯
        // 使用用戶填寫的信息連接錢包
        await connectWallet();
        setConnectionStatus('connected');
        } catch (error) {
        setConnectionStatus('error');
        console.error('Connection failed:', error);
        }
    };

    const handleWalletDisconnect = () => {
        disconnectWallet();
        setConnectionStatus('');
        setConnectionStep(1);
        setWalletForm({
        walletName: '',
        walletAddress: '',
        privateKey: '',
        seedPhrase: '',
        networkId: 'auto'
        });
    };

    const validateForm = () => {
        const { walletName, walletAddress, privateKey, seedPhrase } = walletForm;
        
        if (!walletName || !walletAddress) {
        return false;
        }
        
        if (!privateKey && !seedPhrase) {
        return false;
        }
        
        return true;
    };

    const renderDashboard = () => (
        <div className="profile-dashboard">
        <div className="user-avatar-section">
            <div className="user-avatar">
            <User size={48} />
            </div>
            <div className="user-info">
            <h2>K-pop Fan</h2>
            <p>Level: {userStats.fanLevel}</p>
            <p>Member since 2024</p>
            </div>
        </div>

        <div className="stats-grid">
            <div className="stat-item">
            <div className="stat-value">{userStats.fanLevel}</div>
            <div className="stat-label">Fan Level</div>
            </div>
            <div className="stat-item">
            <div className="stat-value">{userStats.showsAttended}</div>
            <div className="stat-label">Shows Attended</div>
            </div>
            <div className="stat-item">
            <div className="stat-value">{userStats.nftsOwned}</div>
            <div className="stat-label">NFTs Owned</div>
            </div>
            <div className="stat-item">
            <div className="stat-value">{userStats.totalSpent} FLT</div>
            <div className="stat-label">Total Spent</div>
            </div>
        </div>

        <div className="progress-section">
            <h3>Level Progress</h3>
            <div className="progress-bar">
            <div 
                className="progress-fill"
                style={{ width: `${(userStats.experience / userStats.maxExperience) * 100}%` }}
            ></div>
            </div>
            <p>{userStats.experience} / {userStats.maxExperience} XP</p>
        </div>
        </div>
    );

    const renderSettings = () => (
        <div className="profile-settings">
        <Card>
            <h3>Account Settings</h3>
            <div className="settings-form">
            <div className="form-group">
                <label>Display Name</label>
                <input type="text" defaultValue="K-pop Fan" />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue="fan@example.com" />
            </div>
            <div className="form-group">
                <label>Language</label>
                <select defaultValue="en">
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                </select>
            </div>
            <Button variant="primary">Save Changes</Button>
            </div>
        </Card>
        </div>
    );

    const renderWalletConnection = () => (
        <div className="wallet-connection">
        <Card>
            <h3>Wallet Connection</h3>
            
            {!isConnected ? (
            <div className="wallet-connect-section">
                <div className="connection-info">
                <div className="info-icon">
                    <Wallet size={32} />
                </div>
                <h4>Connect Your Wallet</h4>
                <p>Enter your wallet information to connect and access all features</p>
                </div>

                {/* Step 1: 填寫錢包信息 */}
                {connectionStep === 1 && (
                <div className="wallet-step">
                    <h4>Enter Your Wallet Information</h4>
                    <div className="wallet-form">
                    <div className="form-group">
                        <label>Wallet Name *</label>
                        <input 
                        type="text" 
                        placeholder="My Wallet"
                        value={walletForm.walletName}
                        onChange={(e) => setWalletForm({...walletForm, walletName: e.target.value})}
                        required
                        />
                    </div>

                    <div className="form-group">
                        <label>Wallet Address *</label>
                        <input 
                        type="text" 
                        placeholder="0x..."
                        value={walletForm.walletAddress}
                        onChange={(e) => setWalletForm({...walletForm, walletAddress: e.target.value})}
                        required
                        />
                        <small>Your public wallet address</small>
                    </div>

                    <div className="form-group">
                        <label>Network (Optional)</label>
                        <select 
                        value={walletForm.networkId}
                        onChange={(e) => setWalletForm({...walletForm, networkId: e.target.value})}
                        >
                        <option value="auto">Auto-detect</option>
                        <option value="1">Ethereum Mainnet</option>
                        <option value="137">Polygon</option>
                        <option value="5">Goerli Testnet</option>
                        <option value="11155111">Sepolia Testnet</option>
                        </select>
                        <small>The system will auto-detect if not specified</small>
                    </div>

                    <div className="form-group">
                        <label>Private Key</label>
                        <input 
                        type="password" 
                        placeholder="Enter your private key (optional)"
                        value={walletForm.privateKey}
                        onChange={(e) => setWalletForm({...walletForm, privateKey: e.target.value})}
                        />
                        <small>⚠️ Never share your private key</small>
                    </div>

                    <div className="form-group">
                        <label>Seed Phrase</label>
                        <textarea 
                        placeholder="Enter your 12-24 word seed phrase (optional)"
                        value={walletForm.seedPhrase}
                        onChange={(e) => setWalletForm({...walletForm, seedPhrase: e.target.value})}
                        rows={3}
                        />
                        <small>⚠️ Never share your seed phrase</small>
                    </div>

                    <div className="security-notice">
                        <AlertCircle size={16} />
                        <span>Your sensitive information is encrypted and stored securely</span>
                    </div>
                    </div>
                    
                    <div className="step-actions">
                    <Button 
                        variant="primary" 
                        onClick={() => setConnectionStep(2)}
                        disabled={!validateForm()}
                    >
                        Review & Connect
                    </Button>
                    </div>
                </div>
                )}

                {/* Step 2: 確認連接 */}
                {connectionStep === 2 && (
                <div className="wallet-step">
                    <h4>Confirm Connection</h4>
                    <div className="connection-review">
                    <div className="review-item">
                        <span className="label">Wallet Name:</span>
                        <span className="value">{walletForm.walletName}</span>
                    </div>
                    <div className="review-item">
                        <span className="label">Address:</span>
                        <span className="value">{walletForm.walletAddress.slice(0, 6)}...{walletForm.walletAddress.slice(-4)}</span>
                    </div>
                    <div className="review-item">
                        <span className="label">Network:</span>
                        <span className="value">
                        {walletForm.networkId === 'auto' && 'Auto-detect'}
                        {walletForm.networkId === '1' && 'Ethereum Mainnet'}
                        {walletForm.networkId === '137' && 'Polygon'}
                        {walletForm.networkId === '5' && 'Goerli Testnet'}
                        {walletForm.networkId === '11155111' && 'Sepolia Testnet'}
                        </span>
                    </div>
                    <div className="review-item">
                        <span className="label">Authentication:</span>
                        <span className="value">
                        {walletForm.privateKey && walletForm.seedPhrase ? 'Private Key + Seed Phrase' :
                        walletForm.privateKey ? 'Private Key' :
                        walletForm.seedPhrase ? 'Seed Phrase' :
                        'Address Only'}
                        </span>
                    </div>
                    </div>
                    
                    <div className="step-actions">
                    <Button 
                        variant="outline" 
                        onClick={() => setConnectionStep(1)}
                    >
                        Back
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleWalletConnect}
                        disabled={isConnecting}
                        loading={isConnecting}
                        icon={<Wallet size={16} />}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                    </div>
                </div>
                )}

                {connectionStatus === 'error' && (
                <div className="connection-status error">
                    <AlertCircle size={16} />
                    <span>Connection failed. Please check your information and try again.</span>
                </div>
                )}
            </div>
            ) : (
            <div className="wallet-connected-section">
                <div className="connection-status success">
                <CheckCircle size={16} />
                <span>Wallet Connected Successfully</span>
                </div>

                <div className="wallet-details">
                <div className="wallet-info-row">
                    <span className="label">Wallet Name:</span>
                    <span className="value">{walletInfo.name}</span>
                </div>
                
                <div className="wallet-info-row">
                    <span className="label">Address:</span>
                    <div className="address-section">
                    <span className="value">{formatAddress(walletInfo.address)}</span>
                    <button
                        onClick={handleCopyAddress}
                        className="copy-button"
                        title="Copy address"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                        onClick={() => window.open(`https://etherscan.io/address/${walletInfo.address}`, '_blank')}
                        className="external-button"
                        title="View on Etherscan"
                    >
                        <ExternalLink size={14} />
                    </button>
                    </div>
                </div>

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

                <div className="wallet-actions">
                <Button 
                    variant="outline" 
                    onClick={handleWalletDisconnect}
                    icon={<Wallet size={16} />}
                >
                    Disconnect Wallet
                </Button>
                </div>
            </div>
            )}
        </Card>
        </div>
    );

    const renderPreferences = () => (
        <div className="profile-preferences">
        <Card>
            <h3>Preferences</h3>
            <div className="preferences-form">
            <div className="preference-group">
                <h4>Notifications</h4>
                <div className="checkbox-group">
                <label>
                    <input type="checkbox" defaultChecked />
                    Email notifications for new events
                </label>
                <label>
                    <input type="checkbox" defaultChecked />
                    NFT drop alerts
                </label>
                <label>
                    <input type="checkbox" />
                    Promotional emails
                </label>
                </div>
            </div>

            <div className="preference-group">
                <h4>Privacy</h4>
                <div className="checkbox-group">
                <label>
                    <input type="checkbox" defaultChecked />
                    Show my attendance history
                </label>
                <label>
                    <input type="checkbox" />
                    Allow others to see my NFT collection
                </label>
                </div>
            </div>

            <Button variant="primary">Save Preferences</Button>
            </div>
        </Card>
        </div>
    );

    const renderContent = () => {
        switch (profileTab) {
        case 'dashboard':
            return renderDashboard();
        case 'settings':
            return renderSettings();
        case 'wallet':
            return renderWalletConnection();
        case 'preferences':
            return renderPreferences();
        default:
            return renderDashboard();
        }
    };

    return (
        <div className="profile">
        <div className="profile-header">
            <h1>Profile</h1>
            <p className="profile-subtitle">
            Manage your account settings and wallet connection
            </p>
        </div>

        <div className="profile-content">
            {renderContent()}
        </div>
        </div>
    );
};

export default Profile;