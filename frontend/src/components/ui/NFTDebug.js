import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet.js';
import { checkTokenOwnership, getUserNFTCount, getUserTickets, getUserTicketsByBalance, getUserTicketsByDirectIteration } from '../../utils/web3Utils.js';
import Button from './Button.js';

const NFTDebug = () => {
  const { isConnected, walletInfo } = useWallet();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testTokenOwnership = async () => {
    if (!walletInfo?.address) return;
    
    setLoading(true);
    try {
      console.log('=== NFT Debugging Started ===');
      
      // 測試 1: 檢查特定 token ID 1 的擁有權
      const ownsToken1 = await checkTokenOwnership(1, walletInfo.address);
      
      // 測試 2: 獲取 NFT 數量
      const nftCount = await getUserNFTCount(walletInfo.address);
      
      // 測試 3: 使用備用方法獲取票券
      const ticketsByBalance = await getUserTicketsByBalance(walletInfo.address);
      
      // 測試 4: 使用原始方法獲取票券
      const ticketsByOriginal = await getUserTickets(walletInfo.address);
      
      // 測試 5: 使用直接遍歷方法獲取票券
      const ticketsByDirect = await getUserTicketsByDirectIteration(walletInfo.address);
      
      const debugResults = {
        userAddress: walletInfo.address,
        ownsToken1,
        nftCount,
        ticketsByBalance: ticketsByBalance.length,
        ticketsByOriginal: ticketsByOriginal.length,
        ticketsByDirect: ticketsByDirect.length,
        balanceTickets: ticketsByBalance,
        originalTickets: ticketsByOriginal,
        directTickets: ticketsByDirect
      };
      
      console.log('=== Debug Results ===', debugResults);
      setResults(debugResults);
      
    } catch (error) {
      console.error('Debug test failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        background: '#f3f4f6', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        maxWidth: '300px',
        fontSize: '12px'
      }}>
        <h4>NFT Debug Tool</h4>
        <p>Please connect your wallet first</p>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#f3f4f6', 
      padding: '15px', 
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      maxWidth: '400px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>NFT Debug Tool</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Address:</strong> {walletInfo.address?.slice(0, 10)}...
      </div>
      
      <Button 
        onClick={testTokenOwnership} 
        disabled={loading}
        style={{ marginBottom: '10px', fontSize: '12px', padding: '5px 10px' }}
      >
        {loading ? 'Testing...' : 'Test NFT Detection'}
      </Button>
      
      {Object.keys(results).length > 0 && (
        <div style={{ 
          background: '#fff', 
          padding: '10px', 
          borderRadius: '4px', 
          border: '1px solid #e5e7eb',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <strong>Results:</strong>
          <pre style={{ fontSize: '10px', margin: '5px 0 0 0' }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#6b7280' }}>
        Open browser console for detailed logs
      </div>
    </div>
  );
};

export default NFTDebug; 