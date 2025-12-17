import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Calendar,
  AlertTriangle,
  History,
  Plus,
  RefreshCw,
  Link2
} from 'lucide-react';
import { useAuditPeriods } from '@/hooks/useAuditPeriods';
import { AuditPeriodsList } from '@/components/audit/AuditPeriodsList';
import { PendingDashboard } from '@/components/audit/PendingDashboard';
import { AuditActionHistory } from '@/components/audit/AuditActionHistory';
import { CreatePeriodModal } from '@/components/audit/CreatePeriodModal';
import { ReconciliationDashboard } from '@/components/audit/ReconciliationDashboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useQueryClient } from '@tanstack/react-query';

const BPOAuditPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { 
    periods, 
    pendingStats, 
    actionHistory, 
    isLoading, 
    lockPeriod, 
    isLocking 
  } = useAuditPeriods();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('periods');

  const handleLock = (companyId: string, start: string, end: string) => {
    lockPeriod({ companyId, periodStart: start, periodEnd: end, action: 'lock' });
  };

  const handleUnlock = (companyId: string, start: string, end: string) => {
    lockPeriod({ companyId, periodStart: start, periodEnd: end, action: 'unlock' });
  };

  const handleApprove = (companyId: string, start: string, end: string) => {
    lockPeriod({ companyId, periodStart: start, periodEnd: end, action: 'approve' });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['audit-periods'] });
    queryClient.invalidateQueries({ queryKey: ['pending-stats'] });
    queryClient.invalidateQueries({ queryKey: ['audit-action-history'] });
    queryClient.invalidateQueries({ queryKey: ['orphan_transactions'] });
    queryClient.invalidateQueries({ queryKey: ['unmatched_payables'] });
    queryClient.invalidateQueries({ queryKey: ['unmatched_receivables'] });
  };

  // Summary stats
  const openPeriods = periods.filter(p => p.status === 'open').length;
  const lockedPeriods = periods.filter(p => p.status === 'locked').length;
  const approvedPeriods = periods.filter(p => p.status === 'approved').length;
  
  const totalUncategorized = Object.values(pendingStats).reduce((sum, s) => sum + s.uncategorized, 0);
  const totalWithoutAttachment = Object.values(pendingStats).reduce((sum, s) => sum + s.withoutAttachment, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Auditoria BPO
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie períodos de auditoria e acompanhe pendências
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Período
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-2xl font-bold">{openPeriods}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Períodos Abertos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-600">{lockedPeriods}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Bloqueados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{approvedPeriods}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Aprovados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{totalUncategorized}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Sem Categoria</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-red-600">{totalWithoutAttachment}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Sem Anexo</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4">
          <TabsTrigger value="periods" className="gap-2">
            <Calendar className="w-4 h-4" />
            Períodos
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-2">
            <Link2 className="w-4 h-4" />
            Reconciliação
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pendências
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="mt-6">
          <AuditPeriodsList
            periods={periods}
            onLock={handleLock}
            onUnlock={handleUnlock}
            onApprove={handleApprove}
            isLocking={isLocking}
          />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-6">
          <ReconciliationDashboard />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingDashboard pendingStats={pendingStats} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AuditActionHistory history={actionHistory} />
        </TabsContent>
      </Tabs>

      {/* Create Period Modal */}
      <CreatePeriodModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
};

export default BPOAuditPage;
