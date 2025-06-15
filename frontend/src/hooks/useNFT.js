import React, { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { getConcertTicketNFTContract, getUserTickets } from '../utils/web3Utils.js';
import { useWallet } from './useWallet.js';

const initialState = {
  nfts: [],
  selectedNFT: null,
    loading: false,
    error: null,
  filter: 'all',
  sortBy: 'date'
};

// Action types
const NFT_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
  SET_NFTS: 'SET_NFTS',
    SET_ERROR: 'SET_ERROR',
    SELECT_NFT: 'SELECT_NFT',
  SET_FILTER: 'SET_FILTER',
  SET_SORT: 'SET_SORT',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const nftReducer = (state, action) => {
    switch (action.type) {
        case NFT_ACTIONS.SET_LOADING:
        return {
            ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };
    case NFT_ACTIONS.SET_NFTS:
      return {
        ...state,
        nfts: action.payload,
        loading: false,
        error: null
      };
        case NFT_ACTIONS.SET_ERROR:
        return {
            ...state,
            error: action.payload,
            loading: false
        };
        case NFT_ACTIONS.SELECT_NFT:
        return {
            ...state,
            selectedNFT: action.payload
        };
    case NFT_ACTIONS.SET_FILTER:
        return {
            ...state,
        filter: action.payload
        };
    case NFT_ACTIONS.SET_SORT:
        return {
            ...state,
        sortBy: action.payload
        };
    case NFT_ACTIONS.CLEAR_ERROR:
        return {
            ...state,
        error: null
      };
        default:
        return state;
    }
};

// Context 創建
const NFTContext = createContext();

// Provider 組件
export const NFTProvider = ({ children }) => {
    const [state, dispatch] = useReducer(nftReducer, initialState);
    const [contract, setContract] = useState(null);
    const { isConnected, walletInfo } = useWallet();

    // 初始化合約實例
    useEffect(() => {
        const initContract = async () => {
            if (isConnected && walletInfo?.address) {
                try {
                    const contractInstance = await getConcertTicketNFTContract();
                    setContract(contractInstance);
                    console.log('合約實例已初始化:', contractInstance);
                } catch (error) {
                    console.error('初始化合約失敗:', error);
                    setContract(null);
                }
            } else {
                setContract(null);
            }
        };

        initContract();
    }, [isConnected, walletInfo?.address]);

  // 載入用戶 NFT
  const loadNFTs = useCallback(async () => {
    if (!isConnected || !walletInfo?.address) {
      dispatch({ type: NFT_ACTIONS.SET_NFTS, payload: [] });
      return;
    }

        dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });
        
        try {
      // 從區塊鏈獲取用戶的票券 NFT
      const tickets = await getUserTickets(walletInfo.address);
      
      // 將票券轉換為 NFT 格式
      const nfts = tickets.map(ticket => ({
        id: ticket.id,
        name: `${ticket.event} - ${ticket.type}`,
        artist: ticket.artist,
        event: ticket.event,
        image: ticket.image || '/api/placeholder/300/200',
        rarity: ticket.isUsed ? 'Used' : 'Valid',
        category: ticket.type.toLowerCase(),
        date: ticket.date,
        venue: ticket.venue,
        seatNumber: ticket.seatNumber,
        seatSection: ticket.seatSection,
        price: ticket.price,
        isUsed: ticket.isUsed,
        transferCount: ticket.transferCount,
        resellable: ticket.resellable,
        status: ticket.status,
        purchaseTime: ticket.purchaseTime,
        qrCode: ticket.qrCode
      }));

      dispatch({ type: NFT_ACTIONS.SET_NFTS, payload: nfts });
        } catch (error) {
      console.error('Error loading NFTs from blockchain:', error);
        dispatch({ 
            type: NFT_ACTIONS.SET_ERROR, 
        payload: 'Failed to load NFTs from blockchain' 
      });
    }
  }, [isConnected, walletInfo?.address]);

  // 監聽錢包連接狀態變化
  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

    // 選擇 NFT
    const selectNFT = (nft) => {
    dispatch({ type: NFT_ACTIONS.SELECT_NFT, payload: nft });
  };

  // 設置篩選器
  const setFilter = (filter) => {
    dispatch({ type: NFT_ACTIONS.SET_FILTER, payload: filter });
  };

  // 設置排序方式
  const setSortBy = (sortBy) => {
    dispatch({ type: NFT_ACTIONS.SET_SORT, payload: sortBy });
  };

  // 清除錯誤
  const clearError = () => {
    dispatch({ type: NFT_ACTIONS.CLEAR_ERROR });
  };

  // 獲取篩選後的 NFT
  const getFilteredNFTs = () => {
    let filtered = [...state.nfts];

    // 應用篩選器
    if (state.filter !== 'all') {
      filtered = filtered.filter(nft => nft.category === state.filter);
    }

    // 應用排序
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'rarity':
          const rarityOrder = { 'Valid': 1, 'Used': 0 };
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // 獲取 NFT 統計
  const getNFTStats = () => {
    const total = state.nfts.length;
    const categories = {};
    const rarities = {};

    state.nfts.forEach(nft => {
      categories[nft.category] = (categories[nft.category] || 0) + 1;
      rarities[nft.rarity] = (rarities[nft.rarity] || 0) + 1;
    });

    return {
      total,
      categories,
      rarities
    };
    };

    // 搜索 NFT
    const searchNFTs = (query) => {
    return state.nfts.filter(nft =>
            nft.name.toLowerCase().includes(query.toLowerCase()) ||
            nft.artist?.toLowerCase().includes(query.toLowerCase()) ||
            nft.event?.toLowerCase().includes(query.toLowerCase())
        );
    };

    // 獲取最近的 NFT
    const getRecentNFTs = (limit = 5) => {
    return [...state.nfts]
      .sort((a, b) => new Date(b.purchaseTime) - new Date(a.purchaseTime))
        .slice(0, limit);
    };

    const value = {
        ...state,
        contract,
    loadNFTs,
        selectNFT,
    setFilter,
    setSortBy,
    clearError,
    getFilteredNFTs,
    getNFTStats,
        searchNFTs,
        getRecentNFTs
    };

    return (
        <NFTContext.Provider value={value}>
        {children}
        </NFTContext.Provider>
    );
    };

    // Hook 使用
    export const useNFT = () => {
    const context = useContext(NFTContext);
    if (!context) {
        throw new Error('useNFT must be used within an NFTProvider');
    }
    return context;
};