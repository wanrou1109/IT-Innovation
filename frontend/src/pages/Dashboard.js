import React from 'react';
import Card from '../components/ui/Card.js';
import { useWallet } from '../hooks/useWallet.js';
import '../styles/pages/Dashboard.css';
import { checkUserVerificationForConcert, getConcertVerificationRequirement, getUserVerificationLevel } from '../utils/web3Utils.js';

const Dashboard = () => {
    const { walletInfo, isConnected } = useWallet();

    // 模擬用戶統計數據
    const userStats = {
        fanLevel: 'Gold',
        experience: 850,
        maxExperience: 1000,
        showsAttended: 28,
        milestoneProgress: 85,
        warningStatus: 'No Warning'
    };

    const experiencePercentage = (userStats.experience / userStats.maxExperience) * 100;
    const milestonePercentage = userStats.milestoneProgress;

    // 驗證等級調試功能
    const handleVerificationDebug = async () => {
        if (walletInfo.address) {
            try {
                console.log('=== Verification Debug Start ===');
                
                // 檢查用戶驗證等級
                const userLevel = await getUserVerificationLevel(walletInfo.address);
                console.log(`User verification level: ${userLevel}`);
                
                // 檢查演唱會要求
                const concertRequirement = await getConcertVerificationRequirement(1);
                console.log(`Concert 1 requirement: ${concertRequirement}`);
                
                // 檢查是否可以購買
                const verificationCheck = await checkUserVerificationForConcert(walletInfo.address, 1);
                console.log('Verification check result:', verificationCheck);
                
                alert(`驗證調試完成！
用戶等級: ${userLevel}
演唱會要求: ${concertRequirement}
可以購買: ${verificationCheck.canPurchase}
訊息: ${verificationCheck.message}
請查看控制台獲取詳細信息。`);
                
                console.log('=== Verification Debug End ===');
            } catch (error) {
                console.error('Verification debug error:', error);
                alert(`驗證調試失敗: ${error.message}`);
            }
        } else {
            alert('請先連接錢包');
        }
    };

    if (!isConnected) {
        return (
        <div className="dashboard">
            <div className="dashboard-header">
            <h1>Personal Dashboard</h1>
            </div>
            <div className="connect-wallet-prompt">
            <h2>Connect your wallet to view dashboard</h2>
            <p>Please connect your wallet to access your personal dashboard and view your stats.</p>
            </div>
        </div>
        );
    }

    return (
        <div className="dashboard">
        <div className="dashboard-header">
            <h1>Personal Dashboard</h1>
            <button 
                onClick={handleVerificationDebug}
                style={{
                    marginLeft: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Debug 驗證等級
            </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
            {/* Fan Level */}
            <Card className="stat-card fan-level">
            <div className="stat-header">
                <h3 className="stat-title">{userStats.fanLevel}</h3>
                <p className="stat-subtitle">Fan Level</p>
            </div>
            <div className="progress-section">
                <div className="progress-info">
                <span>Experience: {userStats.experience} / {userStats.maxExperience}</span>
                </div>
                <div className="progress-bar">
                <div 
                    className="progress-fill"
                    style={{ width: `${experiencePercentage}%` }}
                ></div>
                </div>
            </div>
            </Card>

            {/* FLT Balance */}
            <Card className="stat-card flt-balance">
            <div className="stat-header">
                <h3 className="stat-title">{walletInfo.fltBalance}</h3>
                <p className="stat-subtitle">FLT Balance</p>
            </div>
            <div className="currency-symbol">FLT</div>
            </Card>

            {/* NFT Collection */}
            <Card className="stat-card nft-collection">
            <div className="stat-header">
                <h3 className="stat-title">{walletInfo.nftCount}</h3>
                <p className="stat-subtitle">NFTs</p>
            </div>
            <div className="nft-icon">🎨</div>
            </Card>

            {/* Shows Attended */}
            <Card className="stat-card shows-attended">
            <div className="stat-header">
                <h3 className="stat-title">{userStats.showsAttended}</h3>
                <p className="stat-subtitle">Shows Attended</p>
            </div>
            <div className="show-icon">🎵</div>
            </Card>

            {/* Milestone Progress */}
            <Card className="stat-card milestone-progress">
            <div className="stat-header">
                <h3 className="stat-title">{userStats.milestoneProgress}/100</h3>
                <p className="stat-subtitle">Milestone Progress</p>
            </div>
            <div className="progress-section">
                <div className="progress-bar">
                <div 
                    className="progress-fill milestone"
                    style={{ width: `${milestonePercentage}%` }}
                ></div>
                </div>
            </div>
            </Card>
        </div>

        {/* Warning Status */}
        <Card className="warning-status">
            <h2>Warning Status</h2>
            <div className="warning-current">
            <div className="warning-indicator no-warning">
                <div className="warning-icon">✓</div>
                <div className="warning-content">
                <h3>No Warning</h3>
                <p>You are a user who abides by the rules!</p>
                </div>
            </div>
            </div>

            <div className="warning-levels">
            <div className="warning-level yellow">
                <div className="warning-dot"></div>
                <div className="warning-info">
                <h4>Yellow Warning</h4>
                <p>Automatically issued by the system, requiring additional verification</p>
                </div>
            </div>

            <div className="warning-level orange">
                <div className="warning-dot"></div>
                <div className="warning-info">
                <h4>Orange Warning</h4>
                <p>Community Report + Preliminary Evidence, Limit the Number of Tickets Purchased</p>
                </div>
            </div>

            <div className="warning-level red">
                <div className="warning-dot"></div>
                <div className="warning-info">
                <h4>Red Warning</h4>
                <p>Confirmed scalper behavior, added to blacklist</p>
                </div>
            </div>
            </div>
        </Card>
        </div>
    );
};

export default Dashboard;