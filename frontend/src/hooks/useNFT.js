import { createContext, useContext, useReducer, useEffect } from 'react';
import { mockNFTs, rarityConfig, categoryConfig } from '../data/mockNFTs.js';

// NFT 狀態初始值
const initialState = {
    nfts: mockNFTs,
    loading: false,
    error: null,
    selectedCategory: 'participation',
    selectedNFT: null,
    transferModal: {
        isOpen: false,
        nft: null
    }
};

// Action 類型
const NFT_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_NFTS: 'SET_NFTS',
    SET_CATEGORY: 'SET_CATEGORY',
    SELECT_NFT: 'SELECT_NFT',
    TRANSFER_NFT: 'TRANSFER_NFT',
    OPEN_TRANSFER_MODAL: 'OPEN_TRANSFER_MODAL',
    CLOSE_TRANSFER_MODAL: 'CLOSE_TRANSFER_MODAL',
    UPDATE_NFT: 'UPDATE_NFT'
};

// Reducer 函數
const nftReducer = (state, action) => {
    switch (action.type) {
        case NFT_ACTIONS.SET_LOADING:
        return {
            ...state,
            loading: action.payload
        };
        
        case NFT_ACTIONS.SET_ERROR:
        return {
            ...state,
            error: action.payload,
            loading: false
        };
        
        case NFT_ACTIONS.SET_NFTS:
        return {
            ...state,
            nfts: action.payload,
            loading: false
        };
        
        case NFT_ACTIONS.SET_CATEGORY:
        return {
            ...state,
            selectedCategory: action.payload
        };
        
        case NFT_ACTIONS.SELECT_NFT:
        return {
            ...state,
            selectedNFT: action.payload
        };
        
        case NFT_ACTIONS.OPEN_TRANSFER_MODAL:
        return {
            ...state,
            transferModal: {
            isOpen: true,
            nft: action.payload
            }
        };
        
        case NFT_ACTIONS.CLOSE_TRANSFER_MODAL:
        return {
            ...state,
            transferModal: {
            isOpen: false,
            nft: null
            }
        };
        
        case NFT_ACTIONS.TRANSFER_NFT:
        // 在實際應用中，這裡會調用智能合約
        return {
            ...state,
            transferModal: {
            isOpen: false,
            nft: null
            }
        };
        
        case NFT_ACTIONS.UPDATE_NFT:
        const { category, nftId, updates } = action.payload;
        return {
            ...state,
            nfts: {
            ...state.nfts,
            [category]: state.nfts[category].map(nft =>
                nft.id === nftId ? { ...nft, ...updates } : nft
            )
            }
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

    // 獲取 NFT 收藏
    const fetchNFTs = async () => {
        dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });
        
        try {
        // 模擬 API 調用 - 之後替換為實際的區塊鏈查詢
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch({ 
            type: NFT_ACTIONS.SET_NFTS, 
            payload: mockNFTs 
        });
        
        } catch (error) {
        dispatch({ 
            type: NFT_ACTIONS.SET_ERROR, 
            payload: error.message 
        });
        }
    };

    // 設置當前分類
    const setCategory = (category) => {
        dispatch({ 
        type: NFT_ACTIONS.SET_CATEGORY, 
        payload: category 
        });
    };

    // 選擇 NFT
    const selectNFT = (nft) => {
        dispatch({ 
        type: NFT_ACTIONS.SELECT_NFT, 
        payload: nft 
        });
    };

    // 打開轉移模態框
    const openTransferModal = (nft) => {
        if (!nft.transferable) {
        alert('This NFT is not transferable');
        return;
        }
        
        dispatch({ 
        type: NFT_ACTIONS.OPEN_TRANSFER_MODAL, 
        payload: nft 
        });
    };

    // 關閉轉移模態框
    const closeTransferModal = () => {
        dispatch({ type: NFT_ACTIONS.CLOSE_TRANSFER_MODAL });
    };

    // 轉移 NFT
    const transferNFT = async (nft, toAddress) => {
        try {
        dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });
        
        // 模擬轉移交易 - 之後替換為實際的智能合約調用
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`Transferring NFT ${nft.id} to ${toAddress}`);
        
        dispatch({ type: NFT_ACTIONS.TRANSFER_NFT });
        
        // 可選：從本地收藏中移除 NFT
        // 或者更新 NFT 狀態
        
        return true;
        
        } catch (error) {
        dispatch({ 
            type: NFT_ACTIONS.SET_ERROR, 
            payload: error.message 
        });
        return false;
        }
    };

    // 獲取 NFT 稀有度樣式
    const getRarityStyle = (rarity) => {
        return rarityConfig[rarity] || rarityConfig.Common;
    };

    // 獲取分類信息
    const getCategoryInfo = (category) => {
        return categoryConfig[category];
    };

    // 獲取 NFT 總數
    const getTotalNFTCount = () => {
        return Object.values(state.nfts).reduce((total, categoryNFTs) => {
        return total + categoryNFTs.length;
        }, 0);
    };

    // 獲取分類 NFT 數量
    const getCategoryCount = (category) => {
        return state.nfts[category]?.length || 0;
    };

    // 按稀有度篩選 NFT
    const filterByRarity = (category, rarity) => {
        return state.nfts[category]?.filter(nft => nft.rarity === rarity) || [];
    };

    // 搜索 NFT
    const searchNFTs = (query) => {
        const results = {};
        
        Object.keys(state.nfts).forEach(category => {
        results[category] = state.nfts[category].filter(nft =>
            nft.name.toLowerCase().includes(query.toLowerCase()) ||
            nft.artist?.toLowerCase().includes(query.toLowerCase()) ||
            nft.event?.toLowerCase().includes(query.toLowerCase())
        );
        });
        
        return results;
    };

    // 獲取最近的 NFT
    const getRecentNFTs = (limit = 5) => {
        const allNFTs = Object.values(state.nfts).flat();
        return allNFTs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    };

    // 組件掛載時獲取 NFT
    useEffect(() => {
        fetchNFTs();
    }, []);

    const value = {
        ...state,
        fetchNFTs,
        setCategory,
        selectNFT,
        openTransferModal,
        closeTransferModal,
        transferNFT,
        getRarityStyle,
        getCategoryInfo,
        getTotalNFTCount,
        getCategoryCount,
        filterByRarity,
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