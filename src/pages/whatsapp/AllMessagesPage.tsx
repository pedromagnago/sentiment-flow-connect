import React from 'react';
import { useAllMessages } from '@/hooks/useAllMessages';
import { useCompanies } from '@/hooks/useCompanies';
import { MessageFilters } from '@/components/whatsapp/messages/MessageFilters';
import { MessageCard } from '@/components/whatsapp/messages/MessageCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MessageCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AllMessagesPage() {
  const {
    messages,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    page,
    setPage,
    totalPages,
    totalCount,
    refetch
  } = useAllMessages(50);

  const { companies } = useCompanies();
  const navigate = useNavigate();

  // Calculate active filters count
  const activeFiltersCount = [
    filters.search !== '',
    filters.period !== '7d',
    filters.type !== 'all',
    filters.classification !== 'all',
    filters.direction !== 'all',
    filters.companyId !== null
  ].filter(Boolean).length;

  const handleMessageClick = (contactId: string) => {
    navigate('/whatsapp/chats', { state: { selectedContact: contactId } });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Todas as Mensagens</h1>
              <p className="text-sm text-muted-foreground">
                Visualização unificada de todas as mensagens do WhatsApp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-base px-3 py-1">
              {totalCount.toLocaleString('pt-BR')} mensagens
            </Badge>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <MessageFilters
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          companies={companies}
          activeFiltersCount={activeFiltersCount}
        />
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-auto p-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma mensagem encontrada</p>
            <p className="text-sm">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onClick={() => handleMessageClick(message.contact_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t bg-card">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
