import React, { useState, useEffect } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { CalendarRange } from '@/components/ui/calendar';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from 'lucide-react';

export const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('Todas');
  const [filterAction, setFilterAction] = useState('Todas');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const { logs, loading, error, refetch } = useAuditLogs();

  // Add better data filtering and error handling
  const filteredLogs = logs.filter(log => {
    if (!log) return false;
    
    const matchesSearch = !searchTerm || 
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record_id?.includes(searchTerm) ||
      log.user_id?.includes(searchTerm);
    
    const matchesTable = filterTable === 'Todas' || log.table_name === filterTable;
    const matchesAction = filterAction === 'Todas' || log.action === filterAction;
    
    const logDate = log.created_at ? new Date(log.created_at) : null;
    const matchesDateRange = !dateRange.from || !logDate || 
      (logDate >= dateRange.from && (!dateRange.to || logDate <= dateRange.to));
    
    return matchesSearch && matchesTable && matchesAction && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Carregando logs de auditoria...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Erro: {error}</div>
        </div>
      </div>
    );
  }

  const renderDataChange = (oldData: any, newData: any) => {
    if (!oldData && !newData) return <span className="text-gray-500">Sem dados</span>;
    
    try {
      const changes = [];
      const allKeys = new Set([
        ...Object.keys(oldData || {}),
        ...Object.keys(newData || {})
      ]);
      
      for (const key of allKeys) {
        const oldValue = oldData?.[key];
        const newValue = newData?.[key];
        
        if (oldValue !== newValue) {
          changes.push(
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span>
              {oldValue !== undefined && (
                <span className="text-red-600 line-through ml-1">{String(oldValue)}</span>
              )}
              {newValue !== undefined && (
                <span className="text-green-600 ml-1">{String(newValue)}</span>
              )}
            </div>
          );
        }
      }
      
      return changes.length > 0 ? (
        <div className="space-y-1">{changes}</div>
      ) : (
        <span className="text-gray-500">Sem alterações</span>
      );
    } catch (error) {
      console.error('Error rendering data change:', error);
      return <span className="text-red-500">Erro ao exibir alterações</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-600 mt-1">Acompanhe as atividades do sistema</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Pesquisar</Label>
            <Input
              type="text"
              id="search"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="table">Tabela</Label>
            <Select onValueChange={setFilterTable}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                {Array.from(new Set(logs.map(log => log.table_name).filter(Boolean))).map(table => (
                  <SelectItem key={table} value={table}>{table}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="action">Ação</Label>
            <Select onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                {Array.from(new Set(logs.map(log => log.action).filter(Boolean))).map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label>Intervalo de Datas</Label>
          <CalendarRange value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{log.table_name}</h3>
                <p className="text-gray-600">{log.action} - {log.record_id}</p>
                <p className="text-gray-500 text-sm">
                  Usuário: {log.user_id} - {new Date(log.created_at).toLocaleDateString()}
                </p>
                
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-700">Alterações:</h4>
                  {renderDataChange(log.old_data, log.new_data)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500">Nenhum log de auditoria encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
