import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet.js';
import Card from '../components/ui/Card.js';
import { Eye, Award, Star, Trophy, Target } from 'lucide-react';
import { mockNFTs } from '../data/mockNFTs.js';
import '../styles/pages/MyNFTs.css';

const MyNFTs = ({ nftsCategory = 'participation', setNftsCategory }) => {
    const { isConnected } = useWallet();
    const [selectedNFT, setSelectedNFT] = useState(null);

    // 使用傳入的 nftsCategory 作為當前分類
    const selectedCategory = nftsCategory;

    const categories = [
        { id: 'participation', label: 'Participation Badge', icon: Award },
        { id: 'level', label: 'Level Badge', icon: Star },
        { id: 'annual', label: 'Annual Souvenir', icon: Trophy },
        { id: 'milestone', label: 'Milestone Reward', icon: Target }
    ];

    // 獲取當前分類的 NFT
    const getCurrentNFTs = () => {
        return mockNFTs[selectedCategory] || [];
    };

    // 獲取分類數量
    const getCategoryCount = (categoryId) => {
        return mockNFTs[categoryId]?.length || 0;
    };

    // 獲取稀有度顏色
    const getRarityColor = (rarity) => {
        const colors = {
        Common: '#9CA3AF',
        Rare: '#3B82F6', 
        Epic: '#8B5CF6',
        Legendary: '#F59E0B'
        };
        return colors[rarity] || colors.Common;
    };

    // 獲取NFT圖標
    const getNFTIcon = (categoryId) => {
        const icons = {
        participation: '🎫',
        level: '⭐',
        annual: '🏆',
        milestone: '🎯'
        };
        return icons[categoryId] || '🎨';
    };

    if (!isConnected) {
        return (
        <div className="my-nfts">
            <div className="nfts-header">
            <h1>My NFTs</h1>
            </div>
            <div className="connect-wallet-prompt">
            <h2>Connect your wallet to view your NFT collection</h2>
            <p>Please connect your wallet to access your NFT collection.</p>
            </div>
        </div>
        );
    }

    const currentNFTs = getCurrentNFTs();
    const currentCategory = categories.find(cat => cat.id === selectedCategory);

    return (
        <div className="my-nfts">
        <div className="nfts-header">
            <h1>My NFTs</h1>
            <p className="nfts-subtitle">
            {currentCategory?.label} • {currentNFTs.length} NFTs
            </p>
        </div>

        {/* Category Info */}
        <div className="category-info">
            <div className="category-header">
            <span className="category-icon">{getNFTIcon(selectedCategory)}</span>
            <div className="category-details">
                <h2>{currentCategory?.label}</h2>
                <p>
                {selectedCategory === 'participation' && 'NFTs earned by participating in concerts and events'}
                {selectedCategory === 'level' && 'NFTs representing your fan level achievements'}
                {selectedCategory === 'annual' && 'Special NFTs commemorating each year'}
                {selectedCategory === 'milestone' && 'NFTs for reaching significant milestones'}
                </p>
            </div>
            </div>
        </div>

        {/* NFT Collection */}
        <div className="nft-collection">
            {currentNFTs.length > 0 ? (
            <div className="nft-badges-grid">
                {currentNFTs.map((nft) => (
                <NFTBadge 
                    key={nft.id} 
                    nft={nft} 
                    selectedCategory={selectedCategory}
                    onClick={() => setSelectedNFT(nft)}
                    getRarityColor={getRarityColor}
                    getNFTIcon={getNFTIcon}
                />
                ))}
            </div>
            ) : (
            <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No NFTs in this category</h3>
                <p>
                You haven't earned any NFTs in the {currentCategory?.label} category yet.
                </p>
            </div>
            )}
        </div>

        {/* NFT Detail Modal */}
        {selectedNFT && (
            <NFTModal 
            nft={selectedNFT} 
            onClose={() => setSelectedNFT(null)}
            getRarityColor={getRarityColor}
            />
        )}
        </div>
    );
    };

    // NFT Badge Component
    const NFTBadge = ({ nft, selectedCategory, onClick, getRarityColor, getNFTIcon }) => {
    const rarityColor = getRarityColor(nft.rarity);
    const icon = getNFTIcon(selectedCategory);

    return (
        <Card className="nft-badge" onClick={onClick} hoverable>
        <div className="nft-badge-inner">
            <div 
            className="nft-badge-icon"
            style={{ borderColor: rarityColor }}
            >
            <span className="nft-icon">{icon}</span>
            <div 
                className="rarity-ring"
                style={{ borderColor: rarityColor }}
            ></div>
            </div>
            
            <div className="nft-badge-content">
            <h3 className="nft-badge-title">{nft.name}</h3>
            
            <div className="nft-badge-details">
                {nft.artist && (
                <p className="nft-badge-artist">{nft.artist}</p>
                )}
                {nft.event && (
                <p className="nft-badge-event">{nft.event}</p>
                )}
                {nft.level && (
                <p className="nft-badge-level">{nft.level} Level</p>
                )}
                {nft.year && (
                <p className="nft-badge-year">{nft.year} Collection</p>
                )}
                {nft.milestone && (
                <p className="nft-badge-milestone">{nft.milestone}</p>
                )}
            </div>
            
            <div className="nft-badge-meta">
                <span 
                className="nft-rarity"
                style={{ color: rarityColor }}
                >
                {nft.rarity}
                </span>
                <span className="nft-date">{nft.date}</span>
            </div>
            </div>
        </div>
        </Card>
    );
    };

    // NFT Detail Modal Component
    const NFTModal = ({ nft, onClose, getRarityColor }) => {
    const rarityColor = getRarityColor(nft.rarity);

    return (
        <div className="nft-modal-overlay" onClick={onClose}>
        <div className="nft-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nft-modal-header">
            <h2>{nft.name}</h2>
            <button className="close-button" onClick={onClose}>
                ×
            </button>
            </div>
            
            <div className="nft-modal-content">
            <div className="nft-modal-icon">
                <span className="modal-nft-icon">🎨</span>
            </div>
            
            <div className="nft-modal-details">
                <div className="detail-row">
                <span className="detail-label">Rarity:</span>
                <span 
                    className="detail-value rarity-value"
                    style={{ color: rarityColor }}
                >
                    {nft.rarity}
                </span>
                </div>
                
                <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{nft.date}</span>
                </div>
                
                {nft.artist && (
                <div className="detail-row">
                    <span className="detail-label">Artist:</span>
                    <span className="detail-value">{nft.artist}</span>
                </div>
                )}
                
                {nft.event && (
                <div className="detail-row">
                    <span className="detail-label">Event:</span>
                    <span className="detail-value">{nft.event}</span>
                </div>
                )}
                
                {nft.level && (
                <div className="detail-row">
                    <span className="detail-label">Level:</span>
                    <span className="detail-value">{nft.level}</span>
                </div>
                )}
                
                {nft.year && (
                <div className="detail-row">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{nft.year}</span>
                </div>
                )}
                
                {nft.milestone && (
                <div className="detail-row">
                    <span className="detail-label">Milestone:</span>
                    <span className="detail-value">{nft.milestone}</span>
                </div>
                )}
            </div>
            </div>
            
            <div className="nft-modal-actions">
            <button className="modal-action-button view-button">
                <Eye size={16} />
                View Details
            </button>
            </div>
        </div>
        </div>
    );
};

export default MyNFTs;