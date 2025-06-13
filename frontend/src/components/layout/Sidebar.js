import React from 'react';
import { Home, Ticket, Award, Flag, User, ShoppingCart, RefreshCw, Search, Filter } from 'lucide-react';
import '../../styles/components/Sidebar.css';

const Sidebar = ({ 
    currentPage, 
    setCurrentPage, 
    homeMarketType, 
    setHomeMarketType,
    ticketsTab,
    setTicketsTab,
    nftsCategory,
    setNftsCategory,
    reportTab,
    setReportTab,
    profileTab,
    setProfileTab
}) => {
    const getSidebarContent = () => {
        switch (currentPage) {
            case 'home':
                return {
                title: 'Marketplace',
                items: [
                    { 
                    id: 'primary-sales', 
                    label: 'Primary Sales', 
                    icon: ShoppingCart, 
                    action: () => setHomeMarketType('primary'),
                    active: homeMarketType === 'primary'
                    },
                    { 
                    id: 'secondary-market', 
                    label: 'Secondary Market', 
                    icon: RefreshCw, 
                    action: () => setHomeMarketType('secondary'),
                    active: homeMarketType === 'secondary'
                    }
                ]
                };
            
            case 'tickets':
                return {
                title: 'My Tickets',
                items: [
                    { 
                    id: 'upcoming', 
                    label: 'Upcoming', 
                    icon: Ticket,
                    action: () => setTicketsTab('upcoming'),
                    active: ticketsTab === 'upcoming'
                    },
                    { 
                    id: 'past', 
                    label: 'Past', 
                    icon: Ticket,
                    action: () => setTicketsTab('past'),
                    active: ticketsTab === 'past'
                    }
                ]
                };
            
            case 'nfts':
                return {
                title: 'My NFTs',
                items: [
                    { 
                    id: 'participation', 
                    label: 'Participation Badge', 
                    icon: Award,
                    action: () => setNftsCategory('participation'),
                    active: nftsCategory === 'participation'
                    },
                    { 
                    id: 'level', 
                    label: 'Level Badge', 
                    icon: Award,
                    action: () => setNftsCategory('level'),
                    active: nftsCategory === 'level'
                    },
                    { 
                    id: 'annual', 
                    label: 'Annual Souvenir', 
                    icon: Award,
                    action: () => setNftsCategory('annual'),
                    active: nftsCategory === 'annual'
                    },
                    { 
                    id: 'milestone', 
                    label: 'Milestone Reward', 
                    icon: Award,
                    action: () => setNftsCategory('milestone'),
                    active: nftsCategory === 'milestone'
                    }
                ]
                };
            
            case 'report':
                return {
                title: 'Report',
                items: [
                    { 
                    id: 'submit-report', 
                    label: 'Submit a Report', 
                    icon: Flag,
                    action: () => setReportTab('submit'),
                    active: reportTab === 'submit'
                    },
                    { 
                    id: 'submission-record', 
                    label: 'Submission Record', 
                    icon: Flag,
                    action: () => setReportTab('records'),
                    active: reportTab === 'records'
                    }
                ]
                };
            
            case 'profile':
                return {
                title: 'Profile',
                items: [
                    { 
                    id: 'dashboard', 
                    label: 'Personal Dashboard', 
                    icon: User,
                    action: () => setProfileTab('dashboard'),
                    active: profileTab === 'dashboard'
                    },
                    { 
                    id: 'settings', 
                    label: 'Account Settings', 
                    icon: User,
                    action: () => setProfileTab('settings'),
                    active: profileTab === 'settings'
                    },
                    { 
                    id: 'wallet', 
                    label: 'Wallet Connection', 
                    icon: User,
                    action: () => setProfileTab('wallet'),
                    active: profileTab === 'wallet'
                    },
                    { 
                    id: 'preferences', 
                    label: 'Preferences', 
                    icon: User,
                    action: () => setProfileTab('preferences'),
                    active: profileTab === 'preferences'
                    }
                ]
                };
            
            default:
                return {
                title: 'Navigation',
                items: [
                    { id: 'home', label: 'Home', icon: Home, action: () => setCurrentPage('home') },
                    { id: 'dashboard', label: 'Dashboard', icon: User, action: () => setCurrentPage('dashboard') },
                    { id: 'tickets', label: 'My Tickets', icon: Ticket, action: () => setCurrentPage('tickets') },
                    { id: 'nfts', label: 'My NFTs', icon: Award, action: () => setCurrentPage('nfts') },
                    { id: 'report', label: 'Report', icon: Flag, action: () => setCurrentPage('report') },
                    { id: 'profile', label: 'Profile', icon: User, action: () => setCurrentPage('profile') }
                ]
                };
        }
    };

    const sidebarContent = getSidebarContent();

    return (
        <div className="sidebar" data-page={currentPage}>
        <div className="sidebar-header">
            <h1 className="sidebar-logo">TicketVerse</h1>
        </div>
        
        <nav className="sidebar-nav">
            <div className="nav-section">
            <h3 className="nav-section-title">{sidebarContent.title}</h3>
            <ul className="nav-list">
                {sidebarContent.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.active !== undefined ? item.active : item.id === currentPage;
                
                return (
                    <li key={item.id} className="nav-item">
                    <button
                        onClick={item.action || (() => {})}
                        className={`nav-button ${isActive ? 'active' : ''}`}
                        data-type={item.id}
                        title={item.label}
                    >
                        <IconComponent size={20} className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                    </button>
                    </li>
                );
                })}
            </ul>
            </div>

            {currentPage === 'home' && (
            <div className="nav-section">
                <h3 className="nav-section-title">Search & Filter</h3>
                <ul className="nav-list">
                <li className="nav-item">
                    <button className="nav-button">
                    <Search size={20} className="nav-icon" />
                    <span className="nav-label">Search Events</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button className="nav-button">
                    <Filter size={20} className="nav-icon" />
                    <span className="nav-label">Filter by Genre</span>
                    </button>
                </li>
                </ul>
            </div>
            )}
        </nav>
        </div>
    );
};

export default Sidebar;