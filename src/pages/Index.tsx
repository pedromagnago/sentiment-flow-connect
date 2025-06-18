
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../components/Dashboard';
import { Contacts } from '../components/Contacts';
import { Tasks } from '../components/Tasks';
import { Companies } from '../components/Companies';
import { Settings } from '../components/Settings';
import { SentimentAnalysis } from '../components/SentimentAnalysis';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'sentiment':
        return <SentimentAnalysis />;
      case 'contacts':
        return <Contacts />;
      case 'companies':
        return <Companies />;
      case 'tasks':
        return <Tasks />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-6 ml-64">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
