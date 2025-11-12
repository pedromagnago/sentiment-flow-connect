import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';

interface Company {
  id: string;
  nome: string;
}

interface AddCompanyAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userCompanies: string[];
  onSuccess: () => void;
}

export const AddCompanyAccessModal: React.FC<AddCompanyAccessModalProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
  userCompanies,
  onSuccess,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [role, setRole] = useState<'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer'>('operator');
  const { addUserToCompany, loading } = useTeamManagement();

  useEffect(() => {
    if (open) {
      loadAvailableCompanies();
    }
  }, [open, userCompanies]);

  const loadAvailableCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      
      // Filtrar empresas que o usuário já tem acesso
      const available = (data || []).filter(c => !userCompanies.includes(c.id));
      setCompanies(available);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) return;

    const success = await addUserToCompany(userId, selectedCompany, role);
    if (success) {
      setSelectedCompany('');
      setRole('operator');
      onSuccess();
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedCompany('');
    setRole('operator');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Acesso à Empresa</DialogTitle>
          <DialogDescription>
            Conceder acesso de <strong>{userName}</strong> a uma nova empresa
          </DialogDescription>
        </DialogHeader>

        {companies.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Este usuário já tem acesso a todas as empresas disponíveis.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role na empresa</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner - Controle total</SelectItem>
                  <SelectItem value="admin">Admin - Acesso total</SelectItem>
                  <SelectItem value="supervisor">Supervisor - Gerenciar operadores</SelectItem>
                  <SelectItem value="operator">Operador - Executar tarefas</SelectItem>
                  <SelectItem value="viewer">Visualizador - Apenas leitura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !selectedCompany} className="flex-1">
                {loading ? 'Adicionando...' : 'Adicionar Acesso'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
