import { AlertTriangle, Loader, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import Card from '../components/ui/Card.js';
import { useWallet } from '../hooks/useWallet.js';
import '../styles/pages/MyNFTs.css';
import { getUserTickets } from '../utils/web3Utils.js';

const MyNFTs = () => {
    const { isConnected, walletInfo } = useWallet();
    const [userNFTs, setUserNFTs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // 載入用戶 NFT（實際上是票券 NFT）
    const loadUserNFTs = useCallback(async () => {
        if (!isConnected || !walletInfo?.address) {
            setUserNFTs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 從區塊鏈獲取用戶的票券 NFT
            const tickets = await getUserTickets(walletInfo.address);
            
            // 將票券轉換為 NFT 格式
            const nfts = tickets.map(ticket => ({
                id: ticket.id,
                name: `${ticket.event} - ${ticket.type}`,
                artist: ticket.artist,
                event: ticket.event,
                image: ticket.image || '/api/placeholder/300/200',
                rarity: ticket.isUsed ? 'Used' : 'Valid',
                category: ticket.type.toLowerCase(),
                date: ticket.date,
                venue: ticket.venue,
                seatNumber: ticket.seatNumber,
                seatSection: ticket.seatSection,
                price: ticket.price,
                isUsed: ticket.isUsed,
                transferCount: ticket.transferCount,
                resellable: ticket.resellable,
                status: ticket.status
            }));

            setUserNFTs(nfts);
        } catch (error) {
            console.error('Error loading NFTs from blockchain:', error);
            setError('Failed to load NFTs from blockchain');
            setUserNFTs([]);
        } finally {
            setLoading(false);
        }
    }, [isConnected, walletInfo?.address]);

    useEffect(() => {
        loadUserNFTs();
    }, [loadUserNFTs]);

    // 獲取指定分類的 NFT
    const getNFTsByCategory = (categoryId) => {
        if (categoryId === 'all') {
            return userNFTs;
        }
        return userNFTs.filter(nft => nft.category === categoryId);
    };

    // 獲取指定分類的 NFT 數量
    const getNFTCountByCategory = (categoryId) => {
        return getNFTsByCategory(categoryId).length;
    };

    // 搜索和篩選 NFT
    const filteredNFTs = getNFTsByCategory(selectedCategory).filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.event.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 分類配置
    const categories = [
        { id: 'all', name: 'All NFTs', count: userNFTs.length },
        { id: 'general', name: 'General', count: getNFTCountByCategory('general') },
        { id: 'premium', name: 'Premium', count: getNFTCountByCategory('premium') },
        { id: 'vip', name: 'VIP', count: getNFTCountByCategory('vip') }
    ];

    // 稀有度顏色
    const getRarityColor = (rarity) => {
        switch (rarity.toLowerCase()) {
            case 'valid': return '#10B981';
            case 'used': return '#6B7280';
            default: return '#8B5CF6';
        }
    };

    return (
        <div className="mynfts-page">
            <div className="page-header">
                <h1>My NFTs</h1>
                <p className="nfts-subtitle">
                    {categories.find(cat => cat.id === selectedCategory)?.name} • {filteredNFTs.length} NFTs
                </p>
            </div>

            {!isConnected ? (
                <div className="not-connected">
                    <AlertTriangle className="not-connected-icon" />
                    <h3>Connect your wallet</h3>
                    <p>Please connect your wallet to view your NFT collection</p>
                </div>
            ) : (
                <>
                    {/* Search Bar */}
                    <div className="search-section">
                        <div className="search-bar">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search NFTs by name, artist, or event..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                                <span className="category-count">({category.count})</span>
                            </button>
                        ))}
                    </div>

                    {/* Category Info */}
                    <div className="category-info">
                        <div className="category-header">
                            <span className="category-icon">
                                {categories.find(cat => cat.id === selectedCategory)?.name.charAt(0)}
                            </span>
                            <div className="category-details">
                                <h2>{categories.find(cat => cat.id === selectedCategory)?.name}</h2>
                                <p>
                                    {selectedCategory === 'all' && 'All your concert ticket NFTs'}
                                    {selectedCategory === 'general' && 'General admission ticket NFTs'}
                                    {selectedCategory === 'premium' && 'Premium ticket NFTs'}
                                    {selectedCategory === 'vip' && 'VIP ticket NFTs'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="loading-state">
                            <Loader className="loading-icon spinning" />
                            <p>Loading your NFTs from blockchain...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="error-state">
                            <AlertTriangle className="error-icon" />
                            <h3>Error loading NFTs</h3>
                            <p>{error}</p>
                            <button onClick={loadUserNFTs} className="retry-button">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* NFT Collection */}
                    {!loading && !error && (
                        <div className="nft-collection">
                            {filteredNFTs.length > 0 ? (
                                <div className="nft-badges-grid">
                                    {filteredNFTs.map((nft) => (
                                        <NFTBadge 
                                            key={nft.id} 
                                            nft={nft} 
                                            selectedCategory={selectedCategory}
                                            getRarityColor={getRarityColor}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🎨</div>
                                    <h3>No NFTs in this category</h3>
                                    <p>
                                        You haven't earned any NFTs in the {categories.find(cat => cat.id === selectedCategory)?.name} category yet.
                                        {selectedCategory === 'all' && ' Purchase concert tickets to start collecting NFTs!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// NFT Badge Component
const NFTBadge = ({ nft, selectedCategory, getRarityColor }) => {
    const rarityColor = getRarityColor(nft.rarity);

    return (
        <Card className="nft-badge" hoverable>
            <div className="nft-badge-inner">
                <div 
                    className="nft-badge-icon"
                    style={{ borderColor: rarityColor }}
                >
                    <span className="nft-icon">{nft.name.split(' - ')[0]}</span>
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

// NFT Detail Modal Component (未使用，可以在將來需要時啟用)
// const NFTModal = ({ nft, onClose, getRarityColor }) => {
//     const rarityColor = getRarityColor(nft.rarity);

//     return (
//         <div className="nft-modal-overlay" onClick={onClose}>
//             <div className="nft-modal" onClick={(e) => e.stopPropagation()}>
//                 <div className="nft-modal-header">
//                     <h2>{nft.name}</h2>
//                     <button className="close-button" onClick={onClose}>
//                         ×
//                     </button>
//                 </div>
                
//                 <div className="nft-modal-content">
//                     <div className="nft-modal-icon">
//                         <span className="modal-nft-icon">🎨</span>
//                     </div>
                    
//                     <div className="nft-modal-details">
//                         <div className="detail-row">
//                             <span className="detail-label">Rarity:</span>
//                             <span 
//                                 className="detail-value rarity-value"
//                                 style={{ color: rarityColor }}
//                             >
//                                 {nft.rarity}
//                             </span>
//                         </div>
                        
//                         <div className="detail-row">
//                             <span className="detail-label">Date:</span>
//                             <span className="detail-value">{nft.date}</span>
//                         </div>
                        
//                         {nft.artist && (
//                             <div className="detail-row">
//                                 <span className="detail-label">Artist:</span>
//                                 <span className="detail-value">{nft.artist}</span>
//                             </div>
//                         )}
                        
//                         {nft.event && (
//                             <div className="detail-row">
//                                 <span className="detail-label">Event:</span>
//                                 <span className="detail-value">{nft.event}</span>
//                             </div>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className="nft-modal-actions">
//                     <button className="modal-action-button view-button">
//                         <Eye size={16} />
//                         View Details
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

export default MyNFTs;