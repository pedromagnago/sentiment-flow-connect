import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { Copy, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Company {
  id: string;
  nome: string;
}

interface CompanyRoleSelection {
  companyId: string;
  companyName: string;
  role: 'admin' | 'supervisor' | 'operator' | 'viewer';
  selected: boolean;
}

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCompanyId?: string;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  preSelectedCompanyId,
}) => {
  const [email, setEmail] = useState('');
  const [companySelections, setCompanySelections] = useState<CompanyRoleSelection[]>([]);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [defaultRole, setDefaultRole] = useState<'admin' | 'supervisor' | 'operator' | 'viewer'>('operator');
  const { inviteUserToMultipleCompanies, loading } = useTeamManagement();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCompanies();
    }
  }, [open]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      
      const selections: CompanyRoleSelection[] = (data || []).map(c => ({
        companyId: c.id,
        companyName: c.nome || 'Sem nome',
        role: defaultRole,
        selected: preSelectedCompanyId === c.id,
      }));
      
      setCompanySelections(selections);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const toggleCompany = (companyId: string) => {
    setCompanySelections(prev =>
      prev.map(c =>
        c.companyId === companyId ? { ...c, selected: !c.selected } : c
      )
    );
  };

  const updateCompanyRole = (companyId: string, role: string) => {
    setCompanySelections(prev =>
      prev.map(c =>
        c.companyId === companyId ? { ...c, role: role as any } : c
      )
    );
  };

  const applyDefaultRole = () => {
    setCompanySelections(prev =>
      prev.map(c => (c.selected ? { ...c, role: defaultRole } : c))
    );
    toast({
      title: 'Role aplicada',
      description: `Role "${defaultRole}" aplicada a todas as empresas selecionadas`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCompanies = companySelections.filter(c => c.selected);

    if (!email) {
      toast({
        title: 'Email obrigatório',
        description: 'Preencha o email do usuário',
        variant: 'destructive',
      });
      return;
    }

    if (selectedCompanies.length === 0) {
      toast({
        title: 'Empresa obrigatória',
        description: 'Selecione pelo menos uma empresa',
        variant: 'destructive',
      });
      return;
    }

    // Usar a nova função que suporta múltiplas empresas
    const companyRoles = selectedCompanies.map(c => ({
      companyId: c.companyId,
      role: c.role,
    }));

    const result = await inviteUserToMultipleCompanies(email, companyRoles);
    
    if (result.success && result.token) {
      setInviteToken(result.token);
      onSuccess();
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Link copiado',
      description: 'Link de convite copiado para a área de transferência',
    });
  };

  const handleClose = () => {
    setEmail('');
    setCompanySelections(prev => prev.map(c => ({ ...c, selected: false })));
    setInviteToken(null);
    onOpenChange(false);
  };

  const selectedCount = companySelections.filter(c => c.selected).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Convidar Membro da Equipe</DialogTitle>
          <DialogDescription>
            {inviteToken
              ? 'Convite criado! Copie o link abaixo e envie para o novo membro.'
              : 'Preencha os dados e selecione as empresas para criar um convite de acesso.'}
          </DialogDescription>
        </DialogHeader>

        {!inviteToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role padrão</Label>
              <div className="flex gap-2">
                <Select
                  value={defaultRole}
                  onValueChange={(v: any) => setDefaultRole(v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador - Apenas leitura</SelectItem>
                    <SelectItem value="operator">Operador - Executar tarefas</SelectItem>
                    <SelectItem value="supervisor">Supervisor - Gerenciar operadores</SelectItem>
                    <SelectItem value="admin">Admin - Acesso total</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyDefaultRole}
                  disabled={selectedCount === 0}
                >
                  Aplicar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                <Building2 className="inline h-4 w-4 mr-1" />
                Empresas (selecione uma ou mais)
              </Label>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                {companySelections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Carregando empresas...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {companySelections.map((company) => (
                      <div
                        key={company.companyId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={company.selected}
                          onCheckedChange={() => toggleCompany(company.companyId)}
                        />
                        <span className="flex-1 font-medium">
                          {company.companyName}
                        </span>
                        <Select
                          value={company.role}
                          onValueChange={(v) => updateCompanyRole(company.companyId, v)}
                          disabled={!company.selected}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                            <SelectItem value="operator">Operador</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <p className="text-sm text-muted-foreground">
                📊 {selectedCount} empresa(s) selecionada(s)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading || selectedCount === 0}>
              {loading ? 'Criando convite...' : `Criar Convite (${selectedCount} empresa${selectedCount !== 1 ? 's' : ''})`}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/accept-invite?token=${inviteToken}`}
                className="font-mono text-sm"
              />
              <Button size="icon" variant="outline" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              O link expira em 7 dias. Envie-o via WhatsApp, email ou outro canal seguro.
            </p>
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};