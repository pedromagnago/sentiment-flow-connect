import React, { useState } from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useReceivables } from '@/hooks/useReceivables';
import { ReceivableStats } from '@/components/receivables/ReceivableStats';
import { ReceivablesTable } from '@/components/receivables/ReceivablesTable';
import { ReceivableModal } from '@/components/receivables/ReceivableModal';
import { Receivable } from '@/hooks/useReceivables';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Receipt } from 'lucide-react';

const ReceivablesPage: React.FC = () => {
  const { receivables, loading, totalPending, totalReceived, totalOverdue } = useReceivables();
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'Gestão Financeira', href: '#' },
    { label: 'Contas a Receber', href: '/receivables' },
  ];

  const handleViewDetails = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReceivable(null);
  };

  if (loading) {
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Contas a Receber</h1>
            <p className="text-muted-foreground">Gerencie suas contas a receber e acompanhe os recebimentos</p>
          </div>
        </div>

        {/* Stats Cards */}
        <ReceivableStats
          totalPending={totalPending}
          totalReceived={totalReceived}
          totalOverdue={totalOverdue}
          totalCount={receivables.length}
        />

        {/* Table */}
        <ReceivablesTable receivables={receivables} onViewDetails={handleViewDetails} />

        {/* Details Modal */}
        <ReceivableModal
          receivable={selectedReceivable}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
};

export default ReceivablesPage;
