
import React, { useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import { Contacts } from '../components/Contacts';
import { Companies } from '../components/Companies';
import { Settings } from '../components/Settings';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <Contacts />;
      case 'companies':
        return <Companies />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return renderContent();
};

export default Index;
