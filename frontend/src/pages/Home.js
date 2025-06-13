import { AlertTriangle, CheckCircle, ExternalLink, Flag, Loader, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../components/ui/Button.js';
import Card from '../components/ui/Card.js';
import { useWallet } from '../hooks/useWallet.js';
import '../styles/pages/Home.css';
import {
    buyResaleTicketFromContract,
    getAllConcerts,
    getResaleOrders,
    purchaseTicketFromContract
} from '../utils/web3Utils.js';

const Home = ({ homeMarketType = 'primary', setCurrentPage, setReportTarget }) => {
    const { walletInfo, isConnected } = useWallet();
    const [events, setEvents] = useState({ upcoming: [], past: [] });
    const [resaleTickets, setResaleTickets] = useState([]);
    const [purchaseModal, setPurchaseModal] = useState({ show: false, event: null });
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 載入演唱會資料
    useEffect(() => {
        loadConcerts();
    }, []);

    // 載入轉售票券
    useEffect(() => {
        if (homeMarketType === 'secondary') {
            loadResaleTickets();
        }
    }, [homeMarketType]);

    const loadConcerts = async () => {
        try {
            setLoading(true);
            setError(null);
            const concerts = await getAllConcerts();
            
            // 根據日期分類為即將到來和過去的演唱會
            const now = new Date();
            const upcoming = concerts.filter(concert => new Date(concert.date) >= now);
            const past = concerts.filter(concert => new Date(concert.date) < now);
            
            setEvents({ upcoming, past });
        } catch (error) {
            console.error('Error loading concerts:', error);
            setError('Failed to load concerts from blockchain');
            // 如果合約讀取失敗，使用空陣列
            setEvents({ upcoming: [], past: [] });
        } finally {
            setLoading(false);
        }
    };

    const loadResaleTickets = async () => {
        try {
            setLoading(true);
            const tickets = await getResaleOrders(50, 0);
            setResaleTickets(tickets);
        } catch (error) {
            console.error('Error loading resale tickets:', error);
            setResaleTickets([]);
        } finally {
            setLoading(false);
        }
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
            let result;
            
            if (purchaseModal.event.isResale) {
                // 購買轉售票券
                const orderId = purchaseModal.event.originalTicket.orderId;
                result = await buyResaleTicketFromContract(orderId, price);
            } else {
                // 購買原價票券
                const seatNumber = Math.floor(Math.random() * 100) + 1; // 隨機座位號
                const seatSection = 'A'; // 預設區域
                result = await purchaseTicketFromContract(
                    purchaseModal.event.id, 
                    seatNumber, 
                    seatSection, 
                    price
                );
            }
            
            if (result.success) {
                setPurchaseResult({
                    success: true,
                    message: `Successfully purchased ${ticketType} ticket for ${price} FLT!`,
                    ticketId: result.ticketId,
                    transactionHash: result.transactionHash
                });
                
                // 重新載入資料
                if (purchaseModal.event.isResale) {
                    loadResaleTickets();
                } else {
                    loadConcerts();
                }
            } else {
                setPurchaseResult({
                    success: false,
                    message: result.error || 'Purchase failed. Please try again.'
                });
            }
        } catch (error) {
            console.error('Purchase error:', error);
            setPurchaseResult({
                success: false,
                message: 'Transaction failed. Please check your wallet and try again.'
            });
        } finally {
            setPurchasing(false);
        }
    };

    // 關閉購票彈窗
    const handleCloseModal = () => {
        setPurchaseModal({ show: false, event: null });
        setPurchaseResult(null);
    };

    // 如果正在載入
    if (loading) {
        return (
            <div className="home-container">
                <div className="loading-container">
                    <Loader className="loading-spinner" size={48} />
                    <p>Loading {homeMarketType === 'primary' ? 'concerts' : 'resale tickets'} from blockchain...</p>
                </div>
            </div>
        );
    }

    // 如果有錯誤
    if (error) {
        return (
            <div className="home-container">
                <div className="error-container">
                    <AlertTriangle size={48} color="#EF4444" />
                    <h3>Error Loading Data</h3>
                    <p>{error}</p>
                    <Button onClick={homeMarketType === 'primary' ? loadConcerts : loadResaleTickets}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Market Type Toggle */}
            <div className="market-toggle">
                <h1>
                    {homeMarketType === 'primary' ? 'Official Concert Sales' : 'Fan-to-Fan Marketplace'}
                </h1>
                <p className="market-description">
                    {homeMarketType === 'primary' 
                        ? 'Purchase official tickets directly from organizers with blockchain verification'
                        : 'Buy and sell tickets safely in our community marketplace'
                    }
                </p>
            </div>

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
                                ? 'No official sales are currently available on the blockchain. Check back soon for new releases!' 
                                : 'No fan-to-fan tickets are currently available in the marketplace.'
                            }
                        </p>
                        <Button onClick={homeMarketType === 'primary' ? loadConcerts : loadResaleTickets}>
                            Refresh
                        </Button>
                    </div>
                )}
            </section>

            {/* Purchase Modal */}
            {purchaseModal.show && (
                <PurchaseModal
                    event={purchaseModal.event}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmPurchase}
                    purchasing={purchasing}
                    userBalance={walletInfo?.balance || 0}
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