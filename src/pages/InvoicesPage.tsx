import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useInvoices } from '@/hooks/useInvoices';
import { CheckCircle, Clock, XCircle, Calendar, FileText, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  pendente: {
    label: 'Pendente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  emitida: {
    label: 'Emitida',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  enviada: {
    label: 'Enviada',
    icon: Send,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  paga: {
    label: 'Paga',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
};

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [numeroNota, setNumeroNota] = useState<string>('');

  const { invoices, isLoading, updateInvoice, markAsIssued, deleteInvoice } = useInvoices({
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const handleMarkAsIssued = () => {
    if (selectedInvoice) {
      markAsIssued({ 
        id: selectedInvoice.id, 
        numero_nota: numeroNota 
      });
      setSelectedInvoice(null);
      setNumeroNota('');
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateInvoice({ id, updates: { status: status as any } });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const totalPendente = invoices
    .filter(i => i.status === 'pendente')
    .reduce((sum, i) => sum + Number(i.valor), 0);

  const totalEmitida = invoices
    .filter(i => i.status === 'emitida')
    .reduce((sum, i) => sum + Number(i.valor), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturamento</h1>
          <p className="text-muted-foreground">
            Gerencie notas fiscais criadas via WhatsApp
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPendente)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emitidas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalEmitida)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="emitida">Emitida</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="paga">Paga</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data Inicial</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <Label>Data Final</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Nº Nota</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Nenhuma fatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const statusConfig = STATUS_CONFIG[invoice.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.destinatario}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {invoice.descricao}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(invoice.data_emissao)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.data_vencimento ? formatDate(invoice.data_vencimento) : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(invoice.valor))}
                    </TableCell>
                    <TableCell>
                      {invoice.numero_nota || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.status === 'pendente' && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedInvoice(invoice)}
                                >
                                  Emitir
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Emitir Nota Fiscal</DialogTitle>
                                  <DialogDescription>
                                    Confirmar emissão: {invoice.destinatario}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Número da Nota</Label>
                                    <Input
                                      value={numeroNota}
                                      onChange={(e) => setNumeroNota(e.target.value)}
                                      placeholder="Ex: 001234"
                                    />
                                  </div>
                                  <Button onClick={handleMarkAsIssued} className="w-full">
                                    Confirmar Emissão
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(invoice.id, 'cancelada')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteInvoice(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
