import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Download, Filter } from 'lucide-react';
import { Receivable } from '@/hooks/useReceivables';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceivablesTableProps {
  receivables: Receivable[];
  onViewDetails: (receivable: Receivable) => void;
}

export const ReceivablesTable: React.FC<ReceivablesTableProps> = ({
  receivables,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReceivables = useMemo(() => {
    return receivables.filter((r) => {
      const matchesSearch =
        r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cpf_cnpj_cliente?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receivables, searchTerm, statusFilter]);

  const currency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pendente: { variant: 'default', label: 'Pendente' },
      recebido: { variant: 'secondary', label: 'Recebido' },
      parcial: { variant: 'default', label: 'Parcial' },
      cancelado: { variant: 'destructive', label: 'Cancelado' },
    };

    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status !== 'pendente') return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const exportCSV = () => {
    const headers = ['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status'];
    const rows = filteredReceivables.map((r) => [
      r.cliente,
      r.descricao,
      r.valor_total.toString(),
      format(new Date(r.data_vencimento), 'dd/MM/yyyy'),
      r.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contas_receber_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar cliente, descrição ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="recebido">Recebido</SelectItem>
            <SelectItem value="parcial">Parcial</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Valor Recebido</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceivables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Nenhuma conta encontrada com os filtros aplicados'
                    : 'Nenhuma conta a receber cadastrada'}
                </TableCell>
              </TableRow>
            ) : (
              filteredReceivables.map((receivable) => (
                <TableRow
                  key={receivable.id}
                  className={isOverdue(receivable.data_vencimento, receivable.status) ? 'bg-red-50' : ''}
                >
                  <TableCell className="font-medium">{receivable.cliente}</TableCell>
                  <TableCell className="max-w-xs truncate">{receivable.descricao}</TableCell>
                  <TableCell className="text-right">{currency(receivable.valor_total)}</TableCell>
                  <TableCell className="text-right">{currency(receivable.valor_recebido)}</TableCell>
                  <TableCell>
                    {format(new Date(receivable.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    {isOverdue(receivable.data_vencimento, receivable.status) && (
                      <Badge variant="destructive" className="ml-2">
                        Vencido
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(receivable.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(receivable)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredReceivables.length} de {receivables.length} contas
      </div>
    </div>
  );
};
