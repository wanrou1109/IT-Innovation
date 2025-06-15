import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './constants';

// ========== FLT 代幣配置 ==========

// FLT 代幣合約地址 (Sepolia)
export const FLT_TOKEN_ADDRESS = process.env.REACT_APP_FLT_TOKEN_ADDRESS || '0x8fAC18B399599c92C650DbbeeceC9885DEf08aDE';

// FLT ERC20 ABI（標準 ERC20）
export const FLT_TOKEN_ABI = [
  {"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}
];

/**
 * 檢查是否安裝了 MetaMask
 * @returns {boolean} 是否安裝 MetaMask
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * 獲取當前網絡 ID
 * @returns {Promise<number>} 網絡 ID
 */
export const getCurrentChainId = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Error getting chain ID:', error);
    throw error;
  }
};

/**
 * 切換網絡
 * @param {number} chainId - 目標網絡 ID
 * @returns {Promise<boolean>} 切換是否成功
 */
export const switchNetwork = async (chainId) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error) {
    // 如果網絡不存在，嘗試添加網絡
    if (error.code === 4902) {
      return await addNetwork(chainId);
    }
    console.error('Error switching network:', error);
    throw error;
  }
};

/**
 * 添加新網絡
 * @param {number} chainId - 網絡 ID
 * @returns {Promise<boolean>} 添加是否成功
 */
export const addNetwork = async (chainId) => {
  const networkConfig = Object.values(NETWORK_CONFIG).find(
    config => config.chainId === chainId
  );
  
  if (!networkConfig) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainId.toString(16)}`,
        chainName: networkConfig.name,
        rpcUrls: [networkConfig.rpcUrl],
        blockExplorerUrls: [networkConfig.blockExplorer]
      }],
    });
    return true;
  } catch (error) {
    console.error('Error adding network:', error);
    throw error;
  }
};

/**
 * 連接錢包
 * @returns {Promise<string[]>} 錢包地址數組
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    return accounts;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    
    throw error;
  }
};

/**
 * 獲取錢包餘額
 * @param {string} address - 錢包地址
 * @returns {Promise<string>} ETH 餘額 (wei)
 */
export const getBalance = async (address) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    return balance;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

/**
 * Wei 轉換為 ETH
 * @param {string} wei - Wei 金額
 * @returns {number} ETH 金額
 */
export const weiToEth = (wei) => {
  if (!wei) return 0;
  return parseInt(wei, 16) / Math.pow(10, 18);
};

/**
 * ETH 轉換為 Wei
 * @param {number} eth - ETH 金額
 * @returns {string} Wei 金額
 */
export const ethToWei = (eth) => {
  return (eth * Math.pow(10, 18)).toString(16);
};

/**
 * 驗證錢包地址格式
 * @param {string} address - 錢包地址
 * @returns {boolean} 地址是否有效
 */
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // 檢查是否為 42 個字符的十六進制地址 (包含 0x 前綴)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * 將地址轉換為校驗和格式
 * @param {string} address - 錢包地址
 * @returns {string} 校驗和格式的地址
 */
export const toChecksumAddress = (address) => {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address format');
  }
  
  // 簡化的校驗和實現 (實際應該使用 Web3.js 或 ethers.js)
  const lowerCaseAddress = address.toLowerCase().replace('0x', '');
  let checksumAddress = '0x';
  
  for (let i = 0; i < lowerCaseAddress.length; i++) {
    // 簡化邏輯，實際應該使用 Keccak-256 哈希
    checksumAddress += Math.random() > 0.5 
      ? lowerCaseAddress[i].toUpperCase() 
      : lowerCaseAddress[i];
  }
  
  return checksumAddress;
};

/**
 * 格式化交易哈希供區塊瀏覽器查看
 * @param {string} hash - 交易哈希
 * @param {number} chainId - 網絡 ID
 * @returns {string} 區塊瀏覽器 URL
 */
export const getExplorerUrl = (hash, chainId = 1) => {
  const networkConfig = Object.values(NETWORK_CONFIG).find(
    config => config.chainId === chainId
  );
  
  if (!networkConfig) {
    return `https://etherscan.io/tx/${hash}`;
  }
  
  return `${networkConfig.blockExplorer}/tx/${hash}`;
};

/**
 * 獲取地址的區塊瀏覽器 URL
 * @param {string} address - 錢包地址
 * @param {number} chainId - 網絡 ID
 * @returns {string} 區塊瀏覽器 URL
 */
export const getAddressExplorerUrl = (address, chainId = 1) => {
  const networkConfig = Object.values(NETWORK_CONFIG).find(
    config => config.chainId === chainId
  );
  
  if (!networkConfig) {
    return `https://etherscan.io/address/${address}`;
  }
  
  return `${networkConfig.blockExplorer}/address/${address}`;
};

/**
 * 估算 Gas 費用
 * @param {object} transaction - 交易對象
 * @returns {Promise<string>} 估算的 Gas 數量
 */
export const estimateGas = async (transaction) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const gasEstimate = await window.ethereum.request({
      method: 'eth_estimateGas',
      params: [transaction]
    });
    
    return gasEstimate;
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
};

/**
 * 獲取當前 Gas 價格
 * @returns {Promise<string>} Gas 價格 (wei)
 */
export const getGasPrice = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const gasPrice = await window.ethereum.request({
      method: 'eth_gasPrice'
    });
    
    return gasPrice;
  } catch (error) {
    console.error('Error getting gas price:', error);
    throw error;
  }
};

/**
 * 發送交易
 * @param {object} transaction - 交易對象
 * @returns {Promise<string>} 交易哈希
 */
export const sendTransaction = async (transaction) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transaction]
    });
    
    return txHash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    
    if (error.code === 4001) {
      throw new Error('User rejected the transaction');
    }
    
    throw error;
  }
};

/**
 * 獲取交易收據
 * @param {string} txHash - 交易哈希
 * @returns {Promise<object>} 交易收據
 */
export const getTransactionReceipt = async (txHash) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const receipt = await window.ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    });
    
    return receipt;
  } catch (error) {
    console.error('Error getting transaction receipt:', error);
    throw error;
  }
};

/**
 * 等待交易確認
 * @param {string} txHash - 交易哈希
 * @param {number} confirmations - 需要的確認數
 * @returns {Promise<object>} 交易收據
 */
export const waitForTransaction = async (txHash, confirmations = 1) => {
  return new Promise((resolve, reject) => {
    const checkReceipt = async () => {
      try {
        const receipt = await getTransactionReceipt(txHash);
        
        if (receipt && receipt.blockNumber) {
          const currentBlock = await window.ethereum.request({
            method: 'eth_blockNumber'
          });
          
          const confirmationCount = parseInt(currentBlock, 16) - parseInt(receipt.blockNumber, 16);
          
          if (confirmationCount >= confirmations) {
            resolve(receipt);
          } else {
            setTimeout(checkReceipt, 2000); // 每 2 秒檢查一次
          }
        } else {
          setTimeout(checkReceipt, 2000);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkReceipt();
  });
};

/**
 * 監聽錢包事件
 * @param {function} onAccountsChanged - 賬戶變更回調
 * @param {function} onChainChanged - 網絡變更回調
 */
export const setupWalletListeners = (onAccountsChanged, onChainChanged) => {
  if (!isMetaMaskInstalled()) return;
  
  if (onAccountsChanged) {
    window.ethereum.on('accountsChanged', onAccountsChanged);
  }
  
  if (onChainChanged) {
    window.ethereum.on('chainChanged', (chainId) => {
      onChainChanged(parseInt(chainId, 16));
    });
  }
};

/**
 * 清理錢包事件監聽器
 */
export const removeWalletListeners = () => {
  if (!isMetaMaskInstalled()) return;
  
  window.ethereum.removeAllListeners('accountsChanged');
  window.ethereum.removeAllListeners('chainChanged');
};

/**
 * 檢查是否在支持的網絡
 * @param {number} chainId - 當前網絡 ID
 * @returns {boolean} 是否支持
 */
export const isSupportedNetwork = (chainId) => {
  const supportedChains = [
    '0xaa36a7', // Sepolia (11155111)
    '0x7A69',   // Localhost (31337) - 開發用
  ];
  return supportedChains.includes(chainId);
};

/**
 * 獲取合約地址
 * @param {string} contractName - 合約名稱
 * @param {number} chainId - 網絡 ID
 * @returns {string} 合約地址
 */
export const getContractAddress = (contractName, chainId = 1) => {
  // 在實際應用中，可能需要根據網絡返回不同的合約地址
  return CONTRACT_ADDRESSES[contractName.toUpperCase()];
};

// 模擬合約調用 (實際應該使用 Web3.js 或 ethers.js)
export const simulateContractCall = async (contractAddress, method, params = []) => {
  // 模擬延遲
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模擬不同的返回值
  switch (method) {
    case 'balanceOf':
      return '1250000000000000000000'; // 1250 FLT (18 decimals)
    case 'totalSupply':
      return '1000000000000000000000000000'; // 1B FLT
    case 'transfer':
      return '0x' + Math.random().toString(16).substr(2, 64); // 模擬交易哈希
    default:
      return null;
  }
};

// ========== 區塊鏈互動工具 ==========

// 1. 載入 ABI（自動貼上）
export const CONCERT_TICKET_NFT_ABI = [
  {"type":"constructor","inputs":[{"name":"_verificationRegistry","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"MAX_TRANSFER_COUNT","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"MIN_PURCHASE_INTERVAL","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"PLATFORM_FEE","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"approve","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"balanceOf","inputs":[{"name":"owner","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"buyResaleTicket","inputs":[{"name":"orderId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"payable"},
  {"type":"function","name":"cancelResaleOrder","inputs":[{"name":"orderId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"concertLimits","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"perWallet","type":"uint256","internalType":"uint256"},{"name":"perIdentity","type":"uint256","internalType":"uint256"},{"name":"timeWindow","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"concerts","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"id","type":"uint256","internalType":"uint256"},{"name":"name","type":"string","internalType":"string"},{"name":"artist","type":"string","internalType":"string"},{"name":"venue","type":"string","internalType":"string"},{"name":"date","type":"uint256","internalType":"uint256"},{"name":"totalTickets","type":"uint256","internalType":"uint256"},{"name":"soldTickets","type":"uint256","internalType":"uint256"},{"name":"originalPrice","type":"uint256","internalType":"uint256"},{"name":"maxResalePrice","type":"uint256","internalType":"uint256"},{"name":"resaleCooldown","type":"uint256","internalType":"uint256"},{"name":"organizer","type":"address","internalType":"address"},{"name":"transferEnabled","type":"bool","internalType":"bool"},{"name":"whitelistOnly","type":"bool","internalType":"bool"},{"name":"isActive","type":"bool","internalType":"bool"},{"name":"minVerificationLevel","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},
  {"type":"function","name":"createConcert","inputs":[{"name":"_name","type":"string","internalType":"string"},{"name":"_artist","type":"string","internalType":"string"},{"name":"_venue","type":"string","internalType":"string"},{"name":"_date","type":"uint256","internalType":"uint256"},{"name":"_totalTickets","type":"uint256","internalType":"uint256"},{"name":"_originalPrice","type":"uint256","internalType":"uint256"},{"name":"_resaleCooldown","type":"uint256","internalType":"uint256"},{"name":"_whitelistOnly","type":"bool","internalType":"bool"},{"name":"_minVerificationLevel","type":"uint8","internalType":"uint8"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"emergencyWithdraw","inputs":[{"name":"concertId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"getActiveResaleOrders","inputs":[{"name":"limit","type":"uint256","internalType":"uint256"},{"name":"offset","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"orders","type":"tuple[]","internalType":"struct ConcertTicketNFT.ResaleOrder[]","components":[{"name":"ticketId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"listTime","type":"uint256","internalType":"uint256"},{"name":"deadline","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"getApproved","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"getConcertDetails","inputs":[{"name":"concertId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"name","type":"string","internalType":"string"},{"name":"artist","type":"string","internalType":"string"},{"name":"venue","type":"string","internalType":"string"},{"name":"date","type":"uint256","internalType":"uint256"},{"name":"originalPrice","type":"uint256","internalType":"uint256"},{"name":"maxResalePrice","type":"uint256","internalType":"uint256"},{"name":"soldTickets","type":"uint256","internalType":"uint256"},{"name":"totalTickets","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"getTicketDetails","inputs":[{"name":"ticketId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"concertId","type":"uint256","internalType":"uint256"},{"name":"seatNumber","type":"uint256","internalType":"uint256"},{"name":"seatSection","type":"string","internalType":"string"},{"name":"originalBuyer","type":"address","internalType":"address"},{"name":"currentOwner","type":"address","internalType":"address"},{"name":"isUsed","type":"bool","internalType":"bool"},{"name":"transferCount","type":"uint8","internalType":"uint8"},{"name":"originalPrice","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"getUserTickets","inputs":[{"name":"user","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256[]","internalType":"uint256[]"}],"stateMutability":"view"},
  {"type":"function","name":"identityPurchaseCount","inputs":[{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"bytes32","internalType":"bytes32"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"isApprovedForAll","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"operator","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"lastPurchaseTime","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"listTicketForSale","inputs":[{"name":"ticketId","type":"uint256","internalType":"uint256"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"deadline","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"ownerOf","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"pause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"paused","inputs":[],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"purchaseCount","inputs":[{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"purchaseTicket","inputs":[{"name":"concertId","type":"uint256","internalType":"uint256"},{"name":"seatNumber","type":"uint256","internalType":"uint256"},{"name":"seatSection","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"resaleOrders","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"ticketId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"listTime","type":"uint256","internalType":"uint256"},{"name":"deadline","type":"uint256","internalType":"uint256"},{"name":"isActive","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"data","type":"bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"setApprovalForAll","inputs":[{"name":"operator","type":"address","internalType":"address"},{"name":"approved","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"setPurchaseLimits","inputs":[{"name":"concertId","type":"uint256","internalType":"uint256"},{"name":"_perWallet","type":"uint256","internalType":"uint256"},{"name":"_perIdentity","type":"uint256","internalType":"uint256"},{"name":"_timeWindow","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"supportsInterface","inputs":[{"name":"interfaceId","type":"bytes4","internalType":"bytes4"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"tickets","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"concertId","type":"uint256","internalType":"uint256"},{"name":"seatNumber","type":"uint256","internalType":"uint256"},{"name":"seatSection","type":"string","internalType":"string"},{"name":"originalBuyer","type":"address","internalType":"address"},{"name":"purchaseTime","type":"uint256","internalType":"uint256"},{"name":"originalPrice","type":"uint256","internalType":"uint256"},{"name":"identityHash","type":"bytes32","internalType":"bytes32"},{"name":"isUsed","type":"bool","internalType":"bool"},{"name":"transferCount","type":"uint8","internalType":"uint8"},{"name":"isRefundable","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"toggleConcert","inputs":[{"name":"concertId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"tokenURI","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"unpause","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"updateConcertSettings","inputs":[{"name":"concertId","type":"uint256","internalType":"uint256"},{"name":"_maxResalePrice","type":"uint256","internalType":"uint256"},{"name":"_transferEnabled","type":"bool","internalType":"bool"},{"name":"_minVerificationLevel","type":"uint8","internalType":"uint8"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"updateVerificationRegistry","inputs":[{"name":"newRegistry","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"useTicket","inputs":[{"name":"ticketId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"userTickets","inputs":[{"name":"","type":"address","internalType":"address"},{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"verificationRegistry","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract VerificationRegistry"}],"stateMutability":"view"},
  {"type":"function","name":"fltToken","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IERC20"}],"stateMutability":"view"},
  {"type":"function","name":"verifyTicketForEntry","inputs":[{"name":"ticketId","type":"uint256","internalType":"uint256"},{"name":"identityHash","type":"bytes32","internalType":"bytes32"},{"name":"signature","type":"bytes","internalType":"bytes"}],"outputs":[{"name":"isValid","type":"bool","internalType":"bool"},{"name":"reason","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"withdrawPlatformFees","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"event","name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"approved","type":"address","indexed":true,"internalType":"address"},{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"ApprovalForAll","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"operator","type":"address","indexed":true,"internalType":"address"},{"name":"approved","type":"bool","indexed":false,"internalType":"bool"}],"anonymous":false},
  {"type":"event","name":"BatchMetadataUpdate","inputs":[{"name":"_fromTokenId","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"_toTokenId","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"ConcertCreated","inputs":[{"name":"concertId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"name","type":"string","indexed":false,"internalType":"string"},{"name":"organizer","type":"address","indexed":true,"internalType":"address"},{"name":"totalTickets","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"ConcertStatusChanged","inputs":[{"name":"concertId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"isActive","type":"bool","indexed":false,"internalType":"bool"}],"anonymous":false},
  {"type":"event","name":"EmergencyWithdrawal","inputs":[{"name":"organizer","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"MetadataUpdate","inputs":[{"name":"_tokenId","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"OwnershipTransferred","inputs":[{"name":"previousOwner","type":"address","indexed":true,"internalType":"address"},{"name":"newOwner","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"Paused","inputs":[{"name":"account","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"TicketListed","inputs":[{"name":"orderId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"ticketId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"seller","type":"address","indexed":true,"internalType":"address"}],"anonymous":false},
  {"type":"event","name":"TicketMinted","inputs":[{"name":"ticketId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"concertId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"buyer","type":"address","indexed":true,"internalType":"address"},{"name":"seatNumber","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"seatSection","type":"string","indexed":false,"internalType":"string"}],"anonymous":false},
  {"type":"event","name":"TicketSold","inputs":[{"name":"orderId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"ticketId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"buyer","type":"address","indexed":true,"internalType":"address"},{"name":"price","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"TicketUsed","inputs":[{"name":"ticketId","type":"uint256","indexed":true,"internalType":"uint256"},{"name":"timestamp","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"Transfer","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":"tokenId","type":"uint256","indexed":true,"internalType":"uint256"}],"anonymous":false},
  {"type":"event","name":"Unpaused","inputs":[{"name":"account","type":"address","indexed":false,"internalType":"address"}],"anonymous":false},
  {"type":"error","name":"ECDSAInvalidSignature","inputs":[]},
  {"type":"error","name":"ECDSAInvalidSignatureLength","inputs":[{"name":"length","type":"uint256","internalType":"uint256"}]},
  {"type":"error","name":"ECDSAInvalidSignatureS","inputs":[{"name":"s","type":"bytes32","internalType":"bytes32"}]},
  {"type":"error","name":"ERC721IncorrectOwner","inputs":[{"name":"sender","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"owner","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC721InsufficientApproval","inputs":[{"name":"operator","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}]},
  {"type":"error","name":"ERC721InvalidApprover","inputs":[{"name":"approver","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC721InvalidOperator","inputs":[{"name":"operator","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC721InvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC721InvalidReceiver","inputs":[{"name":"receiver","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC721InvalidSender","inputs":[{"name":"sender","type":"address","internalType":"address"}]},
  {"type":"error","name":"ERC721NonexistentToken","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}]},
  {"type":"error","name":"EnforcedPause","inputs":[]},
  {"type":"error","name":"ExpectedPause","inputs":[]},
  {"type":"error","name":"OwnableInvalidOwner","inputs":[{"name":"owner","type":"address","internalType":"address"}]},
  {"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"name":"account","type":"address","internalType":"address"}]},
  {"type":"error","name":"ReentrancyGuardReentrantCall","inputs":[]}
];

// 2. 合約地址（這裡用 constants.js 的 NFT_CONTRACT）
export const CONCERT_TICKET_NFT_ADDRESS = CONTRACT_ADDRESSES.NFT_CONTRACT;

// 3. 建立 provider
export function getProvider() {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('請安裝 MetaMask 或其他以太坊錢包');
}

// 4. 取得 signer（用戶錢包）
export async function getSigner() {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);
  return await provider.getSigner();
}

// 5. 建立合約實例
export async function getConcertTicketNFTContract() {
  const signer = await getSigner();
  return new ethers.Contract(
    CONCERT_TICKET_NFT_ADDRESS,
    CONCERT_TICKET_NFT_ABI,
    signer
  );
}

// ========== 合約資料讀取與格式化工具 ==========

/**
 * 讀取所有演唱會資料
 */
export async function getAllConcerts() {
  try {
    const contract = await getConcertTicketNFTContract();
    const concerts = [];
    
    // 從 concertId 1 開始讀取，直到找不到為止
    let concertId = 1;
    while (true) {
      try {
        const concertData = await contract.getConcertDetails(concertId);
        
        // 如果演唱會名稱為空，表示不存在
        if (!concertData[0]) break;
        
        const [name, artist, venue, date, originalPrice, maxResalePrice, soldTickets, totalTickets, isActive] = concertData;
        
        concerts.push({
          id: concertId,
          title: name,
          artist: artist,
          venue: venue,
          date: new Date(Number(date) * 1000).toISOString().split('T')[0], // 轉換 timestamp 為日期
          time: '19:00', // 預設時間，可以後續從合約擴展
          image: '/api/placeholder/400/250', // 預設圖片
          price: {
            flt: Number(originalPrice) / 1e18, // 從 wei 轉換為 ETH
            usd: Math.round(Number(originalPrice) / 1e18 * 2000) // 假設 1 ETH = 2000 USD
          },
          totalTickets: Number(totalTickets),
          soldTickets: Number(soldTickets),
          maxResalePrice: Number(maxResalePrice) / 1e18,
          status: isActive ? 'on_sale' : 'cancelled',
          description: `Experience the electrifying performance of ${artist}.`,
          category: 'concert',
          isPrimary: true,
          ticketTypes: [
            {
              type: 'General',
              price: Number(originalPrice) / 1e18,
              available: Number(totalTickets) - Number(soldTickets),
              benefits: ['Standard seating', 'Digital program', 'Participation NFT']
            }
          ]
        });
        
        concertId++;
      } catch (error) {
        // 如果讀取失敗，可能是 concertId 不存在
        break;
      }
    }
    
    return concerts;
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return [];
  }
}

/**
 * 備用方法：通過 balanceOf 和 tokenOfOwnerByIndex 獲取用戶票券
 */
export async function getUserTicketsByBalance(userAddress) {
  try {
    const contract = await getConcertTicketNFTContract();
    
    // 獲取用戶擁有的 NFT 數量
    const balance = await contract.balanceOf(userAddress);
    const balanceNumber = Number(balance);
    
    console.log(`User ${userAddress} has ${balanceNumber} NFTs`);
    
    if (balanceNumber === 0) {
      return [];
    }
    
    const tickets = [];
    
    // 遍歷用戶的每個 NFT
    for (let i = 0; i < balanceNumber; i++) {
      try {
        console.log(`Getting token at index ${i}...`);
        
        // 嘗試使用 tokenOfOwnerByIndex (ERC721Enumerable)
        let tokenId;
        try {
          tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
          console.log(`tokenOfOwnerByIndex(${i}) = ${tokenId}`);
        } catch (enumerableError) {
          console.warn(`tokenOfOwnerByIndex failed:`, enumerableError);
          // 如果沒有 enumerable，直接嘗試 token ID 1
          if (i === 0) {
            const owner = await contract.ownerOf(1);
            if (owner.toLowerCase() === userAddress.toLowerCase()) {
              tokenId = 1;
              console.log(`Using direct token ID 1 as fallback`);
            } else {
              console.log(`Token 1 is owned by ${owner}, not ${userAddress}`);
              continue;
            }
          } else {
            continue;
          }
        }
        
        const ticketIdNumber = Number(tokenId);
        console.log(`Processing ticket ID: ${ticketIdNumber}`);
        
        // 獲取票券詳情
        let ticketDetails;
        try {
          ticketDetails = await contract.getTicketDetails(ticketIdNumber);
          console.log(`Ticket details:`, ticketDetails);
        } catch (ticketError) {
          console.error(`getTicketDetails(${ticketIdNumber}) failed:`, ticketError);
          continue;
        }
        
        const [concertId, seatNumber, seatSection, , , isUsed, transferCount, originalPrice] = ticketDetails;
        console.log(`Concert ID: ${concertId}, Seat: ${seatNumber}, Section: ${seatSection}`);
        
        // 獲取演唱會詳情
        let concertData;
        try {
          concertData = await contract.getConcertDetails(Number(concertId));
          console.log(`Concert details:`, concertData);
        } catch (concertError) {
          console.error(`getConcertDetails(${concertId}) failed:`, concertError);
          // 使用默認值繼續
          concertData = ['Unknown Concert', 'Unknown Artist', 'Unknown Venue', Math.floor(Date.now() / 1000)];
        }
        
        const [name, artist, venue, date] = concertData;
        
        const ticket = {
          id: ticketIdNumber,
          event: name,
          artist: artist,
          venue: venue,
          date: new Date(Number(date) * 1000).toISOString().split('T')[0],
          time: '19:00',
          type: 'General',
          price: Number(originalPrice) / 1e18,
          seatNumber: Number(seatNumber),
          seatSection: seatSection,
          qrCode: `QR${ticketIdNumber}`,
          image: '/api/placeholder/400/250',
          resellable: !isUsed && Number(transferCount) < 3,
          purchaseTime: new Date().toISOString(),
          status: isUsed ? 'used' : 'valid',
          isUsed: isUsed,
          transferCount: Number(transferCount)
        };
        
        console.log(`Successfully created ticket:`, ticket);
        tickets.push(ticket);
        
      } catch (error) {
        console.error(`Error fetching ticket at index ${i}:`, error);
      }
    }
    
    console.log(`Total tickets found: ${tickets.length}`);
    return tickets;
  } catch (error) {
    console.error('Error fetching user tickets by balance:', error);
    return [];
  }
}

/**
 * 調試函數：直接檢查特定 token ID 的擁有者
 */
export async function checkTokenOwnership(tokenId, userAddress) {
  try {
    const contract = await getConcertTicketNFTContract();
    
    // 檢查 token 是否存在
    const owner = await contract.ownerOf(tokenId);
    console.log(`Token ${tokenId} is owned by: ${owner}`);
    console.log(`User address: ${userAddress}`);
    console.log(`Addresses match: ${owner.toLowerCase() === userAddress.toLowerCase()}`);
    
    if (owner.toLowerCase() === userAddress.toLowerCase()) {
      // 獲取票券詳情
      const ticketDetails = await contract.getTicketDetails(tokenId);
      console.log('Ticket details:', ticketDetails);
      
      // 獲取演唱會詳情
      const [concertId] = ticketDetails;
      const concertData = await contract.getConcertDetails(Number(concertId));
      console.log('Concert details:', concertData);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking token ${tokenId} ownership:`, error);
    return false;
  }
}

/**
 * 獲取用戶票券（優先使用合約的 getUserTickets 方法）
 */
export async function getUserTickets(userAddress) {
  try {
    console.log(`Fetching tickets for user: ${userAddress}`);
    const contract = await getConcertTicketNFTContract();
    
    // 首先嘗試使用合約的 getUserTickets 方法
    try {
      console.log('Calling contract.getUserTickets...');
    const ticketIds = await contract.getUserTickets(userAddress);
      console.log('Received ticket IDs:', ticketIds);
      
    const tickets = [];
    
    for (const ticketId of ticketIds) {
      try {
          const ticketIdNumber = Number(ticketId);
          console.log(`Processing ticket ID: ${ticketIdNumber}`);
          
          // 獲取票券詳情
          const ticketDetails = await contract.getTicketDetails(ticketIdNumber);
          console.log(`Ticket details for ${ticketIdNumber}:`, ticketDetails);
          
        const [concertId, seatNumber, seatSection, , , isUsed, transferCount, originalPrice] = ticketDetails;
        
        // 獲取演唱會詳情
          let concertData;
          try {
            concertData = await contract.getConcertDetails(Number(concertId));
            console.log(`Concert details for ${concertId}:`, concertData);
          } catch (concertError) {
            console.error(`getConcertDetails(${concertId}) failed:`, concertError);
            // 使用默認值繼續
            concertData = ['Unknown Concert', 'Unknown Artist', 'Unknown Venue', Math.floor(Date.now() / 1000)];
          }
          
        const [name, artist, venue, date] = concertData;
        
          const ticket = {
            id: ticketIdNumber,
          event: name,
          artist: artist,
          venue: venue,
          date: new Date(Number(date) * 1000).toISOString().split('T')[0],
          time: '19:00',
          type: 'General',
          price: Number(originalPrice) / 1e18,
          seatNumber: Number(seatNumber),
          seatSection: seatSection,
            qrCode: `QR${ticketIdNumber}`,
          image: '/api/placeholder/400/250',
            resellable: !isUsed && Number(transferCount) < 3,
            purchaseTime: new Date().toISOString(),
          status: isUsed ? 'used' : 'valid',
          isUsed: isUsed,
          transferCount: Number(transferCount)
          };
          
          console.log(`Successfully processed ticket:`, ticket);
          tickets.push(ticket);
          
      } catch (error) {
          console.error(`Error processing ticket ${ticketId}:`, error);
      }
    }
    
      console.log(`getUserTickets method returned ${tickets.length} tickets`);
      if (tickets.length > 0) {
    return tickets;
      }
    } catch (getUserTicketsError) {
      console.error('contract.getUserTickets failed:', getUserTicketsError);
    }
    
    // 如果 getUserTickets 方法失敗，嘗試直接遍歷方法
    console.log('Trying direct iteration method...');
    return await getUserTicketsByDirectIteration(userAddress);
    
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return [];
  }
}

/**
 * 讀取轉售訂單
 */
export async function getResaleOrders(limit = 50, offset = 0) {
  try {
    const contract = await getConcertTicketNFTContract();
    const orders = await contract.getActiveResaleOrders(limit, offset);
    const resaleTickets = [];
    
    for (let i = 0; i < orders.length; i++) {
      try {
        const order = orders[i];
        // 解構 ResaleOrder 結構
        const [ticketId, seller, price, listTime, deadline, isActive] = order;
        
        if (!isActive) continue;
        
        // orderId 是基於 offset 的索引
        const orderId = offset + i + 1;
        
        // 獲取票券詳情
        const ticketDetails = await contract.getTicketDetails(Number(ticketId));
        const [concertId, seatNumber, seatSection, , , , , originalPrice] = ticketDetails;
        
        // 獲取演唱會詳情
        const concertData = await contract.getConcertDetails(Number(concertId));
        const [name, artist, venue, date] = concertData;
        
        resaleTickets.push({
          resaleId: `${ticketId}-${orderId}`,
          orderId: orderId,
          id: Number(ticketId),
          event: name,
          artist: artist,
          venue: venue,
          date: new Date(Number(date) * 1000).toISOString().split('T')[0],
          time: '19:00',
          type: 'General',
          originalPrice: Number(originalPrice) / 1e18,
          resalePrice: Number(price) / 1e18,
          seatNumber: Number(seatNumber),
          seatSection: seatSection,
          image: '/api/placeholder/400/250',
          isAvailable: true,
          listTime: new Date(Number(listTime) * 1000).toISOString(),
          deadline: new Date(Number(deadline) * 1000).toISOString(),
          seller: {
            name: `User${seller.slice(-4)}`, // 簡化的用戶名
            address: seller,
            verificationLevel: 'Bronze', // 可以從驗證合約獲取
            salesCount: Math.floor(Math.random() * 10) + 1,
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            joinDate: '2023-06-15',
            successRate: Math.floor(Math.random() * 20) + 80
          }
        });
      } catch (error) {
        console.error('Error processing resale order:', error);
      }
    }
    
    return resaleTickets;
  } catch (error) {
    console.error('Error fetching resale orders:', error);
    return [];
  }
}

/**
 * 購買票券
 */
export async function purchaseTicketFromContract(concertId, seatNumber, seatSection, price) {
  try {
    const contract = await getConcertTicketNFTContract();
    const signer = await getSigner();
    const userAddress = await signer.getAddress();
    
    // 先檢查驗證等級
    const verificationCheck = await checkUserVerificationForConcert(userAddress, concertId);
    console.log('Verification check result:', verificationCheck);
    
    if (!verificationCheck.canPurchase) {
      return {
        success: false,
        error: verificationCheck.message
      };
    }
    
    // 檢查 FLT 餘額
    const fltBalance = await getUserFLTBalance(userAddress);
    
    if (fltBalance < price) {
      return {
        success: false,
        error: `Insufficient FLT balance. Required: ${price} FLT, Available: ${fltBalance} FLT`
      };
    }
    
    // 檢查 FLT 授權額度
    const contractAddress = await contract.getAddress();
    const allowance = await getFLTAllowance(userAddress, contractAddress);
    
    if (allowance < price) {
      console.log(`Insufficient FLT allowance. Approving ${price} FLT...`);
      const approveResult = await approveFLTSpending(contractAddress, price);
      if (!approveResult.success) {
        return {
          success: false,
          error: `Failed to approve FLT spending: ${approveResult.error}`
        };
      }
      console.log('FLT approval successful:', approveResult.transactionHash);
    }
    
    console.log(`Purchasing ticket with ${price} FLT tokens`);
    
    // 調用合約的 purchaseTicket 函數（使用 FLT 支付，不需要 value）
    const tx = await contract.purchaseTicket(concertId, seatNumber, seatSection);
    
    // 等待交易確認
    const receipt = await tx.wait();
    
    // 從事件日誌中獲取 ticketId
    const ticketMintedEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'TicketMinted';
      } catch {
        return false;
      }
    });
    
    let ticketId = null;
    if (ticketMintedEvent) {
      const parsed = contract.interface.parseLog(ticketMintedEvent);
      ticketId = Number(parsed.args.ticketId);
    }
    
    return {
      success: true,
      ticketId: ticketId,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      paymentMethod: 'FLT',
      fltAmount: price
    };
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 購買轉售票券
 */
export async function buyResaleTicketFromContract(orderId, price) {
  try {
    const contract = await getConcertTicketNFTContract();
    
    const tx = await contract.buyResaleTicket(orderId, {
      value: ethers.parseEther(price.toString())
    });
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Error buying resale ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 將票券上架轉售
 */
export async function listTicketForSale(ticketId, price, deadline) {
  try {
    const contract = await getConcertTicketNFTContract();
    
    const tx = await contract.listTicketForSale(
      ticketId,
      ethers.parseEther(price.toString()),
      Math.floor(new Date(deadline).getTime() / 1000)
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error('Error listing ticket for sale:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 使用票券（入場）
 */
export async function useTicketForEntry(ticketId) {
  try {
    const contract = await getConcertTicketNFTContract();
    
    const tx = await contract.useTicket(ticketId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error('Error using ticket:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 獲取用戶 NFT 數量
 */
export async function getUserNFTCount(userAddress) {
  try {
    const contract = await getConcertTicketNFTContract();
    const balance = await contract.balanceOf(userAddress);
    return Number(balance);
  } catch (error) {
    console.error('Error fetching user NFT count:', error);
    return 0;
  }
}

/**
 * 獲取用戶 ETH 餘額
 */
export async function getUserETHBalance(userAddress) {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(userAddress);
    return parseFloat(ethers.formatEther(balance));
  } catch (error) {
    console.error('Error fetching user ETH balance:', error);
    return 0;
  }
}

/**
 * 直接方法：通過遍歷 token ID 獲取用戶票券（因為合約的 getUserTickets 有 bug）
 */
export async function getUserTicketsByDirectIteration(userAddress) {
  try {
    console.log(`Direct iteration for user: ${userAddress}`);
    const contract = await getConcertTicketNFTContract();
    
    const tickets = [];
    const maxTokenId = 100; // 假設不會超過 100 個票券
    
    for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
      try {
        // 檢查這個 token 是否存在以及是否屬於用戶
        const owner = await contract.ownerOf(tokenId);
        
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          console.log(`Found owned token: ${tokenId} by ${userAddress}`);
          
          // 獲取票券詳情
          const ticketDetails = await contract.getTicketDetails(tokenId);
          console.log(`Ticket details for ${tokenId}:`, ticketDetails);
          
          const [concertId, seatNumber, seatSection, , , isUsed, transferCount, originalPrice] = ticketDetails;
          
          // 獲取演唱會詳情
          let concertData;
          try {
            concertData = await contract.getConcertDetails(Number(concertId));
            console.log(`Concert details for ${concertId}:`, concertData);
          } catch (concertError) {
            console.error(`getConcertDetails(${concertId}) failed:`, concertError);
            concertData = ['Unknown Concert', 'Unknown Artist', 'Unknown Venue', Math.floor(Date.now() / 1000)];
          }
          
          const [name, artist, venue, date] = concertData;
          
          const ticket = {
            id: tokenId,
            event: name,
            artist: artist,
            venue: venue,
            date: new Date(Number(date) * 1000).toISOString().split('T')[0],
            time: '19:00',
            type: 'General',
            price: Number(originalPrice) / 1e18,
            seatNumber: Number(seatNumber),
            seatSection: seatSection,
            qrCode: `QR${tokenId}`,
            image: '/api/placeholder/400/250',
            resellable: !isUsed && Number(transferCount) < 3,
            purchaseTime: new Date().toISOString(),
            status: isUsed ? 'used' : 'valid',
            isUsed: isUsed,
            transferCount: Number(transferCount)
          };
          
          console.log(`Successfully created ticket from direct iteration:`, ticket);
          tickets.push(ticket);
        }
        
      } catch (error) {
        // Token 不存在或其他錯誤，跳過
        if (!error.message.includes('ERC721NonexistentToken')) {
          console.warn(`Error checking token ${tokenId}:`, error);
        }
      }
    }
    
    console.log(`Direct iteration found ${tickets.length} tickets`);
    return tickets;
    
  } catch (error) {
    console.error('Error in direct iteration:', error);
    return [];
  }
}

// ========== FLT 代幣合約交互 ==========

/**
 * 建立 FLT 代幣合約實例
 */
export async function getFLTTokenContract() {
  try {
    // 檢查網絡
    const provider = getProvider();
    const network = await provider.getNetwork();
    console.log(`Current network: ${network.name} (${network.chainId})`);
    
    if (network.chainId !== 11155111n) { // Sepolia chainId
      console.warn(`Not on Sepolia network. Current chainId: ${network.chainId}`);
    }
    
    const signer = await getSigner();
    console.log(`Creating FLT contract with address: ${FLT_TOKEN_ADDRESS}`);
    
    const contract = new ethers.Contract(
      FLT_TOKEN_ADDRESS,
      FLT_TOKEN_ABI,
      signer
    );
    
    // 測試合約是否可訪問
    try {
      const name = await contract.name();
      console.log(`FLT Contract name: ${name}`);
    } catch (contractError) {
      console.error('Contract may not exist or have issues:', contractError);
    }
    
    return contract;
  } catch (error) {
    console.error('Error creating FLT contract:', error);
    throw error;
  }
}

/**
 * 獲取用戶 FLT 餘額
 */
export async function getUserFLTBalance(userAddress) {
  try {
    console.log(`Fetching FLT balance for address: ${userAddress}`);
    console.log(`FLT Contract Address: ${FLT_TOKEN_ADDRESS}`);
    
    const contract = await getFLTTokenContract();
    console.log(`Contract instance created: ${contract.target}`);
    
    const balance = await contract.balanceOf(userAddress);
    console.log(`Raw balance from contract: ${balance.toString()}`);
    
    const formattedBalance = parseFloat(ethers.formatEther(balance));
    console.log(`Formatted FLT balance: ${formattedBalance}`);
    
    return formattedBalance;
  } catch (error) {
    console.error('Error fetching user FLT balance:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      reason: error.reason,
      userAddress,
      contractAddress: FLT_TOKEN_ADDRESS
    });
    return 0;
  }
}

/**
 * 發送 FLT 代幣
 */
export async function sendFLTTokens(toAddress, amount) {
  try {
    const contract = await getFLTTokenContract();
    const amountInWei = ethers.parseEther(amount.toString());
    
    const tx = await contract.transfer(toAddress, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      gasUsed: Number(receipt.gasUsed)
    };
  } catch (error) {
    console.error('Error sending FLT tokens:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 授權 FLT 代幣使用（用於購票等）
 */
export async function approveFLTSpending(spenderAddress, amount) {
  try {
    const contract = await getFLTTokenContract();
    const amountInWei = ethers.parseEther(amount.toString());
    
    const tx = await contract.approve(spenderAddress, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error('Error approving FLT spending:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 檢查 FLT 代幣授權額度
 */
export async function getFLTAllowance(ownerAddress, spenderAddress) {
  try {
    const contract = await getFLTTokenContract();
    const allowance = await contract.allowance(ownerAddress, spenderAddress);
    return parseFloat(ethers.formatEther(allowance));
  } catch (error) {
    console.error('Error fetching FLT allowance:', error);
    return 0;
  }
}

/**
 * 獲取 FLT 代幣基本信息
 */
export async function getFLTTokenInfo() {
  try {
    const contract = await getFLTTokenContract();
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    
    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: parseFloat(ethers.formatEther(totalSupply))
    };
  } catch (error) {
    console.error('Error fetching FLT token info:', error);
    return {
      name: 'FanLoyaltyToken',
      symbol: 'FLT',
      decimals: 18,
      totalSupply: 0
    };
  }
}

// ========== 驗證等級相關函數 ==========

// 驗證註冊表 ABI
const VERIFICATION_REGISTRY_ABI = [
  {
    "type": "function",
    "name": "verifications",
    "inputs": [{"name": "", "type": "address", "internalType": "address"}],
    "outputs": [
      {"name": "isVerified", "type": "bool", "internalType": "bool"},
      {"name": "isPhoneVerified", "type": "bool", "internalType": "bool"},
      {"name": "isBlacklisted", "type": "bool", "internalType": "bool"},
      {"name": "identityHash", "type": "bytes32", "internalType": "bytes32"},
      {"name": "verificationTime", "type": "uint256", "internalType": "uint256"},
      {"name": "level", "type": "uint8", "internalType": "uint8"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVerificationLevel",
    "inputs": [{"name": "user", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint8", "internalType": "uint8"}],
    "stateMutability": "view"
  }
];

/**
 * 獲取用戶的驗證等級
 */
export async function getUserVerificationLevel(userAddress) {
  try {
    const contract = await getConcertTicketNFTContract();
    
    // 獲取驗證註冊表合約地址
    const verificationRegistryAddress = await contract.verificationRegistry();
    console.log(`Verification Registry Address: ${verificationRegistryAddress}`);
    
    // 如果沒有設置驗證註冊表，返回默認等級 0
    if (verificationRegistryAddress === '0x0000000000000000000000000000000000000000') {
      console.log('No verification registry set, returning default level 0');
      return 0;
    }
    
    // 創建驗證註冊表合約實例
    const signer = await getSigner();
    const verificationContract = new ethers.Contract(
      verificationRegistryAddress,
      VERIFICATION_REGISTRY_ABI,
      signer
    );
    
    // 查詢用戶驗證信息
    const verificationData = await verificationContract.verifications(userAddress);
    console.log(`Verification data for ${userAddress}:`, verificationData);
    
    // 解析驗證數據
    const [isVerified, isPhoneVerified, isBlacklisted] = verificationData;
    
    // 計算驗證等級
    let calculatedLevel = 0;
    if (isVerified) calculatedLevel += 1;
    if (isPhoneVerified) calculatedLevel += 1;
    if (isBlacklisted) calculatedLevel = 0; // 黑名單用戶等級為 0
    
    console.log(`User ${userAddress} verification level: ${calculatedLevel}`);
    return calculatedLevel;
    
  } catch (error) {
    console.error('Error fetching user verification level:', error);
    return 0;
  }
}

/**
 * 獲取演唱會的最低驗證等級要求
 */
export async function getConcertVerificationRequirement(concertId) {
  try {
    const contract = await getConcertTicketNFTContract();
    const concertData = await contract.concerts(concertId);
    
    // concerts 函數返回的結構中，minVerificationLevel 是最後一個參數
    const minVerificationLevel = concertData[14]; // 根據 ABI，這是第15個參數（索引14）
    
    console.log(`Concert ${concertId} requires verification level: ${minVerificationLevel}`);
    return Number(minVerificationLevel);
    
  } catch (error) {
    console.error('Error fetching concert verification requirement:', error);
    return 0;
  }
}

/**
 * 檢查用戶是否滿足演唱會的驗證等級要求
 */
export async function checkUserVerificationForConcert(userAddress, concertId) {
  try {
    const [userLevel, requiredLevel] = await Promise.all([
      getUserVerificationLevel(userAddress),
      getConcertVerificationRequirement(concertId)
    ]);
    
    console.log(`User verification check: User level=${userLevel}, Required level=${requiredLevel}`);
    
    return {
      userLevel,
      requiredLevel,
      canPurchase: userLevel >= requiredLevel,
      message: userLevel >= requiredLevel 
        ? 'Verification level sufficient' 
        : `Insufficient verification level. Required: ${requiredLevel}, Your level: ${userLevel}`
    };
    
  } catch (error) {
    console.error('Error checking user verification:', error);
    return {
      userLevel: 0,
      requiredLevel: 0,
      canPurchase: false,
      message: 'Error checking verification level'
    };
  }
}

const defaultExport = {
  isMetaMaskInstalled,
  getCurrentChainId,
  switchNetwork,
  addNetwork,
  connectWallet,
  getBalance,
  weiToEth,
  ethToWei,
  isValidAddress,
  toChecksumAddress,
  getExplorerUrl,
  getAddressExplorerUrl,
  estimateGas,
  getGasPrice,
  sendTransaction,
  getTransactionReceipt,
  waitForTransaction,
  setupWalletListeners,
  removeWalletListeners,
  isSupportedNetwork,
  getContractAddress,
  simulateContractCall,
  getAllConcerts,
  getUserTickets,
  getResaleOrders,
  purchaseTicketFromContract,
  buyResaleTicketFromContract,
  listTicketForSale,
  useTicketForEntry,
  getUserNFTCount,
  getUserETHBalance,
  checkTokenOwnership,
  getUserTicketsByDirectIteration,
  getFLTTokenContract,
  getUserFLTBalance,
  sendFLTTokens,
  approveFLTSpending,
  getFLTAllowance,
  getFLTTokenInfo,
  getUserVerificationLevel,
  getConcertVerificationRequirement,
  checkUserVerificationForConcert
};
export default defaultExport;