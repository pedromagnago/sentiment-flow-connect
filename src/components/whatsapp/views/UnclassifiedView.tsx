import { useState } from 'react';
import { useUnclassifiedContacts } from '@/hooks/useUnclassifiedContacts';
import { useUnclassifiedFilters } from '@/hooks/useUnclassifiedFilters';
import { useSmartClassification } from '@/hooks/useSmartClassification';
import { ClassificationModal } from '../ClassificationModal';
import { Contact } from '@/hooks/useContacts';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/useCompanies';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertCircle, RefreshCw, CheckSquare, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UnclassifiedStats } from '../unclassified/UnclassifiedStats';
import { UnclassifiedFilters } from '../unclassified/UnclassifiedFilters';
import { UnclassifiedBulkActions } from '../unclassified/UnclassifiedBulkActions';
import { ContactCard } from '../unclassified/ContactCard';

export const UnclassifiedView = () => {
  const { contacts, loading, error, messageCount, classifyContact, bulkClassify, refetch } = useUnclassifiedContacts();
  const { companies, loading: loadingCompanies } = useCompanies();
  const { filters, updateFilter, resetFilters, filteredContacts, activeFiltersCount } = useUnclassifiedFilters(contacts, messageCount);
  const { suggestions } = useSmartClassification(filteredContacts, companies);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [bulkCompanyId, setBulkCompanyId] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const syncMissingContacts = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.rpc('sync_missing_contacts');
      if (error) throw error;
      
      const count = data || 0;
      if (count > 0) {
        toast.success(`${count} contatos criados com sucesso!`);
        refetch();
      } else {
        toast.info('Nenhum contato novo encontrado');
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      toast.error('Erro ao sincronizar contatos');
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id_contact)));
    }
  };

  const handleSelectByType = (type: 'groups' | 'individuals') => {
    const filtered = filteredContacts.filter(c => 
      type === 'groups' ? c.is_group : !c.is_group
    );
    setSelectedContacts(new Set(filtered.map(c => c.id_contact)));
  };

  const handleSelectByActivity = (type: 'active' | 'inactive') => {
    const filtered = filteredContacts.filter(c => {
      const count = messageCount[c.id_contact] || 0;
      return type === 'active' ? count >= 5 : count === 0;
    });
    setSelectedContacts(new Set(filtered.map(c => c.id_contact)));
  };

  const handleToggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleBulkClassify = async () => {
    if (!bulkCompanyId) {
      toast.error('Selecione uma empresa');
      return;
    }

    if (selectedContacts.size === 0) {
      toast.error('Selecione pelo menos um contato');
      return;
    }

    try {
      setClassifying(true);
      const total = selectedContacts.size;
      let completed = 0;

      toast.loading(`Classificando 0/${total} contatos...`, { id: 'bulk-classify' });

      await bulkClassify(Array.from(selectedContacts), bulkCompanyId);
      completed = total;

      toast.success(`${completed} contatos classificados!`, { id: 'bulk-classify' });
      setSelectedContacts(new Set());
      setBulkCompanyId('');
    } catch (error) {
      toast.error('Erro ao classificar contatos', { id: 'bulk-classify' });
    } finally {
      setClassifying(false);
    }
  };

  const handleAutoClassify = async (contactId: string, companyId: string) => {
    try {
      await classifyContact(contactId, companyId);
      toast.success('Contato classificado automaticamente!');
    } catch (error) {
      toast.error('Erro ao classificar contato');
    }
  };

  const handleExport = () => {
    const selected = filteredContacts.filter(c => selectedContacts.has(c.id_contact));
    const csv = [
      ['Nome', 'Telefone', 'Tipo', 'Mensagens'].join(','),
      ...selected.map(c => [
        c.nome || 'Sem nome',
        c.id_contact,
        c.is_group ? 'Grupo' : 'Individual',
        messageCount[c.id_contact] || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos-nao-classificados-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Arquivo exportado com sucesso!');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h3 className="text-xl font-semibold">Erro ao Carregar</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Recarregar Página
          </Button>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckSquare className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Tudo Classificado!
          </h3>
          <p className="text-muted-foreground max-w-md">
            Não há contatos sem empresa no momento. Todos os contatos estão devidamente organizados.
          </p>
          <Button onClick={syncMissingContacts} disabled={syncing} variant="outline" className="mt-4">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar Contatos Faltantes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Contatos Não Classificados
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredContacts.length} de {contacts.length} {contacts.length === 1 ? 'contato' : 'contatos'}
              {activeFiltersCount > 0 && ' (filtrados)'}
            </p>
          </div>
          <Button 
            onClick={syncMissingContacts} 
            disabled={syncing} 
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>

        {/* Stats */}
        <UnclassifiedStats contacts={filteredContacts} messageCount={messageCount} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Filters */}
          <UnclassifiedFilters
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Bulk Actions */}
          {selectedContacts.size > 0 && (
            <UnclassifiedBulkActions
              selectedContacts={selectedContacts}
              contacts={filteredContacts}
              messageCount={messageCount}
              companies={companies}
              bulkCompanyId={bulkCompanyId}
              onSelectAll={handleSelectAll}
              onSelectByType={handleSelectByType}
              onSelectByActivity={handleSelectByActivity}
              onClearSelection={() => setSelectedContacts(new Set())}
              onCompanyChange={setBulkCompanyId}
              onBulkClassify={handleBulkClassify}
              onExport={handleExport}
              loadingCompanies={loadingCompanies || classifying}
            />
          )}

          {/* Contact List */}
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum contato encontrado com os filtros aplicados
              </p>
              <Button variant="link" onClick={resetFilters} className="mt-2">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id_contact}
                  contact={contact}
                  messageCount={messageCount[contact.id_contact] || 0}
                  isSelected={selectedContacts.has(contact.id_contact)}
                  suggestion={suggestions[contact.id_contact]}
                  onToggleSelect={() => handleToggleContact(contact.id_contact)}
                  onClassify={() => setSelectedContact(contact)}
                  onAutoClassify={(companyId) => handleAutoClassify(contact.id_contact, companyId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Classification Modal */}
      {selectedContact && (
        <ClassificationModal
          open={!!selectedContact}
          onOpenChange={(open) => !open && setSelectedContact(null)}
          contact={selectedContact}
          messageCount={messageCount[selectedContact.id_contact] || 0}
          onClassify={classifyContact}
        />
      )}
    </div>
  );
};
