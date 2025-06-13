import React, { useState } from 'react';
import { Home, Ticket, Award, Flag, User, Bell, Search } from 'lucide-react';
import '../../styles/components/Topbar.css';

const TopBar = ({ currentPage, setCurrentPage }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const navigationItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'tickets', label: 'My Tickets', icon: Ticket },
        { id: 'nfts', label: 'My NFTs', icon: Award },
        { id: 'report', label: 'Report', icon: Flag },
        { id: 'profile', label: 'Profile', icon: User }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search for:', searchQuery);
    };

    const unreadNotificationsCount = 3;

    return (
        <div className="topbar">
        <div className="topbar-left">
            <div className="topbar-logo">
            <h2>TicketVerse</h2>
            </div>
            
            <nav className="topbar-nav">
            {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`topbar-nav-item ${
                    currentPage === item.id ? 'active' : ''
                    }`}
                >
                    <IconComponent size={18} />
                    <span>{item.label}</span>
                </button>
                );
            })}
            </nav>
        </div>

        <div className="topbar-right">
            <div className="topbar-search">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search for K-pop groups, events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                </div>
            </form>
            </div>

            <button
            onClick={() => setCurrentPage('notifications')}
            className="notification-button"
            >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
                <span className="notification-badge">
                {unreadNotificationsCount}
                </span>
            )}
            </button>

            <button
            onClick={() => setCurrentPage('profile')}
            className="profile-button"
            >
            <div className="profile-avatar">
                <User size={18} />
            </div>
            </button>
        </div>
        </div>
    );
};

export default TopBar;