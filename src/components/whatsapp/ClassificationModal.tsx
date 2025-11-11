import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies } from '@/hooks/useCompanies';
import { Contact } from '@/hooks/useContacts';
import { Loader2, Building2, User } from 'lucide-react';
import { toast } from 'sonner';

interface ClassificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  messageCount: number;
  onClassify: (contactId: string, companyId: string, newName?: string) => Promise<void>;
}

export const ClassificationModal = ({
  open,
  onOpenChange,
  contact,
  messageCount,
  onClassify
}: ClassificationModalProps) => {
  const { companies, loading: loadingCompanies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [newName, setNewName] = useState(contact.nome || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCompanyId) {
      toast.error('Selecione uma empresa');
      return;
    }

    try {
      setIsSubmitting(true);
      await onClassify(contact.id_contact, selectedCompanyId, newName !== contact.nome ? newName : undefined);
      toast.success('Contato classificado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erro no modal ao classificar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao classificar contato';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Classificar Contato</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{contact.nome || 'Sem nome'}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Telefone: {contact.id_contact}
            </div>
            <div className="text-sm text-muted-foreground">
              Mensagens: {messageCount}
            </div>
          </div>

          {/* Company Selection */}
          <div className="space-y-2">
            <Label htmlFor="company">
              <Building2 className="w-4 h-4 inline mr-2" />
              Empresa *
            </Label>
            {loadingCompanies ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.nome || company.cnpj || 'Empresa sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Atualizar nome do contato</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do contato"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCompanyId}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Classificar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
