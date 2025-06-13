import React, { useState } from 'react';
import Layout from './components/layout/Layout.js';
import Home from './pages/Home.js';
import Dashboard from './pages/Dashboard.js';
import MyTickets from './pages/MyTickets.js';
import MyNFTs from './pages/MyNFTs.js';
import Report from './pages/Report.js';
import Profile from './pages/Profile.js';
import Notifications from './pages/Notifications.js';

// Providers
import { WalletProvider } from './hooks/useWallet.js';
import { NFTProvider } from './hooks/useNFT.js';
import { FLTProvider } from './hooks/useFLT.js';

import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [reportTarget, setReportTarget] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setReportTarget={setReportTarget}
          />
        );
      case 'dashboard':
        return <Dashboard />;
      case 'tickets':
        return <MyTickets />;
      case 'nfts':
        return <MyNFTs />;
      case 'report':
        return (
          <Report 
            reportTarget={reportTarget}
            setReportTarget={setReportTarget}
          />
        );
      case 'profile':
        return <Profile />;
      case 'notifications':
        return <Notifications />;
      default:
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setReportTarget={setReportTarget}
          />
        );
    }
  };

  return (
    <WalletProvider>
      <FLTProvider>
        <NFTProvider>
          <div className="App">
            <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
              {renderPage()}
            </Layout>
          </div>
        </NFTProvider>
      </FLTProvider>
    </WalletProvider>
  );
}

export default App;