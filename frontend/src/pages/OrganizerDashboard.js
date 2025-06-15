import {
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle,
    DollarSign,
    Loader,
    Pause,
    Play,
    Plus,
    Settings,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../components/ui/Button.js';
import Card from '../components/ui/Card.js';
import { useNFT } from '../hooks/useNFT.js';
import { useWallet } from '../hooks/useWallet.js';
import '../styles/pages/OrganizerDashboard.css';
import { CONTRACT_ADDRESSES } from '../utils/constants.js';

const OrganizerDashboard = ({ organizerTab = 'create', setOrganizerTab }) => {
  const { walletInfo, isConnected } = useWallet();
  const { contract } = useNFT();
  
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Get current account address
  const account = walletInfo?.address;

  // Create concert form state
  const [concertForm, setConcertForm] = useState({
    name: '',
    artist: '',
    venue: '',
    date: '',
    totalTickets: '',
    price: '',
    cooldownPeriod: '3600',
    whitelistOnly: false,
    minVerificationLevel: '1'
  });

  // Check if user is contract owner
  useEffect(() => {
    const checkOwner = async () => {
      if (contract && account) {
        try {
          const owner = await contract.owner();
          const ownerLower = owner.toLowerCase();
          const accountLower = account.toLowerCase();
          const isMatch = ownerLower === accountLower;
          setIsOwner(isMatch);
        } catch (error) {
          console.error('Failed to check owner:', error);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
    };
    checkOwner();
  }, [contract, account]);

  // Load concerts list
  useEffect(() => {
    const loadConcerts = async () => {
      if (contract && (organizerTab === 'manage' || organizerTab === 'stats')) {
        try {
          setLoading(true);
          console.log('Loading concerts...');
          
          const concertList = [];
          
          // 從 concertId 1 開始嘗試載入，直到找不到為止
          let concertId = 1;
          let maxAttempts = 100; // 設定最大嘗試次數避免無限循環
          
          while (concertId <= maxAttempts) {
            try {
              console.log(`Trying to load concert ${concertId}...`);
              
              // 使用 getConcertDetails 函數檢查演唱會是否存在
              const concertDetails = await contract.getConcertDetails(concertId);
              console.log(`Concert ${concertId} details:`, concertDetails);
              
              // 如果演唱會名稱為空，表示不存在
              if (!concertDetails[0] || concertDetails[0] === '') {
                console.log(`Concert ${concertId} does not exist, stopping search`);
                break;
              }
              
              // 獲取完整的演唱會數據
              const concert = await contract.concerts(concertId);
              console.log(`Concert ${concertId} full data:`, concert);
              
              // 解析合約返回的數據結構
              const [
                id,
                name,
                artist, 
                venue,
                date,
                totalTickets,
                soldTickets,
                originalPrice,
                maxResalePrice, // eslint-disable-line no-unused-vars
                resaleCooldown, // eslint-disable-line no-unused-vars
                organizer,
                transferEnabled, // eslint-disable-line no-unused-vars
                whitelistOnly,
                isActive,
                minVerificationLevel
              ] = concert;
              
              console.log(`Concert ${concertId} parsed:`, {
                id: id.toString(),
                name,
                artist,
                venue,
                date: date.toString(),
                totalTickets: totalTickets.toString(),
                soldTickets: soldTickets.toString(),
                originalPrice: originalPrice.toString(),
                organizer,
                isActive
              });
              
              // 只顯示當前用戶創建的演唱會
              if (organizer.toLowerCase() === account?.toLowerCase()) {
                console.log(`Concert ${concertId} belongs to current user, adding to list`);
                concertList.push({
                  id: Number(id),
                  name: name,
                  artist: artist,
                  venue: venue,
                  date: new Date(Number(date) * 1000),
                  totalTickets: totalTickets.toString(),
                  ticketsSold: soldTickets.toString(),
                  price: originalPrice.toString(),
                  isActive: isActive,
                  organizer: organizer,
                  whitelistOnly: whitelistOnly,
                  minVerificationLevel: Number(minVerificationLevel)
                });
              } else {
                console.log(`Concert ${concertId} belongs to ${organizer}, not current user ${account}`);
              }
              
              concertId++;
            } catch (error) {
              console.log(`Concert ${concertId} not found or error:`, error.message);
              // 如果是 "execution reverted" 錯誤，可能是演唱會不存在
              if (error.message.includes('execution reverted')) {
                console.log(`Concert ${concertId} does not exist, stopping search`);
                break;
              }
              // 其他錯誤，繼續嘗試下一個
              concertId++;
            }
          }
          
          console.log('Final concert list:', concertList);
          setConcerts(concertList);
        } catch (error) {
          console.error('Failed to load concerts list:', error);
          setConcerts([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadConcerts();
  }, [contract, organizerTab, account]);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConcertForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Create concert
  const handleCreateConcert = async (e) => {
    e.preventDefault();
    if (!contract || !isOwner) return;

    try {
      setLoading(true);
      console.log('Creating concert with data:', concertForm);
      
      const dateTimestamp = Math.floor(new Date(concertForm.date).getTime() / 1000);
      const priceInWei = (parseFloat(concertForm.price) * 1e18).toString();

      console.log('Concert parameters:', {
        name: concertForm.name,
        artist: concertForm.artist,
        venue: concertForm.venue,
        dateTimestamp,
        totalTickets: parseInt(concertForm.totalTickets),
        priceInWei,
        cooldownPeriod: parseInt(concertForm.cooldownPeriod),
        whitelistOnly: concertForm.whitelistOnly,
        minVerificationLevel: parseInt(concertForm.minVerificationLevel)
      });

      const tx = await contract.createConcert(
        concertForm.name,
        concertForm.artist,
        concertForm.venue,
        dateTimestamp,
        parseInt(concertForm.totalTickets),
        priceInWei,
        parseInt(concertForm.cooldownPeriod),
        concertForm.whitelistOnly,
        parseInt(concertForm.minVerificationLevel)
      );

      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed');
      
      alert('Concert created successfully!');
      
      // 重置表單
      setConcertForm({
        name: '',
        artist: '',
        venue: '',
        date: '',
        totalTickets: '',
        price: '',
        cooldownPeriod: '3600',
        whitelistOnly: false,
        minVerificationLevel: '1'
      });
      
      // 重新載入演唱會列表（如果當前在 manage 或 stats 標籤）
      if (organizerTab === 'manage' || organizerTab === 'stats') {
        // 重新載入演唱會列表
        const concertList = [];
        let concertId = 1;
        let maxAttempts = 100;
        
        while (concertId <= maxAttempts) {
          try {
            // 使用 getConcertDetails 函數檢查演唱會是否存在
            const concertDetails = await contract.getConcertDetails(concertId);
            
            // 如果演唱會名稱為空，表示不存在
            if (!concertDetails[0] || concertDetails[0] === '') {
              break;
            }
            
            // 獲取完整的演唱會數據
            const concert = await contract.concerts(concertId);
            const [
              id, name, artist, venue, date, totalTickets, soldTickets, originalPrice,
              maxResalePrice, resaleCooldown, organizer, transferEnabled, whitelistOnly, isActive, minVerificationLevel // eslint-disable-line no-unused-vars
            ] = concert;
            
            if (organizer.toLowerCase() === account?.toLowerCase()) {
              concertList.push({
                id: Number(id),
                name: name,
                artist: artist,
                venue: venue,
                date: new Date(Number(date) * 1000),
                totalTickets: totalTickets.toString(),
                ticketsSold: soldTickets.toString(),
                price: originalPrice.toString(),
                isActive: isActive,
                organizer: organizer,
                whitelistOnly: whitelistOnly,
                minVerificationLevel: Number(minVerificationLevel)
              });
            }
            
            concertId++;
          } catch (error) {
            if (error.message.includes('execution reverted')) {
              break;
            }
            concertId++;
          }
        }
        setConcerts(concertList);
      }
      
    } catch (error) {
      console.error('Failed to create concert:', error);
      alert('Failed to create concert: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle concert status
  const toggleConcertStatus = async (concertId, currentStatus) => {
    if (!contract || !isOwner) return;

    try {
      setLoading(true);
      console.log(`Toggling concert ${concertId} status from ${currentStatus}`);
      
      // 使用 toggleConcert 函數來切換演唱會狀態
      const tx = await contract.toggleConcert(concertId);
      console.log('Transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed');
      
      // 重新載入演唱會列表以獲取最新狀態
      const updatedConcerts = concerts.map(concert => 
        concert.id === concertId 
          ? { ...concert, isActive: !currentStatus }
          : concert
      );
      setConcerts(updatedConcerts);
      
      alert(`Concert ${currentStatus ? 'paused' : 'resumed'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle concert status:', error);
      alert('Operation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="organizer-dashboard">
        <Card>
          <div className="not-connected">
            <AlertCircle size={48} className="warning-icon" />
            <h2>Wallet Not Connected</h2>
            <p>Please connect your wallet to access organizer management features</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="organizer-dashboard">
        <Card>
          <div className="not-authorized">
            <AlertCircle size={48} className="error-icon" />
            <h2>Access Denied</h2>
            <p>Only contract owner can access this feature</p>
            <div className="address-info">
              <p><strong>Contract Owner:</strong> 0xB96FA398CD35Da43d241a493851f3EBB047700d2</p>
              <p><strong>Current Account:</strong> {account}</p>
              <p><strong>Contract Address:</strong> {CONTRACT_ADDRESSES.NFT_CONTRACT}</p>
            </div>
            
            <Button 
              onClick={async () => {
                if (contract && account) {
                  try {
                    const owner = await contract.owner();
                    const isMatch = owner.toLowerCase() === account.toLowerCase();
                    setIsOwner(isMatch);
                    alert(isMatch ? 'Permission check successful!' : 'Permission check failed');
                  } catch (error) {
                    alert('Check failed: ' + error.message);
                  }
                } else {
                  alert('Contract or account not ready');
                }
              }}
              variant="primary"
            >
              🔄 Retry Permission Check
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="organizer-dashboard">
      <div className="dashboard-header">
        <h1>Organizer Dashboard</h1>
        <p>Manage your concerts and ticket sales</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${organizerTab === 'create' ? 'active' : ''}`}
          onClick={() => setOrganizerTab && setOrganizerTab('create')}
        >
          <Plus size={20} />
          Create Concert
        </button>
        <button 
          className={`tab ${organizerTab === 'manage' ? 'active' : ''}`}
          onClick={() => setOrganizerTab && setOrganizerTab('manage')}
        >
          <Settings size={20} />
          Manage Concerts
        </button>
        <button 
          className={`tab ${organizerTab === 'stats' ? 'active' : ''}`}
          onClick={() => setOrganizerTab && setOrganizerTab('stats')}
        >
          <BarChart3 size={20} />
          Sales Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {organizerTab === 'create' && (
          <Card>
            <div className="create-concert">
              <h2>Create New Concert</h2>
              <form onSubmit={handleCreateConcert} className="concert-form">
                <div className="form-group">
                  <label>Concert Name</label>
                  <input
                    type="text"
                    name="name"
                    value={concertForm.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Taylor Swift Eras Tour"
                  />
                </div>

                <div className="form-group">
                  <label>Artist/Performer</label>
                  <input
                    type="text"
                    name="artist"
                    value={concertForm.artist}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Taylor Swift"
                  />
                </div>

                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={concertForm.venue}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Taipei Arena"
                  />
                </div>

                <div className="form-group">
                  <label>Concert Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={concertForm.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Tickets</label>
                    <input
                      type="number"
                      name="totalTickets"
                      value={concertForm.totalTickets}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ticket Price (FLT)</label>
                    <input
                      type="number"
                      name="price"
                      value={concertForm.price}
                      onChange={handleInputChange}
                      required
                      step="0.001"
                      min="0"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Resale Cooldown Period</label>
                    <select
                      name="cooldownPeriod"
                      value={concertForm.cooldownPeriod}
                      onChange={handleInputChange}
                    >
                      <option value="0">No Restriction</option>
                      <option value="3600">1 Hour</option>
                      <option value="86400">1 Day</option>
                      <option value="604800">1 Week</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Minimum Verification Level</label>
                    <select
                      name="minVerificationLevel"
                      value={concertForm.minVerificationLevel}
                      onChange={handleInputChange}
                    >
                      <option value="0">No Requirement</option>
                      <option value="1">Basic Verification</option>
                      <option value="2">Advanced Verification</option>
                      <option value="3">Full Verification</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="whitelistOnly"
                      checked={concertForm.whitelistOnly}
                      onChange={handleInputChange}
                    />
                    Whitelist Only (Restrict to approved users)
                  </label>
                </div>

                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loading}
                  className="create-btn"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="spinning" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Concert
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        )}

        {organizerTab === 'manage' && (
          <div className="manage-concerts">
            <h2>Concert Management</h2>
            {loading ? (
              <Card>
                <div className="loading">
                  <Loader size={32} className="spinning" />
                  <p>Loading concerts...</p>
                </div>
              </Card>
            ) : concerts.length === 0 ? (
              <Card>
                <div className="no-concerts">
                  <Calendar size={48} className="empty-icon" />
                  <h3>No Concerts Created</h3>
                  <p>Create your first concert to get started</p>
                  <Button 
                    onClick={() => setOrganizerTab && setOrganizerTab('create')}
                    variant="primary"
                  >
                    <Plus size={16} />
                    Create Concert
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="concerts-list">
                {concerts.map(concert => (
                  <Card key={concert.id} className="concert-card">
                    <div className="concert-info">
                      <h3>{concert.name}</h3>
                      <div className="concert-details">
                        <p><strong>Artist:</strong> {concert.artist}</p>
                        <p><strong>Venue:</strong> {concert.venue}</p>
                        <p><strong>Date:</strong> {concert.date.toLocaleString()}</p>
                        <p><strong>Tickets:</strong> {concert.ticketsSold}/{concert.totalTickets}</p>
                        <p><strong>Price:</strong> {(concert.price / 1e18).toFixed(4)} FLT</p>
                        <p>
                          <strong>Status:</strong> 
                          <span className={`status ${concert.isActive ? 'active' : 'paused'}`}>
                            {concert.isActive ? (
                              <>
                                <CheckCircle size={16} />
                                Active
                              </>
                            ) : (
                              <>
                                <Pause size={16} />
                                Paused
                              </>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="concert-actions">
                      <Button
                        onClick={() => toggleConcertStatus(concert.id, concert.isActive)}
                        variant={concert.isActive ? 'secondary' : 'primary'}
                        disabled={loading}
                      >
                        {concert.isActive ? (
                          <>
                            <Pause size={16} />
                            Pause Sales
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Resume Sales
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {organizerTab === 'stats' && (
          <div className="sales-stats">
            <h2>Sales Analytics</h2>
            <div className="stats-grid">
              <Card className="stat-card">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <h3>Total Concerts</h3>
                  <div className="stat-value">{concerts.length}</div>
                </div>
              </Card>
              
              <Card className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>Tickets Sold</h3>
                  <div className="stat-value">
                    {concerts.reduce((sum, concert) => sum + parseInt(concert.ticketsSold), 0)}
                  </div>
                </div>
              </Card>
              
              <Card className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <h3>Total Revenue</h3>
                  <div className="stat-value">
                    {concerts.reduce((sum, concert) => 
                      sum + (parseInt(concert.ticketsSold) * parseFloat(concert.price) / 1e18), 0
                    ).toFixed(4)} FLT
                  </div>
                </div>
              </Card>
              
              <Card className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>Average Sales Rate</h3>
                  <div className="stat-value">
                    {concerts.length > 0 ? (
                      concerts.reduce((sum, concert) => 
                        sum + (parseInt(concert.ticketsSold) / parseInt(concert.totalTickets) * 100), 0
                      ) / concerts.length
                    ).toFixed(1) : 0}%
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard; 