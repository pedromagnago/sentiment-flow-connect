import { useState } from 'react';
import { useUnclassifiedContacts } from '@/hooks/useUnclassifiedContacts';
import { ClassificationModal } from '../ClassificationModal';
import { Contact } from '@/hooks/useContacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies } from '@/hooks/useCompanies';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { 
  AlertCircle, 
  MessageSquare, 
  User, 
  Building2,
  CheckSquare,
  Square,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const UnclassifiedView = () => {
  const { contacts, loading, error, messageCount, classifyContact, bulkClassify, refetch } = useUnclassifiedContacts();
  const { companies, loading: loadingCompanies } = useCompanies();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [bulkCompanyId, setBulkCompanyId] = useState<string>('');
  const [syncing, setSyncing] = useState(false);

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
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id_contact)));
    }
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
      await bulkClassify(Array.from(selectedContacts), bulkCompanyId);
      toast.success(`${selectedContacts.size} contatos classificados!`);
      setSelectedContacts(new Set());
      setBulkCompanyId('');
    } catch (error) {
      toast.error('Erro ao classificar contatos');
    }
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
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Contatos Não Classificados
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {contacts.length} {contacts.length === 1 ? 'contato precisa' : 'contatos precisam'} ser atribuído a uma empresa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={syncMissingContacts} 
              disabled={syncing} 
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            <Badge variant="destructive" className="text-base px-3 py-1">
              {contacts.length}
            </Badge>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedContacts.size > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedContacts.size === contacts.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedContacts.size} selecionado{selectedContacts.size !== 1 && 's'}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <Select value={bulkCompanyId} onValueChange={setBulkCompanyId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Atribuir à empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.nome || company.cnpj || 'Empresa sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleBulkClassify}
                disabled={!bulkCompanyId || loadingCompanies}
              >
                Classificar Selecionados
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 max-w-4xl mx-auto">
          {contacts.map((contact) => (
            <Card key={contact.id_contact} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedContacts.has(contact.id_contact)}
                    onCheckedChange={() => handleToggleContact(contact.id_contact)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {contact.nome || 'Sem nome'}
                      </span>
                      {contact.is_group && (
                        <Badge variant="outline" className="text-xs">Grupo</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Telefone: {contact.id_contact}</div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {messageCount[contact.id_contact] || 0} mensagens
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedContact(contact)}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Classificar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
