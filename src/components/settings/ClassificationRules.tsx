import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Settings2,
  FileText
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface Rule {
  id: string;
  rule_name: string;
  rule_type: string;
  conditions: any;
  actions: any;
  priority: number;
  active: boolean;
  created_at: string;
}

const RULE_TEMPLATES = {
  utilities: {
    name: 'Contas de Utilities',
    conditions: {
      message_contains: ['luz', 'água', 'energia', 'enel', 'sabesp', 'cemig']
    },
    actions: {
      classify_as: 'payment',
      category: 'Utilities',
      cost_center: 'Administrativo',
      priority: 'normal'
    }
  },
  salaries: {
    name: 'Folha de Pagamento',
    conditions: {
      message_contains: ['folha', 'salário', 'holerite', 'pagamento funcionários']
    },
    actions: {
      classify_as: 'payment',
      category: 'Payroll',
      cost_center: 'RH',
      priority: 'high'
    }
  },
  invoices: {
    name: 'Notas Fiscais de Entrada',
    conditions: {
      has_attachment: true,
      message_contains: ['nota fiscal', 'nf-e', 'danfe']
    },
    actions: {
      classify_as: 'payment',
      category: 'Services',
      priority: 'normal'
    }
  },
  billing: {
    name: 'Solicitações de Faturamento',
    conditions: {
      message_contains: ['emitir nota', 'preciso fatura', 'nf de serviço']
    },
    actions: {
      classify_as: 'invoice',
      priority: 'high'
    }
  }
};

export const ClassificationRules = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  
  // Form state
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('classification');
  const [priority, setPriority] = useState(5);
  const [conditions, setConditions] = useState('{}');
  const [actions, setActions] = useState('{}');
  const [active, setActive] = useState(true);

  React.useEffect(() => {
    loadRules();
  }, [user]);

  const loadRules = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from('transaction_rules')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      setRules(data || []);
    } catch (error: any) {
      console.error('Error loading rules:', error);
      toast({
        title: 'Erro ao carregar regras',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRule = async () => {
    if (!user || !ruleName) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.company_id) {
        toast({
          title: 'Erro',
          description: 'Empresa não encontrada',
          variant: 'destructive',
        });
        return;
      }

      let parsedConditions, parsedActions;
      try {
        parsedConditions = JSON.parse(conditions);
        parsedActions = JSON.parse(actions);
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'JSON inválido nas condições ou ações',
          variant: 'destructive',
        });
        return;
      }

      const ruleData = {
        company_id: profile.company_id,
        rule_name: ruleName,
        rule_type: ruleType,
        conditions: parsedConditions,
        actions: parsedActions,
        priority,
        active,
      };

      if (editingRule) {
        const { error } = await supabase
          .from('transaction_rules')
          .update(ruleData)
          .eq('id', editingRule.id);
        
        if (error) throw error;
        
        toast({
          title: '✅ Regra atualizada',
          description: 'A regra foi atualizada com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('transaction_rules')
          .insert([ruleData]);
        
        if (error) throw error;
        
        toast({
          title: '✅ Regra criada',
          description: 'A nova regra foi criada com sucesso',
        });
      }

      setIsModalOpen(false);
      resetForm();
      loadRules();
    } catch (error: any) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Erro ao salvar regra',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    
    try {
      const { error } = await supabase
        .from('transaction_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: '✅ Regra excluída',
        description: 'A regra foi excluída com sucesso',
      });
      
      loadRules();
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Erro ao excluir regra',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (rule: Rule) => {
    try {
      const { error } = await supabase
        .from('transaction_rules')
        .update({ active: !rule.active })
        .eq('id', rule.id);
      
      if (error) throw error;
      
      toast({
        title: '✅ Status atualizado',
        description: `Regra ${!rule.active ? 'ativada' : 'desativada'}`,
      });
      
      loadRules();
    } catch (error: any) {
      console.error('Error toggling rule:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setRuleName(rule.rule_name);
    setRuleType(rule.rule_type);
    setPriority(rule.priority);
    setConditions(JSON.stringify(rule.conditions, null, 2));
    setActions(JSON.stringify(rule.actions, null, 2));
    setActive(rule.active);
    setIsModalOpen(true);
  };

  const applyTemplate = (templateKey: keyof typeof RULE_TEMPLATES) => {
    const template = RULE_TEMPLATES[templateKey];
    setRuleName(template.name);
    setConditions(JSON.stringify(template.conditions, null, 2));
    setActions(JSON.stringify(template.actions, null, 2));
  };

  const resetForm = () => {
    setEditingRule(null);
    setRuleName('');
    setRuleType('classification');
    setPriority(5);
    setConditions('{}');
    setActions('{}');
    setActive(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(rules, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `regras-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedRules = JSON.parse(e.target?.result as string);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user!.id)
          .single();
        
        if (!profile?.company_id) return;

        // Remove id and set company_id
        const rulesToImport = importedRules.map((r: any) => ({
          ...r,
          id: undefined,
          company_id: profile.company_id,
          created_at: undefined,
          updated_at: undefined,
        }));

        const { error } = await supabase
          .from('transaction_rules')
          .insert(rulesToImport);
        
        if (error) throw error;
        
        toast({
          title: '✅ Regras importadas',
          description: `${rulesToImport.length} regras foram importadas com sucesso`,
        });
        
        loadRules();
      } catch (error: any) {
        console.error('Error importing rules:', error);
        toast({
          title: 'Erro ao importar regras',
          description: error.message,
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Regras de Classificação
        </CardTitle>
        <CardDescription>
          Configure regras automáticas para classificar mensagens e documentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Regra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? 'Editar Regra' : 'Nova Regra de Classificação'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure as condições e ações para esta regra
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Templates */}
                  {!editingRule && (
                    <div className="space-y-2">
                      <Label>Templates Rápidos</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(RULE_TEMPLATES).map(([key, template]) => (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => applyTemplate(key as keyof typeof RULE_TEMPLATES)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {template.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="rule-name">Nome da Regra *</Label>
                    <Input
                      id="rule-name"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      placeholder="Ex: Classificar contas de luz"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-type">Tipo</Label>
                      <Select value={ruleType} onValueChange={setRuleType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classification">Classificação</SelectItem>
                          <SelectItem value="routing">Roteamento</SelectItem>
                          <SelectItem value="validation">Validação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade (1-10)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={priority}
                        onChange={(e) => setPriority(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conditions">Condições (JSON)</Label>
                    <Textarea
                      id="conditions"
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder='{"message_contains": ["boleto", "luz"]}'
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actions">Ações (JSON)</Label>
                    <Textarea
                      id="actions"
                      value={actions}
                      onChange={(e) => setActions(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder='{"classify_as": "payment", "category": "Utilities"}'
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={active}
                      onCheckedChange={setActive}
                    />
                    <Label htmlFor="active">Regra ativa</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveRule}>
                    {editingRule ? 'Atualizar' : 'Criar'} Regra
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <label htmlFor="import-rules">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </span>
              </Button>
            </label>
            <input
              id="import-rules"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>

        {/* Rules Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Prioridade</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando regras...
                  </TableCell>
                </TableRow>
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma regra configurada. Crie sua primeira regra!
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.rule_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.rule_type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{rule.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(rule)}
                      >
                        {rule.active ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
