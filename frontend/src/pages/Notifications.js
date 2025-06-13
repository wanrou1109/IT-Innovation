import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';
import { Bell, CheckCircle, X, Filter } from 'lucide-react';
import { mockNotifications } from '../data/mockEvents.js';
import '../styles/pages/Notifications.css';

const Notifications = () => {
    const { isConnected } = useWallet();
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [notifications, setNotifications] = useState(mockNotifications);

    const filteredNotifications = notifications.filter(notification => {
        switch (filter) {
        case 'unread':
            return !notification.read;
        case 'read':
            return notification.read;
        default:
            return true;
        }
    });

    const markAsRead = (notificationId) => {
        setNotifications(prev =>
        prev.map(notification =>
            notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const deleteNotification = (notificationId) => {
        setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
        );
    };

    const getNotificationIcon = (type) => {
        const icons = {
        ticket_purchased: '🎫',
        ticket_sold: '💰',
        nft_received: '🎨',
        level_up: '⭐',
        report_update: '📋',
        event_reminder: '⏰'
        };
        return icons[type] || '📱';
    };

    if (!isConnected) {
        return (
        <div className="notifications">
            <div className="notifications-header">
            <h1>Notifications</h1>
            </div>
            <div className="connect-wallet-prompt">
            <h2>Connect your wallet to view notifications</h2>
            <p>Please connect your wallet to access your notifications.</p>
            </div>
        </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notifications">
        <div className="notifications-header">
            <div className="header-content">
            <div className="header-title">
                <h1>Notifications</h1>
                <span className="notification-count">
                {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount} unread</span>
                )}
                </span>
            </div>
            
            <div className="header-actions">
                {unreadCount > 0 && (
                <Button
                    variant="outline"
                    size="small"
                    onClick={markAllAsRead}
                    icon={<CheckCircle size={16} />}
                >
                    Mark all as read
                </Button>
                )}
            </div>
            </div>

            <div className="notification-filters">
            <button
                onClick={() => setFilter('all')}
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            >
                All ({notifications.length})
            </button>
            <button
                onClick={() => setFilter('unread')}
                className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
            >
                Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button
                onClick={() => setFilter('read')}
                className={`filter-button ${filter === 'read' ? 'active' : ''}`}
            >
                Read ({notifications.filter(n => n.read).length})
            </button>
            </div>
        </div>

        <div className="notifications-content">
            {filteredNotifications.length > 0 ? (
            <div className="notifications-list">
                {filteredNotifications.map((notification) => (
                <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                />
                ))}
            </div>
            ) : (
            <div className="empty-state">
                <div className="empty-icon">
                <Bell size={48} />
                </div>
                <h3>No notifications</h3>
                <p>
                {filter === 'all' 
                    ? "You don't have any notifications yet."
                    : filter === 'unread'
                    ? "No unread notifications."
                    : "No read notifications."
                }
                </p>
            </div>
            )}
        </div>
        </div>
    );
    };

    // 通知卡片組件
    const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
    const [imageError, setImageError] = useState(false);

    const handleCardClick = () => {
        if (!notification.read) {
        onMarkAsRead(notification.id);
        }
    };

    return (
        <Card 
        className={`notification-card ${!notification.read ? 'unread' : ''}`}
        onClick={handleCardClick}
        hoverable
        >
        <div className="notification-card-content">
            <div className="notification-media">
            <div className="notification-type-icon">
                {notification.image && !imageError ? (
                <img
                    src={notification.image}
                    alt=""
                    className="notification-image"
                    onError={() => setImageError(true)}
                />
                ) : (
                <span className="notification-emoji">
                    {notification.type === 'ticket_purchased' && '🎫'}
                    {notification.type === 'ticket_sold' && '💰'}
                    {notification.type === 'nft_received' && '🎨'}
                    {notification.type === 'level_up' && '⭐'}
                    {notification.type === 'report_update' && '📋'}
                    {notification.type === 'event_reminder' && '⏰'}
                    {!['ticket_purchased', 'ticket_sold', 'nft_received', 'level_up', 'report_update', 'event_reminder'].includes(notification.type) && '📱'}
                </span>
                )}
            </div>
            </div>

            <div className="notification-content">
            <div className="notification-main">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
            </div>

            {!notification.read && (
                <div className="unread-indicator"></div>
            )}
            </div>

            <div className="notification-actions">
            {!notification.read && (
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                }}
                className="action-button mark-read"
                title="Mark as read"
                >
                <CheckCircle size={16} />
                </button>
            )}
            
            <button
                onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
                }}
                className="action-button delete"
                title="Delete notification"
            >
                <X size={16} />
            </button>
            </div>
        </div>
        </Card>
    );
};

export default Notifications;