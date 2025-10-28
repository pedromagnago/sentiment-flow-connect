import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Filter, RefreshCw, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RuleLog {
  id: string;
  rule_name: string;
  applied_at: string;
  message_id: string;
  result: any;
  matched_conditions: any;
  actions_taken: any;
}

export const RuleApplicationLogs = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [logs, setLogs] = useState<RuleLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadLogs();
  }, [user]);

  const loadLogs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.company_id) return;

      // Get audit logs related to rule applications
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'suggested_actions')
        .eq('action', 'INSERT')
        .contains('new_data', { origin: 'ai_classification' })
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Transform audit logs into rule logs format
      const transformedLogs = (data || []).map(log => ({
        id: log.id,
        rule_name: log.new_data?.rule_applied || 'Classificação Automática',
        applied_at: log.created_at,
        message_id: log.record_id,
        result: log.new_data?.action_type,
        matched_conditions: log.new_data?.matched_conditions || {},
        actions_taken: log.new_data?.extracted_data || {},
      }));
      
      setLogs(transformedLogs);
    } catch (error: any) {
      console.error('Error loading logs:', error);
      toast({
        title: 'Erro ao carregar logs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.message_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || log.result === filterType;
    
    return matchesSearch && matchesType;
  });

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'payment':
        return 'bg-red-100 text-red-800';
      case 'invoice':
        return 'bg-green-100 text-green-800';
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'document_analysis':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultLabel = (result: string) => {
    const labels: Record<string, string> = {
      payment: 'Conta a Pagar',
      invoice: 'Fatura',
      task: 'Tarefa',
      document_analysis: 'Análise de Documento',
    };
    return labels[result] || result;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Logs de Aplicação de Regras
        </CardTitle>
        <CardDescription>
          Histórico de regras aplicadas automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por regra ou mensagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="payment">Conta a Pagar</SelectItem>
              <SelectItem value="invoice">Fatura</SelectItem>
              <SelectItem value="task">Tarefa</SelectItem>
              <SelectItem value="document_analysis">Análise</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">Total de aplicações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {logs.filter(l => l.result === 'payment').length}
              </div>
              <p className="text-xs text-muted-foreground">Contas a Pagar</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {logs.filter(l => l.result === 'invoice').length}
              </div>
              <p className="text-xs text-muted-foreground">Faturas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {logs.filter(l => l.result === 'task').length}
              </div>
              <p className="text-xs text-muted-foreground">Tarefas</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Regra Aplicada</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>ID Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Carregando logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchTerm || filterType !== 'all'
                      ? 'Nenhum log encontrado com os filtros aplicados'
                      : 'Nenhum log de aplicação de regras ainda'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.applied_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{log.rule_name}</TableCell>
                    <TableCell>
                      <Badge className={getResultBadgeColor(log.result)}>
                        {getResultLabel(log.result)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {log.message_id.slice(0, 8)}...
                      </code>
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
