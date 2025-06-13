import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 錢包狀態初始值
const initialState = {
  isConnected: false,
  isConnecting: false,
  walletInfo: {
    name: '',
    address: '',
    fltBalance: 0,
    ethBalance: 0,
    nftCount: 0
  },
  error: null,
  transactions: [],
  purchaseHistory: []
};

// Action 類型
const WALLET_ACTIONS = {
  CONNECT_START: 'CONNECT_START',
  CONNECT_SUCCESS: 'CONNECT_SUCCESS',
  CONNECT_ERROR: 'CONNECT_ERROR',
  DISCONNECT: 'DISCONNECT',
  UPDATE_BALANCE: 'UPDATE_BALANCE',
  UPDATE_NFT_COUNT: 'UPDATE_NFT_COUNT',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  PURCHASE_TICKET: 'PURCHASE_TICKET'
};

// Reducer 函數
const walletReducer = (state, action) => {
  switch (action.type) {
    case WALLET_ACTIONS.CONNECT_START:
      return {
        ...state,
        isConnecting: true,
        error: null
      };
    
    case WALLET_ACTIONS.CONNECT_SUCCESS:
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        walletInfo: action.payload,
        error: null
      };
    
    case WALLET_ACTIONS.CONNECT_ERROR:
      return {
        ...state,
        isConnecting: false,
        error: action.payload
      };
    
    case WALLET_ACTIONS.DISCONNECT:
      return {
        ...initialState
      };
    
    case WALLET_ACTIONS.UPDATE_BALANCE:
      return {
        ...state,
        walletInfo: {
          ...state.walletInfo,
          fltBalance: action.payload.flt,
          ethBalance: action.payload.eth
        }
      };
    
    case WALLET_ACTIONS.UPDATE_NFT_COUNT:
      return {
        ...state,
        walletInfo: {
          ...state.walletInfo,
          nftCount: action.payload
        }
      };
    
    case WALLET_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    
    case WALLET_ACTIONS.PURCHASE_TICKET:
      return {
        ...state,
        walletInfo: {
          ...state.walletInfo,
          fltBalance: state.walletInfo.fltBalance - action.payload.price
        },
        purchaseHistory: [action.payload, ...state.purchaseHistory]
      };
    
    default:
      return state;
  }
};

// Context 創建
const WalletContext = createContext();

// Provider 組件
export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // 連接錢包
  const connectWallet = async () => {
    dispatch({ type: WALLET_ACTIONS.CONNECT_START });
    
    try {
      // 模擬錢包連接 - 之後替換為實際的 Web3 連接邏輯
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockWalletInfo = {
        name: "Hoonie's Wallet",
        address: "0x742d35Cc6C907C38d39F65d46F8B1234567890Ab",
        fltBalance: 1250,
        ethBalance: 0.05,
        nftCount: 10
      };
      
      dispatch({ 
        type: WALLET_ACTIONS.CONNECT_SUCCESS, 
        payload: mockWalletInfo 
      });
      
      // 存儲到 localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletInfo', JSON.stringify(mockWalletInfo));
      
    } catch (error) {
      dispatch({ 
        type: WALLET_ACTIONS.CONNECT_ERROR, 
        payload: error.message 
      });
    }
  };

  // 斷開錢包
  const disconnectWallet = () => {
    dispatch({ type: WALLET_ACTIONS.DISCONNECT });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletInfo');
  };

  // 更新餘額
  const updateBalance = (fltBalance, ethBalance) => {
    dispatch({ 
      type: WALLET_ACTIONS.UPDATE_BALANCE, 
      payload: { flt: fltBalance, eth: ethBalance } 
    });
    
    // 更新 localStorage
    const currentWalletInfo = JSON.parse(localStorage.getItem('walletInfo') || '{}');
    const updatedWalletInfo = {
      ...currentWalletInfo,
      fltBalance,
      ethBalance
    };
    localStorage.setItem('walletInfo', JSON.stringify(updatedWalletInfo));
  };

  // 更新 NFT 數量
  const updateNFTCount = (count) => {
    dispatch({ 
      type: WALLET_ACTIONS.UPDATE_NFT_COUNT, 
      payload: count 
    });
    
    // 更新 localStorage
    const currentWalletInfo = JSON.parse(localStorage.getItem('walletInfo') || '{}');
    const updatedWalletInfo = {
      ...currentWalletInfo,
      nftCount: count
    };
    localStorage.setItem('walletInfo', JSON.stringify(updatedWalletInfo));
  };

  // 添加交易記錄
  const addTransaction = (transaction) => {
    const transactionWithId = {
      ...transaction,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      hash: '0x' + Math.random().toString(16).substr(2, 64) // 模擬交易哈希
    };
    
    dispatch({ 
      type: WALLET_ACTIONS.ADD_TRANSACTION, 
      payload: transactionWithId 
    });
    
    return transactionWithId;
  };

  // 購買票券
  const purchaseTicket = async (eventId, ticketType, price) => {
    try {
      if (state.walletInfo.fltBalance < price) {
        throw new Error('Insufficient FLT balance');
      }

      // 模擬購票交易
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ticketId = Date.now();
      const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      const blockNumber = Math.floor(Math.random() * 1000000) + 18000000;
      const gasUsed = Math.floor(Math.random() * 50000) + 21000;
      
      // 更新餘額
      dispatch({ 
        type: WALLET_ACTIONS.PURCHASE_TICKET, 
        payload: { 
          eventId, 
          ticketType, 
          price, 
          ticketId,
          transactionHash,
          blockNumber,
          gasUsed
        } 
      });
      
      // 添加交易記錄
      addTransaction({
        type: 'purchase',
        eventId,
        ticketType,
        price,
        ticketId,
        status: 'confirmed'
      });
      
      // 更新 localStorage 中的餘額
      const currentWalletInfo = JSON.parse(localStorage.getItem('walletInfo') || '{}');
      const updatedWalletInfo = {
        ...currentWalletInfo,
        fltBalance: currentWalletInfo.fltBalance - price
      };
      localStorage.setItem('walletInfo', JSON.stringify(updatedWalletInfo));
      
      return {
        success: true,
        ticketId,
        transactionHash,
        blockNumber,
        gasUsed
      };
      
    } catch (error) {
      throw new Error(`Purchase failed: ${error.message}`);
    }
  };

  // 複製錢包地址
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(state.walletInfo.address);
      return true;
    } catch (error) {
      console.error('Failed to copy address:', error);
      return false;
    }
  };

  // 格式化地址顯示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 發送 FLT 代幣
  const sendFLT = async (toAddress, amount, purpose = 'transfer') => {
    try {
      if (state.walletInfo.fltBalance < amount) {
        throw new Error('Insufficient FLT balance');
      }

      // 模擬轉賬交易
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 更新餘額
      updateBalance(state.walletInfo.fltBalance - amount, state.walletInfo.ethBalance);
      
      // 添加交易記錄
      const transaction = addTransaction({
        type: 'send',
        to: toAddress,
        amount,
        purpose,
        status: 'confirmed'
      });
      
      return transaction;
      
    } catch (error) {
      throw error;
    }
  };

  // 接收 FLT 代幣
  const receiveFLT = (fromAddress, amount, purpose = 'received') => {
    // 更新餘額
    updateBalance(state.walletInfo.fltBalance + amount, state.walletInfo.ethBalance);
    
    // 添加交易記錄
    const transaction = addTransaction({
      type: 'receive',
      from: fromAddress,
      amount,
      purpose,
      status: 'confirmed'
    });
    
    return transaction;
  };

  // 獲取交易歷史
  const getTransactionHistory = (limit = 20) => {
    return state.transactions.slice(0, limit);
  };

  // 獲取購買歷史
  const getPurchaseHistory = (limit = 10) => {
    return state.purchaseHistory.slice(0, limit);
  };

  // 驗證地址格式
  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // 獲取錢包狀態
  const getWalletStatus = () => {
    return {
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      hasError: !!state.error,
      errorMessage: state.error
    };
  };

  // 清除錯誤
  const clearError = () => {
    dispatch({ type: WALLET_ACTIONS.CONNECT_ERROR, payload: null });
  };

  // 組件掛載時檢查本地存儲
  useEffect(() => {
    const isConnected = localStorage.getItem('walletConnected');
    const walletInfo = localStorage.getItem('walletInfo');
    
    if (isConnected && walletInfo) {
      dispatch({ 
        type: WALLET_ACTIONS.CONNECT_SUCCESS, 
        payload: JSON.parse(walletInfo) 
      });
    }
  }, []);

  // 定時更新餘額（模擬）
  useEffect(() => {
    if (state.isConnected) {
      const interval = setInterval(() => {
        // 模擬小幅餘額變動（如質押獎勵）
        const currentBalance = state.walletInfo.fltBalance;
        const randomChange = (Math.random() - 0.5) * 0.1; // ±0.05 FLT
        const newBalance = Math.max(0, currentBalance + randomChange);
        
        if (Math.abs(randomChange) > 0.01) { // 只有變動超過 0.01 FLT 才更新
          updateBalance(newBalance, state.walletInfo.ethBalance);
        }
      }, 30000); // 每30秒檢查一次
      
      return () => clearInterval(interval);
    }
  }, [state.isConnected, state.walletInfo.fltBalance]);

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    updateBalance,
    updateNFTCount,
    addTransaction,
    purchaseTicket,
    copyAddress,
    formatAddress,
    sendFLT,
    receiveFLT,
    getTransactionHistory,
    getPurchaseHistory,
    isValidAddress,
    getWalletStatus,
    clearError
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook 使用
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};