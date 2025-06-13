import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';
import { 
  X, Calendar, MapPin, Clock, QrCode, ExternalLink, Copy, Check, 
  Send, DollarSign, Loader, AlertTriangle, CheckCircle, User 
} from 'lucide-react';
import '../styles/pages/MyTickets.css';

const MyTickets = ({ ticketsTab = 'upcoming' }) => {
  const { isConnected, formatAddress, walletInfo, updateBalance } = useWallet();
  const [userTickets, setUserTickets] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState('');
  const [resaleModal, setResaleModal] = useState({ show: false, ticket: null });
  const [transferModal, setTransferModal] = useState({ show: false, ticket: null });
  const [saleModal, setSaleModal] = useState({ show: false, ticket: null });

  // 載入用戶票券
  useEffect(() => {
    if (isConnected) {
      loadUserTickets();
    } else {
      setUserTickets({ upcoming: [], past: [] });
      setLoading(false);
    }
  }, [isConnected, ticketsTab]);

  const loadUserTickets = () => {
    setLoading(true);
    try {
      const savedTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      const now = new Date();
      
      const upcoming = [];
      const past = [];
      
      savedTickets.forEach((ticket) => {
        const ticketDate = new Date(ticket.date);
        
        // 比較日期（只比較年月日，忽略時間）
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const ticketDateOnly = new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate());
        
        if (ticketDateOnly >= today) {
          upcoming.push(ticket);
        } else {
          past.push(ticket);
        }
      });
      
      setUserTickets({ upcoming, past });
    } catch (error) {
      console.error('Error loading tickets:', error);
      setUserTickets({ upcoming: [], past: [] });
    } finally {
      setLoading(false);
    }
  };

  // 複製交易哈希
  const copyTransactionHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(''), 2000);
    } catch (error) {
      console.error('Failed to copy hash:', error);
    }
  };

  // 處理轉售
  const handleResaleTicket = (ticket) => {
    if (!ticket.resellable) {
      alert('This ticket is not available for resale');
      return;
    }
    setResaleModal({ show: true, ticket });
  };

  // 處理轉移
  const handleTransferTicket = (ticket) => {
    if (!ticket.resellable) {
      alert('This ticket cannot be transferred');
      return;
    }
    setTransferModal({ show: true, ticket });
  };

  // 處理售出（賣給平台或其他用戶）
  const handleSellTicket = (ticket) => {
    if (!ticket.resellable) {
      alert('This ticket cannot be sold');
      return;
    }
    setSaleModal({ show: true, ticket });
  };

  // 確認轉售（掛到二手市場）
  const confirmResale = (resaleData) => {
    try {
      // 更新票券狀態為轉售中
      const updatedTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      const ticketIndex = updatedTickets.findIndex(t => t.id === resaleModal.ticket.id);
      
      if (ticketIndex !== -1) {
        updatedTickets[ticketIndex] = {
          ...updatedTickets[ticketIndex],
          isOnResale: true,
          resalePrice: resaleData.price,
          resaleReason: resaleData.reason,
          resaleListedAt: new Date().toISOString()
        };
        localStorage.setItem('userTickets', JSON.stringify(updatedTickets));
      }

      // 添加到二手市場
      const existingResaleTickets = JSON.parse(localStorage.getItem('resaleTickets') || '[]');
      const resaleTicket = {
        ...resaleModal.ticket,
        resaleId: Date.now(),
        sellerId: walletInfo.address,
        resalePrice: resaleData.price,
        originalPrice: resaleModal.ticket.price,
        resaleReason: resaleData.reason,
        listedAt: new Date().toISOString(),
        isAvailable: true,
        isPrimary: false,
        seller: {
          name: walletInfo.name || "Anonymous User",
          address: walletInfo.address,
          verificationLevel: 'Gold', // 可以根據實際用戶等級設定
          salesCount: Math.floor(Math.random() * 10) + 1,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          joinDate: '2024-01-15',
          successRate: Math.floor(Math.random() * 20) + 80
        }
      };
      
      existingResaleTickets.push(resaleTicket);
      localStorage.setItem('resaleTickets', JSON.stringify(existingResaleTickets));

      // 重新載入票券
      loadUserTickets();
      setResaleModal({ show: false, ticket: null });
      
      alert(`Successfully listed ${resaleModal.ticket.event} for resale at ${resaleData.price} FLT!`);
    } catch (error) {
      console.error('Error listing ticket for resale:', error);
      alert('Failed to list ticket for resale');
    }
  };

  // 確認轉移
  const confirmTransfer = async (transferData) => {
    try {
      // 模擬轉移交易
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 從用戶票券中移除
      const updatedTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      const remainingTickets = updatedTickets.filter(t => t.id !== transferModal.ticket.id);
      localStorage.setItem('userTickets', JSON.stringify(remainingTickets));

      // 創建轉移記錄
      const transferRecord = {
        id: Date.now(),
        ticketId: transferModal.ticket.id,
        event: transferModal.ticket.event,
        from: walletInfo.address,
        to: transferData.toAddress,
        transferTime: new Date().toISOString(),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        type: 'transfer',
        reason: transferData.reason || 'Ticket Transfer'
      };

      // 保存轉移記錄
      const existingTransfers = JSON.parse(localStorage.getItem('ticketTransfers') || '[]');
      existingTransfers.push(transferRecord);
      localStorage.setItem('ticketTransfers', JSON.stringify(existingTransfers));

      // 重新載入票券
      loadUserTickets();
      setTransferModal({ show: false, ticket: null });
      
      alert(`Successfully transferred ${transferModal.ticket.event} to ${formatAddress(transferData.toAddress)}!`);
    } catch (error) {
      console.error('Error transferring ticket:', error);
      alert('Failed to transfer ticket');
    }
  };

  // 確認售出（直接賣給用戶）
  const confirmSale = async (saleData) => {
    try {
      // 模擬售出交易
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const salePrice = saleData.price;
      const platformFee = salePrice * 0.05; // 5% 平台手續費
      const sellerReceives = salePrice - platformFee;

      // 更新用戶餘額
      updateBalance(walletInfo.fltBalance + sellerReceives, walletInfo.ethBalance);

      // 從用戶票券中移除
      const updatedTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      const remainingTickets = updatedTickets.filter(t => t.id !== saleModal.ticket.id);
      localStorage.setItem('userTickets', JSON.stringify(remainingTickets));

      // 創建售出記錄
      const saleRecord = {
        id: Date.now(),
        ticketId: saleModal.ticket.id,
        event: saleModal.ticket.event,
        seller: walletInfo.address,
        buyer: saleData.buyerAddress,
        salePrice: salePrice,
        platformFee: platformFee,
        sellerReceives: sellerReceives,
        saleTime: new Date().toISOString(),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        type: 'sale'
      };

      // 保存售出記錄
      const existingSales = JSON.parse(localStorage.getItem('ticketSales') || '[]');
      existingSales.push(saleRecord);
      localStorage.setItem('ticketSales', JSON.stringify(existingSales));

      // 重新載入票券
      loadUserTickets();
      setSaleModal({ show: false, ticket: null });
      
      alert(`Successfully sold ${saleModal.ticket.event} to ${formatAddress(saleData.buyerAddress)} for ${salePrice} FLT! You received ${sellerReceives.toFixed(2)} FLT after platform fees.`);
    } catch (error) {
      console.error('Error selling ticket:', error);
      alert('Failed to sell ticket');
    }
  };

  // 交易歷史數據（包含轉移和售出記錄）
  const getTransactionHistory = () => {
    const allTickets = [...userTickets.upcoming, ...userTickets.past];
    const ticketTransactions = allTickets.map(ticket => ({
      id: ticket.id,
      event: ticket.event,
      date: ticket.date,
      type: 'Purchase',
      amount: `${ticket.price} FLT`,
      status: 'Completed',
      hash: ticket.transactionHash
    }));

    // 添加轉移記錄
    const transfers = JSON.parse(localStorage.getItem('ticketTransfers') || '[]');
    const transferTransactions = transfers.map(transfer => ({
      id: transfer.id,
      event: transfer.event,
      date: transfer.transferTime,
      type: 'Transfer Out',
      amount: 'Free',
      status: 'Completed',
      hash: transfer.transactionHash,
      details: `To: ${formatAddress(transfer.to)}`
    }));

    // 添加售出記錄
    const sales = JSON.parse(localStorage.getItem('ticketSales') || '[]');
    const saleTransactions = sales.map(sale => ({
      id: sale.id,
      event: sale.event,
      date: sale.saleTime,
      type: 'Sale',
      amount: `+${sale.sellerReceives.toFixed(2)} FLT`,
      status: 'Completed',
      hash: sale.transactionHash,
      details: `Sold to ${formatAddress(sale.buyer)}`
    }));

    return [...ticketTransactions, ...transferTransactions, ...saleTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (!isConnected) {
    return (
      <div className="my-tickets">
        <div className="tickets-header">
          <h1>My Tickets</h1>
        </div>
        <div className="connect-wallet-prompt">
          <h2>Connect your wallet to view your tickets</h2>
          <p>Please connect your wallet to access your ticket collection.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-tickets">
        <div className="tickets-header">
          <h1>My Tickets</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  const currentTickets = userTickets[ticketsTab] || [];

  return (
    <div className="my-tickets">
      <div className="tickets-header">
        <h1>My Tickets</h1>
        <p className="tickets-subtitle">
          Total: {userTickets.upcoming.length + userTickets.past.length} tickets • 
          {ticketsTab === 'upcoming' ? 'Upcoming' : 'Past'}: {currentTickets.length}
        </p>
      </div>

      {/* Tickets Section */}
      <section className="tickets-section">
        <h2>
          {ticketsTab === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
        </h2>
        
        {currentTickets.length > 0 ? (
          <div className="tickets-grid">
            {currentTickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                isPast={ticketsTab === 'past'}
                onCopyHash={copyTransactionHash}
                copiedHash={copiedHash}
                onResale={handleResaleTicket}
                onTransfer={handleTransferTicket}
                onSell={handleSellTicket}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No {ticketsTab} tickets</h3>
            <p>You don't have any {ticketsTab} tickets.</p>
          </div>
        )}
      </section>

      {/* Transaction History */}
      <section className="transaction-section">
        <h2>Transaction History</h2>
        <Card className="transaction-table">
          <div className="table-header">
            <div className="table-row header">
              <div className="table-cell">Event</div>
              <div className="table-cell">Date</div>
              <div className="table-cell">Type</div>
              <div className="table-cell">Amount</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Transaction</div>
            </div>
          </div>
          <div className="table-body">
            {getTransactionHistory().map((transaction) => (
              <div key={`${transaction.type}-${transaction.id}`} className="table-row">
                <div className="table-cell" data-label="Event">{transaction.event}</div>
                <div className="table-cell" data-label="Date">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
                <div className="table-cell" data-label="Type">
                  <span className={`transaction-type ${transaction.type.toLowerCase().replace(' ', '-')}`}>
                    {transaction.type}
                  </span>
                </div>
                <div className="table-cell" data-label="Amount">
                  <span className={transaction.type === 'Sale' ? 'amount-positive' : ''}>
                    {transaction.amount}
                  </span>
                </div>
                <div className="table-cell" data-label="Status">
                  <span className="status-completed">{transaction.status}</span>
                </div>
                <div className="table-cell" data-label="Transaction">
                  <button 
                    onClick={() => copyTransactionHash(transaction.hash)}
                    className="hash-button"
                    title="Copy transaction hash"
                  >
                    {formatAddress(transaction.hash)}
                    {copiedHash === transaction.hash ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  {transaction.details && (
                    <div className="transaction-details">{transaction.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Modals */}
      {resaleModal.show && (
        <ResaleModal 
          ticket={resaleModal.ticket}
          onClose={() => setResaleModal({ show: false, ticket: null })}
          onConfirm={confirmResale}
        />
      )}

      {transferModal.show && (
        <TransferModal 
          ticket={transferModal.ticket}
          onClose={() => setTransferModal({ show: false, ticket: null })}
          onConfirm={confirmTransfer}
        />
      )}

      {saleModal.show && (
        <SaleModal 
          ticket={saleModal.ticket}
          onClose={() => setSaleModal({ show: false, ticket: null })}
          onConfirm={confirmSale}
        />
      )}
    </div>
  );
};

// Enhanced Ticket Card Component
const TicketCard = ({ ticket, isPast, onCopyHash, copiedHash, onResale, onTransfer, onSell }) => {
  const [imageError, setImageError] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (ticket.isOnResale) {
      return <span className="status-badge on-resale">Listed for Resale</span>;
    }
    
    if (isPast) {
      return <span className="status-badge past">Attended</span>;
    }
    
    const ticketDate = new Date(ticket.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ticketDateOnly = new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate());
    
    // 計算天數差異
    const timeDiff = ticketDateOnly - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7 && daysDiff >= 0) {
      return <span className="status-badge upcoming-soon">Upcoming Soon</span>;
    }
    return <span className="status-badge upcoming">Upcoming</span>;
  };

  const handleViewDetails = () => {
    alert(`Viewing details for ${ticket.event}`);
  };

  const handleExplorerClick = () => {
    if (ticket.transactionHash) {
      window.open(`https://etherscan.io/tx/${ticket.transactionHash}`, '_blank');
    }
  };

  return (
    <Card className={`ticket-card ${isPast ? 'past' : ''} ${ticket.isOnResale ? 'on-resale' : ''}`}>
      <div className="ticket-image-container">
        {!imageError ? (
          <img
            src={ticket.image}
            alt={ticket.event}
            className="ticket-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="ticket-placeholder">
            <div className="placeholder-icon">🎫</div>
          </div>
        )}
        
        <div className="ticket-type-badge">
          {ticket.type}
        </div>
        
        {getStatusBadge()}
      </div>

      <div className="ticket-info">
        <h3 className="ticket-event">{ticket.event}</h3>
        {ticket.artist && <p className="ticket-artist">{ticket.artist}</p>}
        
        <div className="ticket-details">
          <div className="detail-item">
            <MapPin size={16} />
            <span>{ticket.venue}</span>
          </div>
          <div className="detail-item">
            <Calendar size={16} />
            <span>{formatDate(ticket.date)}</span>
          </div>
          <div className="detail-item">
            <Clock size={16} />
            <span>{ticket.time}</span>
          </div>
        </div>

        <div className="ticket-meta">
          <div className="purchase-info">
            <span className="purchase-date">
              Purchased: {formatDate(ticket.purchaseTime)}
            </span>
            <span className="purchase-price">
              Price: {ticket.price} FLT
            </span>
          </div>
          
          {ticket.transactionHash && (
            <div className="transaction-info">
              <button 
                onClick={() => onCopyHash(ticket.transactionHash)}
                className="transaction-hash"
                title="Copy transaction hash"
              >
                TX: {ticket.transactionHash.slice(0, 8)}...
                {copiedHash === ticket.transactionHash ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          )}
        </div>

        <div className="ticket-actions">
          {!isPast && (
            <>
              <Button
                variant="secondary"
                size="small"
                icon={<QrCode size={16} />}
                onClick={() => setShowQR(!showQR)}
              >
                QR Code
              </Button>
              
              {ticket.resellable && !ticket.isOnResale && (
                <>
                  <Button
                    variant="primary"
                    size="small"
                    icon={<DollarSign size={16} />}
                    onClick={() => onResale && onResale(ticket)}
                  >
                    List for Resale
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="small"
                    icon={<Send size={16} />}
                    onClick={() => onTransfer && onTransfer(ticket)}
                  >
                    Transfer
                  </Button>
                  
                  <Button
                    variant="success"
                    size="small"
                    icon={<DollarSign size={16} />}
                    onClick={() => onSell && onSell(ticket)}
                  >
                    Sell to User
                  </Button>
                </>
              )}
              
              {ticket.isOnResale && (
                <span className="resale-status">
                  Listed at {ticket.resalePrice} FLT
                </span>
              )}
            </>
          )}
          
          <Button 
            variant="info" 
            size="small"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          
          {ticket.transactionHash && (
            <Button 
              variant="outline" 
              size="small"
              icon={<ExternalLink size={16} />}
              onClick={handleExplorerClick}
            >
              Explorer
            </Button>
          )}
        </div>

        {showQR && (
          <div className="qr-section">
            <div className="qr-placeholder">
              <QrCode size={80} />
              <p>QR Code: {ticket.qrCode}</p>
              <p className="qr-instructions">
                Show this QR code at the venue entrance
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Transfer Modal Component
const TransferModal = ({ ticket, onClose, onConfirm }) => {
  const [transferForm, setTransferForm] = useState({
    toAddress: '',
    reason: '',
    terms: false
  });
  const [transferring, setTransferring] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!transferForm.terms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    if (!transferForm.toAddress) {
      alert('Please enter recipient address');
      return;
    }

    // 簡單的地址格式驗證
    if (!transferForm.toAddress.startsWith('0x') || transferForm.toAddress.length !== 42) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    setTransferring(true);
    
    try {
      await onConfirm({
        toAddress: transferForm.toAddress,
        reason: transferForm.reason
      });
    } catch (error) {
      alert('Transfer failed: ' + error.message);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Transfer Ticket</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="event-summary">
          <h3>{ticket.event}</h3>
          <p>{ticket.venue} • {ticket.date} • {ticket.time}</p>
          <p><strong>Ticket Type:</strong> {ticket.type}</p>
        </div>

        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="form-group">
            <label htmlFor="toAddress">Recipient Address *</label>
            <input
              type="text"
              id="toAddress"
              placeholder="0x..."
              value={transferForm.toAddress}
              onChange={(e) => setTransferForm(prev => ({ 
                ...prev, 
                toAddress: e.target.value 
              }))}
              required
            />
            <small>Enter the recipient's Ethereum address</small>
          </div>

          <div className="form-group">
            <label htmlFor="transferReason">Reason for Transfer (Optional)</label>
            <textarea
              id="transferReason"
              value={transferForm.reason}
              onChange={(e) => setTransferForm(prev => ({ 
                ...prev, 
                reason: e.target.value 
              }))}
              placeholder="e.g., Gift to friend"
              rows={3}
            />
          </div>

          <div className="transfer-info">
            <CheckCircle size={16} />
            <span>Transfer is free and instant. The recipient will receive the ticket immediately.</span>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="transferTerms"
              checked={transferForm.terms}
              onChange={(e) => setTransferForm(prev => ({ 
                ...prev, 
                terms: e.target.checked 
              }))}
              required
            />
            <label htmlFor="transferTerms">
              I understand that this transfer is irreversible
            </label>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={transferring}
              icon={transferring ? <Loader size={16} className="spinner" /> : <Send size={16} />}
            >
              {transferring ? 'Transferring...' : 'Transfer Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sale Modal Component
const SaleModal = ({ ticket, onClose, onConfirm }) => {
  const [saleForm, setSaleForm] = useState({
    buyerAddress: '',
    price: ticket.price, // 默認原價
    terms: false
  });
  const [selling, setSelling] = useState(false);

  const platformFee = saleForm.price * 0.05;
  const sellerReceives = saleForm.price - platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!saleForm.terms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    if (saleForm.price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (!saleForm.buyerAddress) {
      alert('Please enter buyer address');
      return;
    }

    if (!saleForm.buyerAddress.startsWith('0x') || saleForm.buyerAddress.length !== 42) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    setSelling(true);
    
    try {
      await onConfirm({
        buyerAddress: saleForm.buyerAddress,
        price: saleForm.price
      });
    } catch (error) {
      alert('Sale failed: ' + error.message);
    } finally {
      setSelling(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Sell Ticket to User</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="event-summary">
          <h3>{ticket.event}</h3>
          <p>{ticket.venue} • {ticket.date} • {ticket.time}</p>
          <p><strong>Original Price:</strong> {ticket.price} FLT</p>
          <p><strong>Ticket Type:</strong> {ticket.type}</p>
        </div>

        <form onSubmit={handleSubmit} className="sale-form">
          <div className="form-group">
            <label htmlFor="buyerAddress">Buyer Address *</label>
            <input
              type="text"
              id="buyerAddress"
              placeholder="0x..."
              value={saleForm.buyerAddress}
              onChange={(e) => setSaleForm(prev => ({ 
                ...prev, 
                buyerAddress: e.target.value 
              }))}
              required
            />
            <small>Enter the buyer's Ethereum address</small>
          </div>

          <div className="form-group">
            <label htmlFor="salePrice">Sale Price (FLT) *</label>
            <input
              type="number"
              id="salePrice"
              min="1"
              step="0.1"
              value={saleForm.price}
              onChange={(e) => setSaleForm(prev => ({ 
                ...prev, 
                price: parseFloat(e.target.value) || 0 
              }))}
              required
            />
            <small>Set your desired sale price for this direct transaction</small>
          </div>

          <div className="price-breakdown">
            <div className="breakdown-item">
              <span>Sale Price:</span>
              <span>{saleForm.price} FLT</span>
            </div>
            <div className="breakdown-item">
              <span>Platform Fee (5%):</span>
              <span>-{platformFee.toFixed(2)} FLT</span>
            </div>
            <div className="breakdown-item total">
              <span>You Receive:</span>
              <span>{sellerReceives.toFixed(2)} FLT</span>
            </div>
          </div>

          <div className="sale-info">
            <CheckCircle size={16} />
            <span>Direct sale to specified user - transaction will be processed immediately upon confirmation</span>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="saleTerms"
              checked={saleForm.terms}
              onChange={(e) => setSaleForm(prev => ({ 
                ...prev, 
                terms: e.target.checked 
              }))}
              required
            />
            <label htmlFor="saleTerms">
              I agree to the sale terms and platform fee structure
            </label>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="success"
              disabled={selling}
              icon={selling ? <Loader size={16} className="spinner" /> : <DollarSign size={16} />}
            >
              {selling ? 'Processing Sale...' : `Sell for ${sellerReceives.toFixed(2)} FLT`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Resale Modal Component (existing, unchanged)
const ResaleModal = ({ ticket, onClose, onConfirm }) => {
  const [resaleForm, setResaleForm] = useState({
    price: ticket.price * 1.1, // 默認比原價高10%
    reason: '',
    terms: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!resaleForm.terms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    if (resaleForm.price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    // 計算最大允許價格（原價的150%）
    const maxPrice = ticket.price * 1.5;
    if (resaleForm.price > maxPrice) {
      alert(`Price cannot exceed ${maxPrice} FLT (150% of original price)`);
      return;
    }
    
    onConfirm({
      price: resaleForm.price,
      reason: resaleForm.reason
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>List Ticket for Resale</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="event-summary">
          <h3>{ticket.event}</h3>
          <p>{ticket.venue} • {ticket.date} • {ticket.time}</p>
          <p><strong>Original Price:</strong> {ticket.price} FLT</p>
          <p><strong>Ticket Type:</strong> {ticket.type}</p>
        </div>

        <form onSubmit={handleSubmit} className="resale-form">
          <div className="form-group">
            <label htmlFor="resalePrice">Resale Price (FLT)</label>
            <input
              type="number"
              id="resalePrice"
              min="1"
              max={ticket.price * 1.5}
              step="0.1"
              value={resaleForm.price}
              onChange={(e) => setResaleForm(prev => ({ 
                ...prev, 
                price: parseFloat(e.target.value) || 0 
              }))}
              required
            />
            <small className="form-help">
              Maximum allowed: {ticket.price * 1.5} FLT (150% of original price)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="resaleReason">Reason for Resale (Optional)</label>
            <textarea
              id="resaleReason"
              value={resaleForm.reason}
              onChange={(e) => setResaleForm(prev => ({ 
                ...prev, 
                reason: e.target.value 
              }))}
              placeholder="e.g., Can't attend due to schedule conflict"
              rows={3}
            />
          </div>

          <div className="price-comparison">
            <div className="price-item">
              <span>Original Price:</span>
              <span>{ticket.price} FLT</span>
            </div>
            <div className="price-item">
              <span>Your Price:</span>
              <span>{resaleForm.price} FLT</span>
            </div>
            <div className="price-item profit">
              <span>Difference:</span>
              <span className={resaleForm.price > ticket.price ? 'positive' : 'negative'}>
                {resaleForm.price > ticket.price ? '+' : ''}{(resaleForm.price - ticket.price).toFixed(1)} FLT
              </span>
            </div>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={resaleForm.terms}
              onChange={(e) => setResaleForm(prev => ({ 
                ...prev, 
                terms: e.target.checked 
              }))}
              required
            />
            <label htmlFor="terms">
              I agree to the resale terms and understand that platform fees may apply
            </label>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              List for Resale
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyTickets;