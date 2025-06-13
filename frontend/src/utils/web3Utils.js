import { CONTRACT_ADDRESSES, NETWORK_CONFIG, ERROR_MESSAGES } from './constants';

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
  return Object.values(NETWORK_CONFIG).some(config => config.chainId === chainId);
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

export default {
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
  simulateContractCall
};