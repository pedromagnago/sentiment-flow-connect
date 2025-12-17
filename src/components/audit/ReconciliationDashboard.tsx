import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Loader2 } from 'lucide-react';
import { useReconciliation } from '@/hooks/useReconciliation';
import { ReconciliationStats } from './ReconciliationStats';
import { OrphanTransactionsPanel } from './OrphanTransactionsPanel';
import { UnmatchedAccountsPanel } from './UnmatchedAccountsPanel';
import { LinkAccountModal } from './LinkAccountModal';
import { LinkTransactionModal } from './LinkTransactionModal';

export const ReconciliationDashboard: React.FC = () => {
  const {
    stats,
    orphanTransactions,
    unmatchedPayables,
    unmatchedReceivables,
    isLoading,
    runAutoMatch,
    classifyTransaction,
    linkTransactionToAccount,
  } = useReconciliation();

  const [isRunningAutoMatch, setIsRunningAutoMatch] = useState(false);
  const [linkAccountModal, setLinkAccountModal] = useState<{
    open: boolean;
    transactionId: string;
    amount: number;
    date: string;
    description: string;
  }>({ open: false, transactionId: '', amount: 0, date: '', description: '' });

  const [linkTransactionModal, setLinkTransactionModal] = useState<{
    open: boolean;
    accountId: string;
    accountType: 'payable' | 'receivable';
    amount: number;
    description: string;
  }>({ open: false, accountId: '', accountType: 'payable', amount: 0, description: '' });

  const handleRunAutoMatch = async () => {
    setIsRunningAutoMatch(true);
    try {
      runAutoMatch({});
    } finally {
      setTimeout(() => setIsRunningAutoMatch(false), 1000);
    }
  };

  const handleOpenLinkAccount = (transactionId: string) => {
    const transaction = orphanTransactions?.find(t => t.id === transactionId);
    if (transaction) {
      setLinkAccountModal({
        open: true,
        transactionId,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description || ''
      });
    }
  };

  const handleOpenLinkTransaction = (accountId: string, accountType: 'payable' | 'receivable') => {
    const account = accountType === 'payable' 
      ? unmatchedPayables?.find(p => p.id === accountId)
      : unmatchedReceivables?.find(r => r.id === accountId);
    
    if (account) {
      setLinkTransactionModal({
        open: true,
        accountId,
        accountType,
        amount: account.valor,
        description: account.descricao
      });
    }
  };

  const handleLinkAccountConfirm = (accountId: string, accountType: 'payable' | 'receivable') => {
    linkTransactionToAccount({
      transactionId: linkAccountModal.transactionId,
      accountId,
      accountType
    });
  };

  const handleLinkTransactionConfirm = (transactionId: string) => {
    linkTransactionToAccount({
      transactionId,
      accountId: linkTransactionModal.accountId,
      accountType: linkTransactionModal.accountType
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Gerencie a reconciliação entre transações bancárias e contas a pagar/receber
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAutoMatch}
            disabled={isRunningAutoMatch}
          >
            {isRunningAutoMatch ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Reconciliar Auto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ReconciliationStats stats={stats} />

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrphanTransactionsPanel
          transactions={orphanTransactions || []}
          onClassify={(id, tipo, ignorar, motivo) => 
            classifyTransaction({ transactionId: id, tipoMovimento: tipo, ignorar, motivo })
          }
          onLinkAccount={handleOpenLinkAccount}
        />

        <UnmatchedAccountsPanel
          payables={unmatchedPayables || []}
          receivables={unmatchedReceivables || []}
          onLinkTransaction={handleOpenLinkTransaction}
        />
      </div>

      {/* Link Account Modal (from transaction) */}
      <LinkAccountModal
        open={linkAccountModal.open}
        onOpenChange={(open) => setLinkAccountModal(prev => ({ ...prev, open }))}
        transactionId={linkAccountModal.transactionId}
        transactionAmount={linkAccountModal.amount}
        transactionDate={linkAccountModal.date}
        transactionDescription={linkAccountModal.description}
        onLink={handleLinkAccountConfirm}
      />

      {/* Link Transaction Modal (from account) */}
      <LinkTransactionModal
        open={linkTransactionModal.open}
        onOpenChange={(open) => setLinkTransactionModal(prev => ({ ...prev, open }))}
        accountId={linkTransactionModal.accountId}
        accountType={linkTransactionModal.accountType}
        accountAmount={linkTransactionModal.amount}
        accountDescription={linkTransactionModal.description}
        onLink={handleLinkTransactionConfirm}
      />
    </div>
  );
};
