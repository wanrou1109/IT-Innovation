/**
 * 格式化錢包地址
 * @param {string} address - 錢包地址
 * @param {number} startLength - 開始顯示的字符數
 * @param {number} endLength - 結尾顯示的字符數
 * @returns {string} 格式化後的地址
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * 格式化數字金額
 * @param {number} amount - 金額
 * @param {number} decimals - 小數位數
 * @param {string} locale - 地區設置
 * @returns {string} 格式化後的金額
 */
export const formatNumber = (amount, decimals = 2, locale = 'en-US') => {
  if (amount === null || amount === undefined) return '0';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

/**
 * 格式化貨幣
 * @param {number} amount - 金額
 * @param {string} currency - 貨幣代碼
 * @param {string} locale - 地區設置
 * @returns {string} 格式化後的貨幣
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * 格式化 FLT 代幣數量
 * @param {number} amount - FLT 數量
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的 FLT 數量
 */
export const formatFLT = (amount, decimals = 0) => {
  if (amount === null || amount === undefined) return '0 FLT';
  
  const formatted = formatNumber(amount, decimals);
  return `${formatted} FLT`;
};

/**
 * 格式化百分比
 * @param {number} value - 數值 (0-1 或 0-100)
 * @param {number} decimals - 小數位數
 * @param {boolean} isDecimal - 是否為小數形式 (0-1)
 * @returns {string} 格式化後的百分比
 */
export const formatPercentage = (value, decimals = 1, isDecimal = false) => {
  if (value === null || value === undefined) return '0%';
  
  const percentage = isDecimal ? value * 100 : value;
  return `${formatNumber(percentage, decimals)}%`;
};

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式類型
 * @param {string} locale - 地區設置
 * @returns {string} 格式化後的日期
 */
export const formatDate = (date, format = 'medium', locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    medium: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    long: { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    },
    date: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  };
  
  return new Intl.DateTimeFormat(locale, options[format] || options.medium).format(dateObj);
};

/**
 * 格式化相對時間 (如: "2 hours ago")
 * @param {Date|string|number} date - 日期
 * @param {string} locale - 地區設置
 * @returns {string} 相對時間
 */
export const formatRelativeTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      return rtf.format(-count, interval.label);
    }
  }
  
  return 'just now';
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字節數
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的文件大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 格式化交易哈希
 * @param {string} hash - 交易哈希
 * @param {number} length - 顯示長度
 * @returns {string} 格式化後的哈希
 */
export const formatTransactionHash = (hash, length = 10) => {
  if (!hash) return '';
  
  if (hash.length <= length) return hash;
  
  const start = Math.floor(length / 2);
  const end = length - start;
  
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};

/**
 * 格式化 NFT 名稱
 * @param {string} name - NFT 名稱
 * @param {number} maxLength - 最大長度
 * @returns {string} 格式化後的名稱
 */
export const formatNFTName = (name, maxLength = 30) => {
  if (!name) return 'Unnamed NFT';
  
  if (name.length <= maxLength) return name;
  
  return `${name.slice(0, maxLength - 3)}...`;
};

/**
 * 格式化粉絲數量
 * @param {number} count - 粉絲數量
 * @returns {string} 格式化後的粉絲數量
 */
export const formatFansCount = (count) => {
  if (!count) return '0 fans';
  
  if (count < 1000) {
    return `${count} fans`;
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K fans`;
  } else {
    return `${(count / 1000000).toFixed(1)}M fans`;
  }
};

/**
 * 格式化區塊鏈網絡名稱
 * @param {number} chainId - 鏈 ID
 * @returns {string} 網絡名稱
 */
export const formatNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum',
    5: 'Goerli',
    137: 'Polygon',
    80001: 'Mumbai',
    56: 'BSC',
    97: 'BSC Testnet'
  };
  
  return networks[chainId] || `Network ${chainId}`;
};

/**
 * 驗證並格式化錢包地址
 * @param {string} address - 錢包地址
 * @returns {string|null} 格式化後的地址或 null
 */
export const validateAndFormatAddress = (address) => {
  if (!address || typeof address !== 'string') return null;
  
  // 移除空格並轉換為小寫
  const cleanAddress = address.trim().toLowerCase();
  
  // 檢查是否為有效的以太坊地址格式
  if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
    return null;
  }
  
  return cleanAddress;
};

/**
 * 格式化搜索結果高亮
 * @param {string} text - 原始文本
 * @param {string} query - 搜索關鍵詞
 * @returns {string} 帶高亮標記的文本
 */
export const highlightSearchResult = (text, query) => {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * 格式化經驗值進度
 * @param {number} current - 當前經驗值
 * @param {number} total - 總經驗值
 * @returns {object} 進度信息
 */
export const formatExperienceProgress = (current, total) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return {
    current,
    total,
    percentage: Math.min(100, Math.max(0, percentage)),
    remaining: Math.max(0, total - current),
    formatted: `${formatNumber(current)} / ${formatNumber(total)}`
  };
};

/**
 * 格式化錯誤消息
 * @param {Error|string} error - 錯誤對象或消息
 * @returns {string} 用戶友好的錯誤消息
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  // 處理常見的區塊鏈錯誤
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('user rejected')) {
      return 'Transaction was cancelled by user';
    }
    
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for this transaction';
    }
    
    if (message.includes('gas')) {
      return 'Transaction failed due to gas issues';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// 導出所有函數
export default {
  formatAddress,
  formatNumber,
  formatCurrency,
  formatFLT,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  formatFileSize,
  formatTransactionHash,
  formatNFTName,
  formatFansCount,
  formatNetworkName,
  validateAndFormatAddress,
  highlightSearchResult,
  formatExperienceProgress,
  formatErrorMessage
};