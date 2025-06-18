
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuditLog, AuditLog } from '@/hooks/useAuditLog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tableName: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const { fetchAuditLogs } = useAuditLog();

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs({
        tableName: filters.tableName || undefined,
        action: filters.action || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: 1000
      });
      
      // Filtrar por busca local se necessário
      let filteredData = data;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = data.filter(log => 
          log.table_name.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          (log.record_id && log.record_id.toLowerCase().includes(searchLower)) ||
          (log.user_agent && log.user_agent.toLowerCase().includes(searchLower))
        );
      }
      
      setLogs(filteredData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters.tableName, filters.action, filters.dateFrom, filters.dateTo]);

  const handleSearch = () => {
    loadLogs();
  };

  const clearFilters = () => {
    setFilters({
      tableName: '',
      action: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'VIEW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames: { [key: string]: string } = {
      'contacts': 'Contatos',
      'companies': 'Empresas',
      'messages': 'Mensagens',
      'taskgroups': 'Grupos de Tarefas',
      'taskgrouprevisions': 'Revisões de Tarefas'
    };
    return tableNames[tableName] || tableName;
  };

  const exportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Ação', 'Tabela', 'ID Registro', 'Usuário', 'IP'].join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss'),
        log.action,
        getTableDisplayName(log.table_name),
        log.record_id || '',
        log.user_id || '',
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Logs de Auditoria</h1>
        <p className="text-gray-600">
          Histórico completo de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </CardTitle>
          <CardDescription>
            Filtre os logs por tabela, ação, data ou pesquise por texto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tabela</label>
              <Select value={filters.tableName} onValueChange={(value) => setFilters({...filters, tableName: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as tabelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as tabelas</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="companies">Empresas</SelectItem>
                  <SelectItem value="messages">Mensagens</SelectItem>
                  <SelectItem value="taskgroups">Grupos de Tarefas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ação</label>
              <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criar</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Excluir</SelectItem>
                  <SelectItem value="VIEW">Visualizar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data De</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data Até</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Pesquisar nos logs..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="default">
                <Search className="w-4 h-4 mr-2" />
                Pesquisar
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </Button>
              <Button onClick={exportLogs} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ações ({logs.length} registros)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>ID Registro</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Navegador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum log encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTableDisplayName(log.table_name)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.record_id ? log.record_id.substring(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell>{log.user_id || 'Anônimo'}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip_address || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm" title={log.user_agent || ''}>
                        {log.user_agent ? log.user_agent.substring(0, 50) + '...' : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
