import { useQuery } from '@tanstack/react-query';
import { useCompanyGroups } from '@/hooks/useCompanyGroups';
import { useCompanies } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, Building, Building2 } from 'lucide-react';
import { useState } from 'react';

interface HierarchyTreeProps {
  groupId: string;
}

export const HierarchyTree = ({ groupId }: HierarchyTreeProps) => {
  const { fetchGroupMembers, addCompanyToGroup, removeCompanyFromGroup } = useCompanyGroups();
  const { companies } = useCompanies();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [memberType, setMemberType] = useState<'matriz' | 'filial' | 'coligada'>('filial');

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['group_members', groupId],
    queryFn: () => fetchGroupMembers(groupId),
  });

  const handleAddCompany = () => {
    if (!selectedCompanyId) return;

    addCompanyToGroup({
      group_id: groupId,
      company_id: selectedCompanyId,
      member_type: memberType,
      consolidation_weight: 100,
      is_active: true,
    });

    setIsAdding(false);
    setSelectedCompanyId('');
    setTimeout(() => refetch(), 500);
  };

  const handleRemoveCompany = (companyId: string) => {
    if (confirm('Deseja realmente remover esta empresa do grupo?')) {
      removeCompanyFromGroup({ groupId, companyId });
      setTimeout(() => refetch(), 500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Agrupar por tipo
  const matriz = members?.filter((m: any) => m.member_type === 'matriz') || [];
  const filiais = members?.filter((m: any) => m.member_type === 'filial') || [];
  const coligadas = members?.filter((m: any) => m.member_type === 'coligada') || [];

  // Filtrar empresas disponíveis (que não estão no grupo)
  const memberCompanyIds = members?.map((m: any) => m.company_id) || [];
  const availableCompanies = companies?.filter(
    (c) => !memberCompanyIds.includes(c.id)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Botão adicionar */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Empresa ao Grupo
        </Button>
      ) : (
        <div className="space-y-3 p-4 border rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">Empresa</label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {availableCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.nome} {company.cnpj && `- ${company.cnpj}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <Select value={memberType} onValueChange={(v: any) => setMemberType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matriz">Matriz</SelectItem>
                <SelectItem value="filial">Filial</SelectItem>
                <SelectItem value="coligada">Coligada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddCompany} className="flex-1">
              Adicionar
            </Button>
            <Button onClick={() => setIsAdding(false)} variant="outline">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Árvore hierárquica */}
      <div className="space-y-4">
        {/* Matriz */}
        {matriz.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Matriz</span>
            </div>
            <div className="space-y-2 ml-6">
              {matriz.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.companies.nome}</p>
                    {member.companies.cnpj && (
                      <p className="text-xs text-muted-foreground">
                        CNPJ: {member.companies.cnpj}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompany(member.company_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filiais */}
        {filiais.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4" />
              <span className="text-sm font-medium">Filiais</span>
              <Badge variant="secondary">{filiais.length}</Badge>
            </div>
            <div className="space-y-2 ml-6">
              {filiais.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.companies.nome}</p>
                    {member.companies.cnpj && (
                      <p className="text-xs text-muted-foreground">
                        CNPJ: {member.companies.cnpj}
                      </p>
                    )}
                    <Badge variant="outline" className="mt-1 text-xs">
                      Peso: {member.consolidation_weight}%
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompany(member.company_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coligadas */}
        {coligadas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4" />
              <span className="text-sm font-medium">Coligadas</span>
              <Badge variant="secondary">{coligadas.length}</Badge>
            </div>
            <div className="space-y-2 ml-6">
              {coligadas.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.companies.nome}</p>
                    {member.companies.cnpj && (
                      <p className="text-xs text-muted-foreground">
                        CNPJ: {member.companies.cnpj}
                      </p>
                    )}
                    <Badge variant="outline" className="mt-1 text-xs">
                      Peso: {member.consolidation_weight}%
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompany(member.company_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {members && members.length === 0 && (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma empresa no grupo ainda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione empresas para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
