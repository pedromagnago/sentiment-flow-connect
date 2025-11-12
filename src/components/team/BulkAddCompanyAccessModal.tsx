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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckSquare, Square } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Company {
  id: string;
  nome: string;
}

interface CompanyRoleSelection {
  companyId: string;
  companyName: string;
  role: 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer';
  selected: boolean;
}

interface BulkAddCompanyAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userCompanies: string[];
  onSuccess: () => void;
}

export const BulkAddCompanyAccessModal: React.FC<BulkAddCompanyAccessModalProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
  userCompanies,
  onSuccess,
}) => {
  const [companies, setCompanies] = useState<CompanyRoleSelection[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyRoleSelection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [defaultRole, setDefaultRole] = useState<'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer'>('operator');
  const { addUserToMultipleCompanies, loading } = useTeamManagement();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadAvailableCompanies();
    }
  }, [open, userCompanies]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      setFilteredCompanies(
        companies.filter(c =>
          c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, companies]);

  const loadAvailableCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, nome')
        .order('nome');

      if (error) throw error;

      const availableCompanies = (data || [])
        .filter(c => !userCompanies.includes(c.id))
        .map(c => ({
          companyId: c.id,
          companyName: c.nome,
          role: defaultRole,
          selected: false,
        }));

      setCompanies(availableCompanies);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas',
        variant: 'destructive',
      });
    }
  };

  const toggleCompany = (companyId: string) => {
    setCompanies(prev =>
      prev.map(c =>
        c.companyId === companyId ? { ...c, selected: !c.selected } : c
      )
    );
  };

  const updateCompanyRole = (companyId: string, role: string) => {
    setCompanies(prev =>
      prev.map(c =>
        c.companyId === companyId ? { ...c, role: role as any } : c
      )
    );
  };

  const selectAll = () => {
    setCompanies(prev => prev.map(c => ({ ...c, selected: true })));
  };

  const clearAll = () => {
    setCompanies(prev => prev.map(c => ({ ...c, selected: false })));
  };

  const applyDefaultRole = () => {
    setCompanies(prev =>
      prev.map(c => (c.selected ? { ...c, role: defaultRole } : c))
    );
    toast({
      title: 'Role aplicada',
      description: `Role "${defaultRole}" aplicada a todas as empresas selecionadas`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCompanies = companies.filter(c => c.selected);

    if (selectedCompanies.length === 0) {
      toast({
        title: 'Nenhuma empresa selecionada',
        description: 'Selecione pelo menos uma empresa',
        variant: 'destructive',
      });
      return;
    }

    const companyRoles = selectedCompanies.map(c => ({
      companyId: c.companyId,
      role: c.role,
    }));

    const result = await addUserToMultipleCompanies(userId, companyRoles);

    if (result.success) {
      toast({
        title: 'Sucesso',
        description: `Acesso adicionado a ${selectedCompanies.length} empresa(s)`,
      });
      onSuccess();
      onOpenChange(false);
    } else if (result.errors.length > 0) {
      toast({
        title: 'Erro parcial',
        description: `${result.errors.length} erro(s) ao adicionar acesso`,
        variant: 'destructive',
      });
    }
  };

  const selectedCount = companies.filter(c => c.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Acesso a Múltiplas Empresas</DialogTitle>
          <DialogDescription>
            Adicionar {userName} a várias empresas de uma vez
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  <SelectItem value="viewer">Visualizador</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
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
            <Label>Buscar empresas</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o nome da empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="flex-1"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Selecionar Todas
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-4">
            {filteredCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {companies.length === 0
                  ? 'Usuário já tem acesso a todas as empresas'
                  : 'Nenhuma empresa encontrada'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.map((company) => (
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
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              📊 {selectedCount} empresa(s) selecionada(s)
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || selectedCount === 0}>
                {loading ? 'Adicionando...' : `Adicionar Acesso (${selectedCount})`}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
