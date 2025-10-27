import { useState, useMemo } from 'react';
import { Lightbulb, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuggestedActions } from '@/hooks/useSuggestedActions';
import { SuggestedActionsTable } from '@/components/suggested-actions/SuggestedActionsTable';
import { SuggestedActionsFilters } from '@/components/suggested-actions/SuggestedActionsFilters';
import { SuggestedActionModal } from '@/components/suggested-actions/SuggestedActionModal';
import { SuggestedActionsStats } from '@/components/suggested-actions/SuggestedActionsStats';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { useToast } from '@/hooks/use-toast';
import type { SuggestedAction } from '@/hooks/useSuggestedActions';

interface FilterState {
  search: string;
  actionType: string;
  status: string;
  priority: string;
  confidenceMin: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export default function SuggestedActionsPage() {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<SuggestedAction | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    actionType: 'all',
    status: 'all',
    priority: 'all',
    confidenceMin: '0',
  });

  // Buscar todas as ações (sem filtro de contact/message)
  const {
    actions: allActions,
    isLoading,
    error,
    updateAction,
    ignoreAction,
    processAction,
  } = useSuggestedActions();

  // Aplicar filtros e ordenação
  const filteredAndSortedActions = useMemo(() => {
    let filtered = allActions;

    // Busca por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.ai_suggestion.toLowerCase().includes(searchLower) ||
          a.action_type.toLowerCase().includes(searchLower) ||
          a.contact_id.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por tipo
    if (filters.actionType !== 'all') {
      filtered = filtered.filter((a) => a.action_type === filters.actionType);
    }

    // Filtrar por status
    if (filters.status !== 'all') {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    // Filtrar por prioridade
    if (filters.priority !== 'all') {
      filtered = filtered.filter((a) => a.priority === filters.priority);
    }

    // Filtrar por confiança mínima
    const minConfidence = parseInt(filters.confidenceMin) || 0;
    filtered = filtered.filter((a) => a.ai_confidence >= minConfidence);

    // Filtrar por data inicial
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (a) => new Date(a.created_at) >= filters.dateFrom!
      );
    }

    // Filtrar por data final
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999); // Incluir o dia inteiro
      filtered = filtered.filter((a) => new Date(a.created_at) <= dateTo);
    }

    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = a[sortBy as keyof SuggestedAction];
      let bVal: any = b[sortBy as keyof SuggestedAction];

      if (sortBy === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [allActions, filters, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedActions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedActions.map((a) => a.id));
    }
  };

  const handleApprove = (id: string) => {
    const action = allActions.find((a) => a.id === id);
    if (!action) return;

    processAction({
      id,
      action_type: action.action_type,
      extracted_data: action.extracted_data,
    });

    toast({
      title: 'Ação aprovada',
      description: 'A ação será processada em breve',
    });
  };

  const handleReject = (id: string) => {
    updateAction({ id, status: 'failed', notes: 'Rejeitada pelo usuário' });
    toast({
      title: 'Ação rejeitada',
      description: 'A ação foi marcada como rejeitada',
    });
  };

  const handleIgnore = (id: string) => {
    ignoreAction(id);
  };

  const handleEdit = (id: string, extractedData: Record<string, any>, notes?: string) => {
    updateAction({ id, status: 'pending', extracted_data: extractedData, notes });
    toast({
      title: 'Ação atualizada',
      description: 'Os dados foram atualizados com sucesso',
    });
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      actionType: 'all',
      status: 'all',
      priority: 'all',
      confidenceMin: '0',
    });
  };

  const handleExport = () => {
    // TODO: Implementar exportação para CSV/Excel
    toast({
      title: 'Exportação',
      description: 'Funcionalidade em desenvolvimento',
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message="Erro ao carregar ações sugeridas" />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            Ações Sugeridas pela IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todas as sugestões automáticas criadas pela análise de
            mensagens
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <SuggestedActionsStats actions={allActions} />

      <SuggestedActionsFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredAndSortedActions.length} de {allActions.length}{' '}
          ações
        </p>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedIds.forEach(handleIgnore);
                setSelectedIds([]);
              }}
            >
              Ignorar selecionadas ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      <SuggestedActionsTable
        actions={filteredAndSortedActions}
        onSelectAction={setSelectedAction}
        onApprove={handleApprove}
        onReject={handleReject}
        onIgnore={handleIgnore}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <SuggestedActionModal
        action={selectedAction}
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onIgnore={handleIgnore}
        onEdit={handleEdit}
      />
    </div>
  );
}
