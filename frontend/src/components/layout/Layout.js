import React, { useState } from 'react';
import '../../styles/components/Layout.css';
import Sidebar from './Sidebar.js';
import TopBar from './Topbar.js';

const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [homeMarketType, setHomeMarketType] = useState('primary');
  const [ticketsTab, setTicketsTab] = useState('upcoming');
  const [nftsCategory, setNftsCategory] = useState('participation');
  const [reportTab, setReportTab] = useState('submit');
  const [profileTab, setProfileTab] = useState('dashboard');
  const [organizerTab, setOrganizerTab] = useState('create');

  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        // Home 
        homeMarketType, setHomeMarketType,
        // MyTickets 
        ticketsTab, setTicketsTab,
        // MyNFTs 
        nftsCategory, setNftsCategory,
        // Report 
        reportTab, setReportTab,
        // Profile 
        profileTab, setProfileTab,
        // Organizer
        organizerTab, setOrganizerTab
      });
    }
    return child;
  });

  return (
    <div className="layout">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        homeMarketType={homeMarketType}
        setHomeMarketType={setHomeMarketType}
        ticketsTab={ticketsTab}
        setTicketsTab={setTicketsTab}
        nftsCategory={nftsCategory}
        setNftsCategory={setNftsCategory}
        reportTab={reportTab}
        setReportTab={setReportTab}
        profileTab={profileTab}
        setProfileTab={setProfileTab}
        organizerTab={organizerTab}
        setOrganizerTab={setOrganizerTab}
      />
      <div className="main-content">
        <TopBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="page-content">
          {enhancedChildren}
        </main>
      </div>
    </div>
  );
};

export default Layout;