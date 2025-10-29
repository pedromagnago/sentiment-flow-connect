import { useState } from 'react';
import { useCompanyGroups } from '@/hooks/useCompanyGroups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HierarchyTree } from './HierarchyTree';
import { Plus, Building2, Loader2, Trash2 } from 'lucide-react';

export const CompanyGroupManager = () => {
  const { groups, groupsLoading, createGroup, deleteGroup } = useCompanyGroups();
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    nome: '',
    descricao: '',
    tipo: 'holding' as 'holding' | 'grupo_economico' | 'franquia' | 'filial',
  });

  const handleCreateGroup = () => {
    createGroup(newGroupData);
    setIsCreateOpen(false);
    setNewGroupData({ nome: '', descricao: '', tipo: 'holding' });
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Grupos Empresariais</h2>
          <p className="text-muted-foreground">
            Gerencie grupos de empresas e visualize relatórios consolidados
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Grupo Empresarial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Grupo</Label>
                <Input
                  id="nome"
                  value={newGroupData.nome}
                  onChange={(e) =>
                    setNewGroupData({ ...newGroupData, nome: e.target.value })
                  }
                  placeholder="Ex: Grupo ABC Holdings"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={newGroupData.descricao}
                  onChange={(e) =>
                    setNewGroupData({ ...newGroupData, descricao: e.target.value })
                  }
                  placeholder="Descrição opcional"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de Grupo</Label>
                <Select
                  value={newGroupData.tipo}
                  onValueChange={(value: any) =>
                    setNewGroupData({ ...newGroupData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holding">Holding</SelectItem>
                    <SelectItem value="grupo_economico">Grupo Econômico</SelectItem>
                    <SelectItem value="franquia">Franquia</SelectItem>
                    <SelectItem value="filial">Filial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                Criar Grupo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Lista de grupos */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {groups && groups.length > 0 ? (
              groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    activeGroup?.id === group.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{group.nome}</span>
                      </div>
                      {group.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {group.descricao}
                        </p>
                      )}
                      <Badge variant="outline" className="mt-2 text-xs">
                        {group.tipo === 'holding' && 'Holding'}
                        {group.tipo === 'grupo_economico' && 'Grupo Econômico'}
                        {group.tipo === 'franquia' && 'Franquia'}
                        {group.tipo === 'filial' && 'Filial'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Deseja realmente excluir este grupo?')) {
                          deleteGroup(group.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum grupo cadastrado ainda
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crie um grupo para começar
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coluna 2: Hierarquia do grupo selecionado */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeGroup ? `Hierarquia: ${activeGroup.nome}` : 'Selecione um Grupo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGroup ? (
              <HierarchyTree groupId={activeGroup.id} />
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Selecione um grupo à esquerda para visualizar sua hierarquia
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
