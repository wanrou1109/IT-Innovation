// 應用配置
export const APP_CONFIG = {
  name: 'TicketVerse',
  version: '1.0.0',
  description: 'Decentralized K-pop ticket and NFT platform',
  url: 'https://ticketverse.io'
};

// 網絡配置
export const NETWORK_CONFIG = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  testnet: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/',
    blockExplorer: 'https://goerli.etherscan.io'
  }
};

// 智能合約地址 (模擬地址)
export const CONTRACT_ADDRESSES = {
  FLT_TOKEN: '0x1234567890123456789012345678901234567890',
  NFT_CONTRACT: '0x0987654321098765432109876543210987654321',
  MARKETPLACE: '0x1111111111111111111111111111111111111111',
  STAKING: '0x2222222222222222222222222222222222222222',
  GOVERNANCE: '0x3333333333333333333333333333333333333333'
};

// FLT 代幣配置
export const FLT_CONFIG = {
  name: 'FanLoyaltyToken',
  symbol: 'FLT',
  decimals: 18,
  totalSupply: '1000000000', // 10億 FLT
  stakingAPY: 12.5, 
  minStakeAmount: 100, 
  reportStakeAmount: 50 // 舉報質押量
};

// NFT 稀有度配置
export const RARITY_LEVELS = {
  COMMON: {
    name: 'Common',
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    probability: 60 // 60%
  },
  RARE: {
    name: 'Rare',
    color: '#3B82F6',
    backgroundColor: '#EBF4FF',
    probability: 25 // 25%
  },
  EPIC: {
    name: 'Epic',
    color: '#8B5CF6',
    backgroundColor: '#F3E8FF',
    probability: 12 // 12%
  },
  LEGENDARY: {
    name: 'Legendary',
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    probability: 3 // 3%
  }
};

// 粉絲等級配置
export const FAN_LEVELS = {
  BRONZE: {
    name: 'Bronze',
    minExperience: 0,
    maxExperience: 299,
    color: '#CD7F32',
    benefits: ['Basic NFTs', 'Standard tickets']
  },
  SILVER: {
    name: 'Silver',
    minExperience: 300,
    maxExperience: 699,
    color: '#C0C0C0',
    benefits: ['Premium NFTs', 'Early access', 'Discounts']
  },
  GOLD: {
    name: 'Gold',
    minExperience: 700,
    maxExperience: 1499,
    color: '#FFD700',
    benefits: ['Exclusive NFTs', 'VIP access', 'Meet & greet']
  },
  PLATINUM: {
    name: 'Platinum',
    minExperience: 1500,
    maxExperience: 2999,
    color: '#E5E4E2',
    benefits: ['Legendary NFTs', 'All access', 'Private events']
  },
  DIAMOND: {
    name: 'Diamond',
    minExperience: 3000,
    maxExperience: Infinity,
    color: '#B9F2FF',
    benefits: ['Ultimate access', 'Custom experiences', 'Artist collaboration']
  }
};

// 警告等級配置
export const WARNING_LEVELS = {
  NONE: {
    level: 0,
    name: 'No Warning',
    color: '#10B981',
    icon: '✓',
    description: 'You are a user who abides by the rules!',
    restrictions: []
  },
  YELLOW: {
    level: 1,
    name: 'Yellow Warning',
    color: '#F59E0B',
    icon: '⚠️',
    description: 'Automatically issued by the system, requiring additional verification',
    restrictions: ['Additional verification required']
  },
  ORANGE: {
    level: 2,
    name: 'Orange Warning',
    color: '#F97316',
    icon: '🚫',
    description: 'Community Report + Preliminary Evidence, Limit the Number of Tickets Purchased',
    restrictions: ['Limited ticket purchases', 'Account under review']
  },
  RED: {
    level: 3,
    name: 'Red Warning',
    color: '#EF4444',
    icon: '🚨',
    description: 'Confirmed scalper behavior, added to blacklist',
    restrictions: ['Account suspended', 'Trading disabled', 'Blacklisted']
  }
};

// 票券類型配置
export const TICKET_TYPES = {
  GENERAL: {
    name: 'General',
    color: '#6B7280',
    features: ['Standard seating', 'Digital program', 'Participation NFT']
  },
  PREMIUM: {
    name: 'Premium',
    color: '#8B5CF6',
    features: ['Premium seating', 'Priority entry', 'Digital program', 'Commemorative NFT']
  },
  VIP: {
    name: 'VIP',
    color: '#F59E0B',
    features: ['VIP seating', 'Meet & greet', 'Exclusive merchandise', 'Priority entry', 'Commemorative NFT']
  }
};

// 事件狀態配置
export const EVENT_STATUS = {
  UPCOMING: {
    name: 'Upcoming',
    color: '#3B82F6',
    description: 'Event scheduled'
  },
  ON_SALE: {
    name: 'On Sale',
    color: '#10B981',
    description: 'Tickets available'
  },
  SOLD_OUT: {
    name: 'Sold Out',
    color: '#EF4444',
    description: 'No tickets available'
  },
  COMPLETED: {
    name: 'Completed',
    color: '#6B7280',
    description: 'Event finished'
  },
  CANCELLED: {
    name: 'Cancelled',
    color: '#EF4444',
    description: 'Event cancelled'
  }
};

// 交易類型配置
export const TRANSACTION_TYPES = {
  PURCHASE: {
    name: 'Purchase',
    color: '#EF4444',
    icon: '🛍️'
  },
  SALE: {
    name: 'Sale',
    color: '#10B981',
    icon: '💰'
  },
  TRANSFER: {
    name: 'Transfer',
    color: '#3B82F6',
    icon: '↔️'
  },
  STAKE: {
    name: 'Stake',
    color: '#8B5CF6',
    icon: '🔒'
  },
  UNSTAKE: {
    name: 'Unstake',
    color: '#F59E0B',
    icon: '🔓'
  },
  REWARD: {
    name: 'Reward',
    color: '#10B981',
    icon: '🎁'
  }
};

// 通知類型配置
export const NOTIFICATION_TYPES = {
  TICKET_PURCHASED: {
    type: 'ticket_purchased',
    title: 'Ticket Purchased',
    icon: '🎫',
    color: '#10B981'
  },
  TICKET_SOLD: {
    type: 'ticket_sold',
    title: 'Ticket Sold',
    icon: '💰',
    color: '#F59E0B'
  },
  NFT_RECEIVED: {
    type: 'nft_received',
    title: 'NFT Received',
    icon: '🎨',
    color: '#8B5CF6'
  },
  LEVEL_UP: {
    type: 'level_up',
    title: 'Level Up!',
    icon: '⭐',
    color: '#F59E0B'
  },
  REPORT_UPDATE: {
    type: 'report_update',
    title: 'Report Update',
    icon: '📋',
    color: '#3B82F6'
  },
  EVENT_REMINDER: {
    type: 'event_reminder',
    title: 'Event Reminder',
    icon: '⏰',
    color: '#6B7280'
  }
};

// API 端點配置
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  EVENTS: '/api/events',
  TICKETS: '/api/tickets',
  NFTS: '/api/nfts',
  USERS: '/api/users',
  TRANSACTIONS: '/api/transactions',
  REPORTS: '/api/reports'
};

// 本地存儲鍵
export const STORAGE_KEYS = {
  WALLET_CONNECTED: 'ticketverse_wallet_connected',
  WALLET_INFO: 'ticketverse_wallet_info',
  USER_PREFERENCES: 'ticketverse_user_preferences',
  LAST_SYNC: 'ticketverse_last_sync'
};

// 錯誤消息
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient FLT balance',
  INVALID_ADDRESS: 'Invalid wallet address',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network connection error',
  CONTRACT_ERROR: 'Smart contract error',
  UNAUTHORIZED: 'Unauthorized access'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUCCESS: 'Transaction completed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  REPORT_SUBMITTED: 'Report submitted successfully',
  PREFERENCES_SAVED: 'Preferences saved successfully'
};

// 響應式斷點
export const BREAKPOINTS = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
  wide: '1536px'
};

// 動畫配置
export const ANIMATION_CONFIG = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

export default {
  APP_CONFIG,
  NETWORK_CONFIG,
  CONTRACT_ADDRESSES,
  FLT_CONFIG,
  RARITY_LEVELS,
  FAN_LEVELS,
  WARNING_LEVELS,
  TICKET_TYPES,
  EVENT_STATUS,
  TRANSACTION_TYPES,
  REPORT_TYPES,
  NOTIFICATION_TYPES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  BREAKPOINTS,
  ANIMATION_CONFIG
};