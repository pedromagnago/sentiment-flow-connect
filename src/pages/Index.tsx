
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../components/Dashboard';
import { Contacts } from '../components/Contacts';
import { Tasks } from '../components/Tasks';
import { Companies } from '../components/Companies';
import { TaskApprovals } from '../components/TaskApprovals';
import { Settings } from '../components/Settings';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { ReportsPage } from '../components/reports/ReportsPage';
import { AuditLogs } from '../components/AuditLogs';
import { Reconciliation } from '../components/finance/Reconciliation';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();

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
      case 'reports':
        return <ReportsPage />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'tasks':
        return <Tasks />;
      case 'task-approvals':
        return <TaskApprovals />;
      case 'reconciliation':
        return <Reconciliation />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Erro ao sair', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sessão encerrada' });
      navigate('/auth', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-6 ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Top actions */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <Link to="/auth" className="underline text-sm">Ir para Login</Link>
            <Link to="/onboarding">
              <Button variant="outline" size="sm">Onboarding</Button>
            </Link>
            <Button size="sm" onClick={handleLogout}>Sair</Button>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
