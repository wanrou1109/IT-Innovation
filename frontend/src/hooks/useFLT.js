import { createContext, useContext, useReducer, useEffect } from 'react';

// FLT 狀態初始值
const initialState = {
    balance: 0,
    transactions: [],
    loading: false,
    error: null,
    stakingInfo: {
        totalStaked: 0,
        rewards: 0,
        stakingHistory: []
    },
    exchangeRate: {
        fltToUsd: 0.85,
        fltToEth: 0.0003,
        lastUpdated: new Date()
    }
};

// Action 類型
const FLT_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_BALANCE: 'SET_BALANCE',
    ADD_TRANSACTION: 'ADD_TRANSACTION',
    SET_TRANSACTIONS: 'SET_TRANSACTIONS',
    STAKE_TOKENS: 'STAKE_TOKENS',
    UNSTAKE_TOKENS: 'UNSTAKE_TOKENS',
    CLAIM_REWARDS: 'CLAIM_REWARDS',
    UPDATE_EXCHANGE_RATE: 'UPDATE_EXCHANGE_RATE'
};

// Reducer 函數
const fltReducer = (state, action) => {
    switch (action.type) {
        case FLT_ACTIONS.SET_LOADING:
        return {
            ...state,
            loading: action.payload
        };
        
        case FLT_ACTIONS.SET_ERROR:
        return {
            ...state,
            error: action.payload,
            loading: false
        };
        
        case FLT_ACTIONS.SET_BALANCE:
        return {
            ...state,
            balance: action.payload,
            loading: false
        };
        
        case FLT_ACTIONS.ADD_TRANSACTION:
        return {
            ...state,
            transactions: [action.payload, ...state.transactions],
            balance: action.payload.type === 'send' 
            ? state.balance - action.payload.amount 
            : state.balance + action.payload.amount
        };
        
        case FLT_ACTIONS.SET_TRANSACTIONS:
        return {
            ...state,
            transactions: action.payload
        };
        
        case FLT_ACTIONS.STAKE_TOKENS:
        const stakeAmount = action.payload;
        return {
            ...state,
            balance: state.balance - stakeAmount,
            stakingInfo: {
            ...state.stakingInfo,
            totalStaked: state.stakingInfo.totalStaked + stakeAmount,
            stakingHistory: [
                ...state.stakingInfo.stakingHistory,
                {
                id: Date.now(),
                type: 'stake',
                amount: stakeAmount,
                timestamp: new Date(),
                status: 'completed'
                }
            ]
            }
        };
        
        case FLT_ACTIONS.UNSTAKE_TOKENS:
        const unstakeAmount = action.payload;
        return {
            ...state,
            balance: state.balance + unstakeAmount,
            stakingInfo: {
            ...state.stakingInfo,
            totalStaked: state.stakingInfo.totalStaked - unstakeAmount,
            stakingHistory: [
                ...state.stakingInfo.stakingHistory,
                {
                id: Date.now(),
                type: 'unstake',
                amount: unstakeAmount,
                timestamp: new Date(),
                status: 'completed'
                }
            ]
            }
        };
        
        case FLT_ACTIONS.CLAIM_REWARDS:
        const rewards = state.stakingInfo.rewards;
        return {
            ...state,
            balance: state.balance + rewards,
            stakingInfo: {
            ...state.stakingInfo,
            rewards: 0,
            stakingHistory: [
                ...state.stakingInfo.stakingHistory,
                {
                id: Date.now(),
                type: 'claim_rewards',
                amount: rewards,
                timestamp: new Date(),
                status: 'completed'
                }
            ]
            }
        };
        
        case FLT_ACTIONS.UPDATE_EXCHANGE_RATE:
        return {
            ...state,
            exchangeRate: {
            ...action.payload,
            lastUpdated: new Date()
            }
        };
        
        default:
        return state;
    }
};

// Context 創建
const FLTContext = createContext();

// Provider 組件
export const FLTProvider = ({ children }) => {
    const [state, dispatch] = useReducer(fltReducer, initialState);

    // 獲取 FLT 餘額
    const fetchBalance = async (address) => {
        dispatch({ type: FLT_ACTIONS.SET_LOADING, payload: true });
        
        try {
        // 模擬 API 調用 - 之後替換為實際的智能合約查詢
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockBalance = 1250; // 模擬餘額
        
        dispatch({ 
            type: FLT_ACTIONS.SET_BALANCE, 
            payload: mockBalance 
        });
        
        } catch (error) {
        dispatch({ 
            type: FLT_ACTIONS.SET_ERROR, 
            payload: error.message 
        });
        }
    };

    // 發送 FLT 代幣
    const sendTokens = async (toAddress, amount, purpose = 'transfer') => {
        if (amount > state.balance) {
        throw new Error('Insufficient balance');
        }
        
        try {
        dispatch({ type: FLT_ACTIONS.SET_LOADING, payload: true });
        
        // 模擬轉賬交易 - 之後替換為實際的智能合約調用
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transaction = {
            id: Date.now(),
            type: 'send',
            amount: amount,
            to: toAddress,
            purpose: purpose,
            timestamp: new Date(),
            status: 'completed',
            hash: `0x${Math.random().toString(16).substr(2, 64)}`
        };
        
        dispatch({ 
            type: FLT_ACTIONS.ADD_TRANSACTION, 
            payload: transaction 
        });
        
        return transaction;
        
        } catch (error) {
        dispatch({ 
            type: FLT_ACTIONS.SET_ERROR, 
            payload: error.message 
        });
        throw error;
        }
    };

    // 接收 FLT 代幣
    const receiveTokens = (fromAddress, amount, purpose = 'received') => {
        const transaction = {
        id: Date.now(),
        type: 'receive',
        amount: amount,
        from: fromAddress,
        purpose: purpose,
        timestamp: new Date(),
        status: 'completed',
        hash: `0x${Math.random().toString(16).substr(2, 64)}`
        };
        
        dispatch({ 
        type: FLT_ACTIONS.ADD_TRANSACTION, 
        payload: transaction 
        });
        
        return transaction;
    };

    // 質押 FLT 代幣
    const stakeTokens = async (amount) => {
        if (amount > state.balance) {
        throw new Error('Insufficient balance for staking');
        }
        
        try {
        dispatch({ type: FLT_ACTIONS.SET_LOADING, payload: true });
        
        // 模擬質押交易
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        dispatch({ 
            type: FLT_ACTIONS.STAKE_TOKENS, 
            payload: amount 
        });
        
        // 添加交易記錄
        const transaction = {
            id: Date.now(),
            type: 'stake',
            amount: amount,
            purpose: 'staking',
            timestamp: new Date(),
            status: 'completed'
        };
        
        dispatch({ 
            type: FLT_ACTIONS.ADD_TRANSACTION, 
            payload: transaction 
        });
        
        return true;
        
        } catch (error) {
        dispatch({ 
            type: FLT_ACTIONS.SET_ERROR, 
            payload: error.message 
        });
        throw error;
        }
    };

    // 取消質押
    const unstakeTokens = async (amount) => {
        if (amount > state.stakingInfo.totalStaked) {
        throw new Error('Insufficient staked amount');
        }
        
        try {
        dispatch({ type: FLT_ACTIONS.SET_LOADING, payload: true });
        
        // 模擬取消質押交易
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        dispatch({ 
            type: FLT_ACTIONS.UNSTAKE_TOKENS, 
            payload: amount 
        });
        
        return true;
        
        } catch (error) {
        dispatch({ 
            type: FLT_ACTIONS.SET_ERROR, 
            payload: error.message 
        });
        throw error;
        }
    };

    // 領取質押獎勵
    const claimRewards = async () => {
        if (state.stakingInfo.rewards <= 0) {
        throw new Error('No rewards to claim');
        }
        
        try {
        dispatch({ type: FLT_ACTIONS.SET_LOADING, payload: true });
        
        // 模擬領取獎勵交易
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch({ type: FLT_ACTIONS.CLAIM_REWARDS });
        
        return true;
        
        } catch (error) {
        dispatch({ 
            type: FLT_ACTIONS.SET_ERROR, 
            payload: error.message 
        });
        throw error;
        }
    };

    // 格式化 FLT 金額
    const formatFLT = (amount, decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
        }).format(amount);
    };

    // 轉換為美元
    const convertToUSD = (fltAmount) => {
        return fltAmount * state.exchangeRate.fltToUsd;
    };

    // 轉換為 ETH
    const convertToETH = (fltAmount) => {
        return fltAmount * state.exchangeRate.fltToEth;
    };

    // 獲取交易歷史
    const getTransactionHistory = (limit = 20) => {
        return state.transactions.slice(0, limit);
    };

    // 計算年化收益率 (APY)
    const calculateAPY = () => {
        // 模擬 APY 計算
        return 12.5; // 12.5%
    };

    // 更新匯率
    const updateExchangeRate = () => {
        // 模擬匯率更新
        const mockRates = {
        fltToUsd: 0.85 + (Math.random() - 0.5) * 0.1, // 0.80-0.90 之間波動
        fltToEth: 0.0003 + (Math.random() - 0.5) * 0.0001 // 小幅波動
        };
        
        dispatch({ 
        type: FLT_ACTIONS.UPDATE_EXCHANGE_RATE, 
        payload: mockRates 
        });
    };

    // 模擬獎勵累積
    const simulateRewardsAccumulation = () => {
        if (state.stakingInfo.totalStaked > 0) {
        const dailyRewardRate = 0.0003; // 0.03% 日收益
        const newRewards = state.stakingInfo.totalStaked * dailyRewardRate;
        
        dispatch({
            type: FLT_ACTIONS.UPDATE_STAKING_REWARDS,
            payload: state.stakingInfo.rewards + newRewards
        });
        }
    };

    // 組件掛載時初始化
    useEffect(() => {
        // 定期更新匯率
        const rateInterval = setInterval(updateExchangeRate, 30000); // 每30秒更新
        
        // 定期累積獎勵
        const rewardInterval = setInterval(simulateRewardsAccumulation, 60000); // 每分鐘累積
        
        return () => {
        clearInterval(rateInterval);
        clearInterval(rewardInterval);
        };
    }, [state.stakingInfo.totalStaked]);

    const value = {
        ...state,
        fetchBalance,
        sendTokens,
        receiveTokens,
        stakeTokens,
        unstakeTokens,
        claimRewards,
        formatFLT,
        convertToUSD,
        convertToETH,
        getTransactionHistory,
        calculateAPY,
        updateExchangeRate
    };

    return (
        <FLTContext.Provider value={value}>
        {children}
        </FLTContext.Provider>
    );
};

    // Hook 使用
    export const useFLT = () => {
    const context = useContext(FLTContext);
    if (!context) {
        throw new Error('useFLT must be used within an FLTProvider');
    }
    return context;
};