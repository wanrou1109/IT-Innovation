import React from 'react';
import { useWallet } from '../hooks/useWallet.js';
import Card from '../components/ui/Card.js';
import '../styles/pages/Dashboard.css';

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