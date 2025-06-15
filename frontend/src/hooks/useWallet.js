import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { getUserETHBalance, getUserFLTBalance, getUserNFTCount } from '../utils/web3Utils.js';

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
  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

    dispatch({ type: WALLET_ACTIONS.CONNECT_START });
    
      // 請求連接錢包
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const address = accounts[0];
      
      // 獲取真實的 ETH 餘額
      let ethBalance = 0;
      try {
        ethBalance = await getUserETHBalance(address);
      } catch (error) {
        console.warn('Could not fetch ETH balance:', error);
      }
      
      // 檢查是否在 Sepolia 網絡 (chainId: 0xaa36a7 = 11155111)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // 檢查是否在 Sepolia 網絡 (chainId: 0xaa36a7 = 11155111)
      if (chainId !== '0xaa36a7') {
        // 嘗試切換到 Sepolia
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          // 如果網絡不存在，添加 Sepolia 網絡
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia test network',
                rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                }
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // 獲取真實的 NFT 數量
      let nftCount = 0;
      try {
        nftCount = await getUserNFTCount(address);
      } catch (error) {
        console.warn('Could not fetch NFT count:', error);
      }

      // 獲取真實的 FLT 餘額
      let fltBalance = 0;
      try {
        fltBalance = await getUserFLTBalance(address);
        console.log(`Real FLT balance for ${address}: ${fltBalance}`);
      } catch (error) {
        console.error('Could not fetch FLT balance:', error);
        console.error('FLT balance fetch error details:', {
          error: error.message,
          address,
          timestamp: new Date().toISOString()
        });
      }

      const walletInfo = {
        name: "MetaMask Wallet",
        address: address,
        fltBalance: fltBalance, // 使用真實的 FLT 餘額
        ethBalance: parseFloat(ethBalance.toFixed(6)),
        nftCount: nftCount // 使用真實的 NFT 數量
      };
      
      dispatch({ 
        type: WALLET_ACTIONS.CONNECT_SUCCESS, 
        payload: walletInfo 
      });
      
      // 存儲到 localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletInfo', JSON.stringify(walletInfo));
      
      // 設置事件監聽器
      setupEventListeners();
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch({ 
        type: WALLET_ACTIONS.CONNECT_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  }, []);

  // 設置事件監聽器
  const setupEventListeners = useCallback(() => {
    if (typeof window.ethereum !== 'undefined') {
      // 監聽帳戶變更
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // 清除狀態並刷新頁面
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletInfo');
          window.location.reload();
        } else {
          // 刷新頁面以重新連接新帳戶
          window.location.reload();
        }
      };

      // 監聽網絡變更
      const handleChainChanged = (chainId) => {
        // 刷新頁面以重新初始化連接
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // 返回清理函數
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // 檢查 MetaMask 連接狀態
  const checkMetaMaskConnection = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        return false;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch (error) {
      console.error('Error checking MetaMask connection:', error);
      return false;
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

  // 更新 NFT 數量 - 從區塊鏈獲取真實數據
  const updateNFTCount = async (address = null) => {
    const userAddress = address || state.walletInfo.address;
    if (!userAddress) return;
    
    try {
      const realNFTCount = await getUserNFTCount(userAddress);
    dispatch({ 
      type: WALLET_ACTIONS.UPDATE_NFT_COUNT, 
        payload: realNFTCount 
    });
    
    // 更新 localStorage
    const currentWalletInfo = JSON.parse(localStorage.getItem('walletInfo') || '{}');
    const updatedWalletInfo = {
      ...currentWalletInfo,
        nftCount: realNFTCount
    };
    localStorage.setItem('walletInfo', JSON.stringify(updatedWalletInfo));
    } catch (error) {
      console.warn('Could not update NFT count:', error);
    }
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

  // 組件掛載時檢查 MetaMask 連接狀態
  useEffect(() => {
    const initializeWallet = async () => {
    const isConnected = localStorage.getItem('walletConnected');
    const walletInfo = localStorage.getItem('walletInfo');
    
      // 檢查 MetaMask 是否真的連接
      const isMetaMaskConnected = await checkMetaMaskConnection();
      
      if (isConnected && walletInfo && isMetaMaskConnected) {
        // 更新真實的錢包信息
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const address = accounts[0];
            const balanceWei = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            });
            const ethBalance = parseInt(balanceWei, 16) / Math.pow(10, 18);
            
            // 獲取真實的 NFT 數量
            let nftCount = 0;
            try {
              nftCount = await getUserNFTCount(address);
            } catch (error) {
              console.warn('Could not fetch NFT count:', error);
            }
            
            const updatedWalletInfo = {
              ...JSON.parse(walletInfo),
              address: address,
              ethBalance: parseFloat(ethBalance.toFixed(6)),
              nftCount: nftCount // 使用真實的 NFT 數量
            };
            
      dispatch({ 
        type: WALLET_ACTIONS.CONNECT_SUCCESS, 
              payload: updatedWalletInfo 
            });
            
            // 更新 localStorage
            localStorage.setItem('walletInfo', JSON.stringify(updatedWalletInfo));
            
            // 設置事件監聽器
            setupEventListeners();
          }
        } catch (error) {
          console.warn('Could not update wallet info:', error);
        }
      }
    };

    initializeWallet();
  }, []); // 空依賴數組，只在組件掛載時執行一次

  // 定期更新真實餘額和 NFT 數量
  useEffect(() => {
    if (state.isConnected && state.walletInfo.address) {
      const updateRealBalances = async () => {
        try {
          // 獲取真實的 ETH 餘額
          const realETHBalance = await getUserETHBalance(state.walletInfo.address);
          
          // 獲取真實的 NFT 數量
          const realNFTCount = await getUserNFTCount(state.walletInfo.address);
          
          // 獲取真實的 FLT 餘額
          const realFLTBalance = await getUserFLTBalance(state.walletInfo.address);
          console.log(`Periodic FLT balance update: Current=${state.walletInfo.fltBalance}, Real=${realFLTBalance}`);
          
          // 只更新實際變化的數據
          if (Math.abs(realETHBalance - state.walletInfo.ethBalance) > 0.0001 ||
              Math.abs(realFLTBalance - state.walletInfo.fltBalance) > 0.01) {
            console.log(`Updating balances: FLT ${state.walletInfo.fltBalance} -> ${realFLTBalance}, ETH ${state.walletInfo.ethBalance} -> ${realETHBalance}`);
            updateBalance(realFLTBalance, realETHBalance);
          }
          
          if (realNFTCount !== state.walletInfo.nftCount) {
            dispatch({ 
              type: WALLET_ACTIONS.UPDATE_NFT_COUNT, 
              payload: realNFTCount 
            });
          }
        } catch (error) {
          console.warn('Could not update balances:', error);
        }
      };

      // 立即更新一次
      updateRealBalances();
      
      // 每30秒更新一次
      const interval = setInterval(updateRealBalances, 30000);
      
      return () => clearInterval(interval);
    }
  }, [state.isConnected, state.walletInfo.address, state.walletInfo.ethBalance, state.walletInfo.fltBalance, state.walletInfo.nftCount]);

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
    clearError,
    checkMetaMaskConnection
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