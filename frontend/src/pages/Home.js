import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';
import { X, Loader, CheckCircle, AlertTriangle, Flag, ExternalLink } from 'lucide-react';
import '../styles/pages/Home.css';

const initialEvents = {
    upcoming: [
        {
        id: 1,
        title: 'ENHYPEN 2025 World Tour',
        artist: 'ENHYPEN',
        venue: 'Seoul Olympic Stadium, Seoul',
        date: '2025-08-15',
        time: '19:00',
        image: '/api/placeholder/400/250',
        price: { flt: 60, usd: 80 },
        ticketTypes: [
            { 
            type: 'VIP', 
            price: 120, 
            available: 50, 
            benefits: ['Meet & Greet', 'Premium Seating', 'Exclusive Merchandise', 'Early Entry'] 
            },
            { 
            type: 'Premium', 
            price: 80, 
            available: 200, 
            benefits: ['Great Seating', 'Priority Entry', 'Digital Program'] 
            },
            { 
            type: 'General', 
            price: 60, 
            available: 500, 
            benefits: ['Standard Seating', 'Digital Program'] 
            }
        ],
        status: 'on_sale',
        description: 'Experience the electrifying performance of ENHYPEN in their world tour.',
        category: 'concert',
        isPrimary: true,
        totalTickets: 750,
        soldTickets: 0
        },
        {
        id: 2,
        title: 'TWICE 2025 World Tour',
        artist: 'TWICE',
        venue: 'Tokyo Dome, Tokyo',
        date: '2025-08-20',
        time: '18:30',
        image: '/api/placeholder/400/250',
        price: { flt: 80, usd: 105 },
        ticketTypes: [
            { 
            type: 'VIP', 
            price: 150, 
            available: 30, 
            benefits: ['Orchestra Level', 'Champagne Reception', 'Signed Program'] 
            },
            { 
            type: 'Premium', 
            price: 100, 
            available: 150, 
            benefits: ['Mezzanine Seating', 'Intermission Refreshments'] 
            },
            { 
            type: 'General', 
            price: 80, 
            available: 300, 
            benefits: ['Balcony Seating', 'Digital Program'] 
            }
        ],
        status: 'on_sale',
        description: 'A magical evening with TWICE!',
        category: 'concert',
        isPrimary: true,
        totalTickets: 480,
        soldTickets: 0
        },
        {
        id: 3,
        title: 'BOYNEXTDOOR 2025 World Tour',
        artist: 'BOYNEXTDOOR',
        venue: 'Staples Center, Los Angeles',
        date: '2025-08-25',
        time: '20:00',
        image: '/api/placeholder/400/250',
        price: { flt: 75, usd: 95 },
        ticketTypes: [
            { 
            type: 'VIP', 
            price: 140, 
            available: 20, 
            benefits: ['Front Row Access', 'Artist Meet & Greet', 'Exclusive Merchandise'] 
            },
            { 
            type: 'Premium', 
            price: 90, 
            available: 100, 
            benefits: ['Premium Seating', 'Fast Track Entry'] 
            },
            { 
            type: 'General', 
            price: 75, 
            available: 200, 
            benefits: ['General Admission', 'Standing Area'] 
            }
        ],
        status: 'on_sale',
        description: 'Join BND for an unforgettable night of music.',
        category: 'concert',
        isPrimary: false,
        totalTickets: 320,
        soldTickets: 0
        }
    ],
    past: []
};

const Home = ({ homeMarketType = 'primary', setCurrentPage, setReportTarget }) => {
    const { purchaseTicket, walletInfo, isConnected } = useWallet();
    const [events, setEvents] = useState(initialEvents);
    const [resaleTickets, setResaleTickets] = useState([]);
    const [purchaseModal, setPurchaseModal] = useState({ show: false, event: null });
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState(null);

    // 載入轉售票券
    useEffect(() => {
        if (homeMarketType === 'secondary') {
        loadResaleTickets();
        }
    }, [homeMarketType]);

    const loadResaleTickets = () => {
        try {
        const savedResaleTickets = JSON.parse(localStorage.getItem('resaleTickets') || '[]');
        // 添加賣家信息到每個轉售票券
        const ticketsWithSellerInfo = savedResaleTickets.map(ticket => ({
            ...ticket,
            seller: ticket.seller || generateSellerInfo(ticket.resaleId)
        }));
        const availableTickets = ticketsWithSellerInfo.filter(ticket => ticket.isAvailable);
        setResaleTickets(availableTickets);
        } catch (error) {
        console.error('Error loading resale tickets:', error);
        setResaleTickets([]);
        }
    };

    // 生成賣家信息（模擬數據）
    const generateSellerInfo = (resaleId) => {
        const sellerNames = ['KpopFan2024', 'ConcertCollector', 'TicketTrader88', 'SeoulMusicLover', 'TokyoConcertGoer'];
        const addresses = [
        '0x742d35Cc6C907C38d39F65d46F8B1234567890Ab',
        '0x1a2b3c4d5e6f7890123456789abcdef01234567',
        '0x9876543210987654321098765432109876543210',
        '0xabcdef1234567890abcdef1234567890abcdef12',
        '0x5566778899aabbccddeeff1122334455667788aa'
        ];
        const verificationLevels = ['Gold', 'Silver', 'Bronze'];
        
        const index = parseInt(resaleId) % sellerNames.length;
        
        return {
        name: sellerNames[index],
        address: addresses[index],
        verificationLevel: verificationLevels[index % 3],
        salesCount: Math.floor(Math.random() * 25) + 1,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 - 5.0
        joinDate: '2023-06-15',
        successRate: Math.floor(Math.random() * 20) + 80 // 80-100%
        };
    };

    // 處理 Report 按鈕點擊
    const handleReportSeller = (seller, eventTitle, ticketInfo) => {
        if (!setReportTarget || !setCurrentPage) {
        console.warn('Report functionality not available - missing required props');
        return;
        }

        // 設置預填的 report 資料
        setReportTarget({
        accountName: seller.name,
        accountAddress: seller.address,
        reportType: 'scalping',
        subject: `Suspicious pricing for ${eventTitle} - ${ticketInfo.type} ticket`,
        detail: `Seller ${seller.name} is selling ${ticketInfo.type} tickets for ${eventTitle} at ${ticketInfo.resalePrice} FLT (original price: ${ticketInfo.originalPrice} FLT). This represents a ${(((ticketInfo.resalePrice - ticketInfo.originalPrice) / ticketInfo.originalPrice) * 100).toFixed(1)}% markup.`,
        context: 'Reported from secondary market listing'
        });
        
        // 跳轉到 report 頁面的 submit tab
        setCurrentPage('report');
    };

    // 格式化地址顯示
    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // 獲取驗證等級顏色
    const getVerificationColor = (level) => {
        switch (level) {
        case 'Gold': return '#FFD700';
        case 'Silver': return '#C0C0C0';
        case 'Bronze': return '#CD7F32';
        default: return '#6B7280';
        }
    };

    // 篩選活動
    const filteredEvents = homeMarketType === 'primary' 
        ? events.upcoming.filter(event => event.isPrimary)
        : resaleTickets; // 對於 secondary market，顯示轉售票券

    // 處理購票點擊
    const handlePurchaseClick = (item) => {
        if (!isConnected) {
        alert('Please connect your wallet first');
        return;
        }
        
        // 如果是轉售票券，轉換格式以適配現有的購票流程
        if (homeMarketType === 'secondary' && item.resaleId) {
        const convertedEvent = {
            id: item.id,
            title: item.event,
            artist: item.artist,
            venue: item.venue,
            date: item.date,
            time: item.time,
            image: item.image,
            price: { flt: item.resalePrice },
            ticketTypes: [{
            type: item.type,
            price: item.resalePrice,
            available: 1
            }],
            isResale: true,
            originalTicket: item
        };
        setPurchaseModal({ show: true, event: convertedEvent });
        } else {
        setPurchaseModal({ show: true, event: item });
        }
        setPurchaseResult(null);
    };

    // 確認購票
    const handleConfirmPurchase = async (ticketType, price) => {
        setPurchasing(true);
        setPurchaseResult(null);
        
        try {
        const result = await purchaseTicket(purchaseModal.event.id, ticketType, price);
        
        if (result.success) {
            // 添加票券到 localStorage
            const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
            const newTicket = {
            id: result.ticketId,
            event: purchaseModal.event.title,
            artist: purchaseModal.event.artist,
            venue: purchaseModal.event.venue,
            date: purchaseModal.event.date,
            time: purchaseModal.event.time,
            type: ticketType,
            price: price,
            qrCode: `QR${result.ticketId}`,
            image: purchaseModal.event.image,
            resellable: true,
            purchaseTime: new Date().toISOString(),
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed,
            status: 'confirmed'
            };
            
            existingTickets.push(newTicket);
            localStorage.setItem('userTickets', JSON.stringify(existingTickets));

            // 如果是轉售票券，從轉售列表中移除
            if (purchaseModal.event.isResale) {
            const updatedResaleTickets = JSON.parse(localStorage.getItem('resaleTickets') || '[]');
            const filteredTickets = updatedResaleTickets.map(ticket => 
                ticket.resaleId === purchaseModal.event.originalTicket.resaleId 
                ? { ...ticket, isAvailable: false, soldTo: walletInfo.address, soldDate: new Date().toISOString() }
                : ticket
            );
            localStorage.setItem('resaleTickets', JSON.stringify(filteredTickets));
            loadResaleTickets(); // 重新載入轉售票券列表
            } else {
            // 更新活動的售出票數
            setEvents(prev => ({
                ...prev,
                upcoming: prev.upcoming.map(event => 
                event.id === purchaseModal.event.id 
                    ? { 
                        ...event, 
                        soldTickets: event.soldTickets + 1,
                        ticketTypes: event.ticketTypes.map(t => 
                        t.type === ticketType 
                            ? { ...t, available: t.available - 1 }
                            : t
                        )
                    }
                    : event
                )
            }));
            }
            
            setPurchaseResult({
            success: true,
            message: `Successfully purchased ${ticketType} ticket for ${price} FLT!`,
            ticketId: result.ticketId,
            transactionHash: result.transactionHash
            });
            
            // 3秒後自動關閉模態框
            setTimeout(() => {
            setPurchaseModal({ show: false, event: null });
            setPurchaseResult(null);
            }, 3000);
        }
        } catch (error) {
        setPurchaseResult({
            success: false,
            message: `Purchase failed: ${error.message}`,
            error: error.message
        });
        } finally {
        setPurchasing(false);
        }
    };

    return (
        <div className="home">
        {/* Hero Section */}
        <section className="hero-section">
            <div className="hero-content">
            <h1>
                {homeMarketType === 'primary' ? 'Official Primary Sales' : 'Fan-to-Fan Secondary Market'}
            </h1>
            <p>
                {homeMarketType === 'primary' 
                ? 'Buy tickets directly from official sources at face value with guaranteed authenticity'
                : 'Buy and sell tickets from other fans in a secure, verified marketplace'
                }
            </p>
            </div>
        </section>

        {/* Events Section */}
        <section className="events-section" data-market-type={homeMarketType}>
            <h2>
            {homeMarketType === 'primary' ? 'Available Official Sales' : 'Fan Marketplace Listings'}
            </h2>
            
            {filteredEvents.length > 0 ? (
            <div className="events-grid">
                {filteredEvents.map((item) => (
                homeMarketType === 'primary' ? (
                    <EventCard 
                    key={item.id} 
                    event={item} 
                    marketType={homeMarketType}
                    onPurchaseClick={handlePurchaseClick}
                    />
                ) : (
                    <ResaleTicketCard
                    key={item.resaleId}
                    ticket={item}
                    onPurchaseClick={handlePurchaseClick}
                    onReportSeller={handleReportSeller}
                    formatAddress={formatAddress}
                    getVerificationColor={getVerificationColor}
                    />
                )
                ))}
            </div>
            ) : (
            <div className="empty-state">
                <div className="empty-icon">🎫</div>
                <h3>No events available</h3>
                <p>
                {homeMarketType === 'primary' 
                    ? 'No official sales are currently available. Check back soon for new releases!' 
                    : 'No fan-to-fan tickets are currently available in the marketplace.'
                }
                </p>
            </div>
            )}
        </section>

        {/* Purchase Modal */}
        {purchaseModal.show && (
            <PurchaseModal 
            event={purchaseModal.event}
            onClose={() => {
                setPurchaseModal({ show: false, event: null });
                setPurchaseResult(null);
            }}
            onConfirm={handleConfirmPurchase}
            purchasing={purchasing}
            userBalance={walletInfo.fltBalance}
            purchaseResult={purchaseResult}
            />
        )}
        </div>
    );
    };

    // Event Card Component (unchanged)
    const EventCard = ({ event, marketType, onPurchaseClick }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <Card className="event-card" hoverable>
        <div className="event-image-container">
            {!imageError ? (
            <img
                src={event.image}
                alt={event.title}
                className="event-image"
                onError={() => setImageError(true)}
            />
            ) : (
            <div className="event-placeholder">
                <div className="placeholder-icon">🎵</div>
            </div>
            )}
            
            <div className={`market-badge ${marketType}`}>
            {marketType === 'primary' ? 'Official' : 'Resale'}
            </div>
        </div>
        
        <div className="event-info">
            <h3 className="event-title">{event.title}</h3>
            <p className="event-artist">{event.artist}</p>
            <p className="event-venue">{event.venue}</p>
            <div className="event-details">
            <span className="event-date">{event.date} • {event.time}</span>
            <span className="event-tickets">
                {event.totalTickets - event.soldTickets} tickets available
            </span>
            </div>
            <div className="event-footer">
            <div className="price-info">
                <span className="price-from">From {event.price.flt} FLT</span>
                <span className="price-usd">(${event.price.usd})</span>
            </div>
            <Button 
                variant="primary" 
                size="small"
                onClick={() => onPurchaseClick(event)}
            >
                {marketType === 'primary' ? 'Buy Now' : 'View Offers'}
            </Button>
            </div>
        </div>
        </Card>
    );
    };

    // Enhanced Resale Ticket Card Component with Seller Info
    const ResaleTicketCard = ({ ticket, onPurchaseClick, onReportSeller, formatAddress, getVerificationColor }) => {
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    };

    const calculateDiscount = () => {
        const discount = ((ticket.originalPrice - ticket.resalePrice) / ticket.originalPrice) * 100;
        return discount;
    };

    const discount = calculateDiscount();
    const isPriceIncreased = ticket.resalePrice > ticket.originalPrice;

    return (
        <Card className="event-card resale-ticket-card" hoverable>
        <div className="event-image-container">
            {!imageError ? (
            <img
                src={ticket.image}
                alt={ticket.event}
                className="event-image"
                onError={() => setImageError(true)}
            />
            ) : (
            <div className="event-placeholder">
                <div className="placeholder-icon">🎵</div>
            </div>
            )}
            
            <div className="market-badge secondary">Resale</div>
            
            {discount > 0 && (
            <div className="discount-badge">
                {discount.toFixed(0)}% OFF
            </div>
            )}
            
            {isPriceIncreased && (
            <div className="price-increase-badge">
                +{Math.abs(discount).toFixed(0)}%
            </div>
            )}
            
            <div className="ticket-type-badge">
            {ticket.type}
            </div>
        </div>
        
        <div className="event-info">
            <h3 className="event-title">{ticket.event}</h3>
            <p className="event-artist">{ticket.artist}</p>
            <p className="event-venue">{ticket.venue}</p>
            
            <div className="event-details">
            <span className="event-date">{formatDate(ticket.date)} • {ticket.time}</span>
            </div>

            {/* Seller Information */}
            {ticket.seller && (
            <div className="seller-info">
                <div className="seller-header">
                <h4>Seller Information</h4>
                </div>
                
                <div className="seller-details">
                <div className="seller-name-verification">
                    <span className="seller-name">{ticket.seller.name}</span>
                    <span 
                    className="verification-badge"
                    style={{ color: getVerificationColor(ticket.seller.verificationLevel) }}
                    >
                    {ticket.seller.verificationLevel}
                    </span>
                </div>
                
                <div className="seller-address">
                    <span className="address-label">Address:</span>
                    <span className="address-value">
                    {formatAddress(ticket.seller.address)}
                    </span>
                    <button 
                    className="address-link"
                    onClick={() => window.open(`https://etherscan.io/address/${ticket.seller.address}`, '_blank')}
                    title="View on Etherscan"
                    >
                    <ExternalLink size={12} />
                    </button>
                </div>
                
                <div className="seller-stats">
                    <span className="stat">
                    {ticket.seller.salesCount} sales
                    </span>
                    <span className="stat">
                    ⭐ {ticket.seller.rating}
                    </span>
                    <span className="stat">
                    {ticket.seller.successRate}% success
                    </span>
                </div>
                </div>

                <div className="seller-actions">
                <Button
                    variant="outline"
                    size="small"
                    icon={<Flag size={14} />}
                    onClick={() => onReportSeller(ticket.seller, ticket.event, {
                    type: ticket.type,
                    resalePrice: ticket.resalePrice,
                    originalPrice: ticket.originalPrice
                    })}
                    className="report-button"
                >
                    Report
                </Button>
                </div>
            </div>
            )}

            <div className="resale-info">
            <div className="price-comparison">
                <div className="original-price">
                Original: {ticket.originalPrice} FLT
                </div>
                <div className="resale-price">
                Resale: {ticket.resalePrice} FLT
                </div>
            </div>
            
            {ticket.resaleReason && (
                <div className="resale-reason">
                <small>"{ticket.resaleReason}"</small>
                </div>
            )}
            </div>
            
            <div className="event-footer">
            <div className="price-info">
                <span className="price-from">{ticket.resalePrice} FLT</span>
                <span className="price-comparison-text">
                {discount > 0 ? `${discount.toFixed(0)}% below original` : 
                discount < 0 ? `${Math.abs(discount).toFixed(0)}% above original` : 
                'Same as original'}
                </span>
            </div>
            <Button 
                variant="primary" 
                size="small"
                onClick={() => onPurchaseClick(ticket)}
            >
                Buy Resale Ticket
            </Button>
            </div>
        </div>
        </Card>
    );
    };

    // Purchase Modal Component (unchanged)
    const PurchaseModal = ({ event, onClose, onConfirm, purchasing, userBalance, purchaseResult }) => {
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        // 自動選擇第一個可用的票券類型
        if (event.ticketTypes && event.ticketTypes.length > 0) {
        const availableTicket = event.ticketTypes.find(t => t.available > 0);
        if (availableTicket) {
            setSelectedTicket(availableTicket);
        }
        }
    }, [event]);

    const handleConfirm = () => {
        const ticket = selectedTicket || { type: 'General', price: event.price.flt };
        onConfirm(ticket.type, ticket.price);
    };

    return (
        <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
            <h2>Purchase Ticket</h2>
            <button onClick={onClose} className="close-button">
                <X size={24} />
            </button>
            </div>

            {/* Event Info */}
            <div className="event-summary">
            <h3>{event.title}</h3>
            <p className="event-details">{event.artist}</p>
            <p className="event-details">{event.venue} • {event.date} • {event.time}</p>
            </div>

            {/* Balance Info */}
            <div className="balance-info">
            <p>Your FLT Balance: <strong>{userBalance.toLocaleString()} FLT</strong></p>
            </div>

            {/* Purchase Result */}
            {purchaseResult && (
            <div className={`purchase-result ${purchaseResult.success ? 'success' : 'error'}`}>
                <div className="result-icon">
                {purchaseResult.success ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div className="result-content">
                <p className="result-message">{purchaseResult.message}</p>
                {purchaseResult.success && purchaseResult.transactionHash && (
                    <p className="transaction-hash">
                    Transaction: {purchaseResult.transactionHash.slice(0, 10)}...
                    </p>
                )}
                </div>
            </div>
            )}

            {/* Ticket Selection */}
            {!purchaseResult && (
            <>
                <div className="ticket-selection">
                <h4>Select Ticket Type:</h4>
                {event.ticketTypes?.map((ticket, index) => (
                    <div 
                    key={index}
                    onClick={() => ticket.available > 0 && setSelectedTicket(ticket)}
                    className={`ticket-option ${selectedTicket?.type === ticket.type ? 'selected' : ''} ${ticket.available === 0 ? 'sold-out' : ''}`}
                    >
                    <div className="ticket-info">
                        <div className="ticket-type">
                        <strong>{ticket.type}</strong>
                        <p className="ticket-benefits">
                            {ticket.benefits?.slice(0, 2).join(' • ')}
                            {ticket.benefits?.length > 2 && '...'}
                        </p>
                        </div>
                        <div className="ticket-availability">
                        <span className={`availability ${ticket.available === 0 ? 'sold-out' : ''}`}>
                            {ticket.available === 0 ? 'Sold Out' : `${ticket.available} available`}
                        </span>
                        </div>
                    </div>
                    <div className="ticket-price">
                        <div className="price">{ticket.price} FLT</div>
                        {userBalance < ticket.price && ticket.available > 0 && (
                        <div className="insufficient-balance">Insufficient balance</div>
                        )}
                    </div>
                    </div>
                )) || (
                    <div className="ticket-option selected">
                    <div className="ticket-info">
                        <strong>General</strong>
                    </div>
                    <div className="ticket-price">
                        <div className="price">{event.price.flt} FLT</div>
                    </div>
                    </div>
                )}
                </div>

                {/* Selected Ticket Summary */}
                {selectedTicket && (
                <div className="purchase-summary">
                    <h4>Purchase Summary</h4>
                    <div className="summary-item">
                    <span>Ticket Type:</span>
                    <span>{selectedTicket.type}</span>
                    </div>
                    <div className="summary-item">
                    <span>Price:</span>
                    <span>{selectedTicket.price} FLT</span>
                    </div>
                    <div className="summary-item total">
                    <span>Total:</span>
                    <span>{selectedTicket.price} FLT</span>
                    </div>
                </div>
                )}
            </>
            )}

            {/* Action Buttons */}
            <div className="modal-actions">
            <Button
                variant="secondary"
                onClick={onClose}
                disabled={purchasing}
            >
                {purchaseResult?.success ? 'Close' : 'Cancel'}
            </Button>
            
            {!purchaseResult && (
                <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={
                    purchasing || 
                    !selectedTicket || 
                    userBalance < (selectedTicket?.price || event.price.flt) ||
                    (selectedTicket?.available === 0)
                }
                >
                {purchasing && <Loader size={16} className="spinner" />}
                {purchasing ? 'Processing...' : `Confirm Purchase (${selectedTicket?.price || event.price.flt} FLT)`}
                </Button>
            )}
            </div>
        </div>
        </div>
    );
};

export default Home;