import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useERPImport, ImportRecord, ERP_CONFIGS } from '@/hooks/useERPImport';

export function ImportHistory() {
  const { importHistory, loadingHistory, fetchImportHistory } = useERPImport();

  useEffect(() => {
    fetchImportHistory();
  }, [fetchImportHistory]);

  const getStatusBadge = (status: ImportRecord['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-600 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Concluído
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Falhou
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processando
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
    }
  };

  const getERPName = (erpId: string) => {
    return ERP_CONFIGS.find(e => e.id === erpId)?.name || erpId;
  };

  const getERPLogo = (erpId: string) => {
    return ERP_CONFIGS.find(e => e.id === erpId)?.logo || '📄';
  };

  if (loadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (importHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma importação realizada ainda.</p>
            <p className="text-sm mt-1">Selecione um ERP acima para começar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Importações</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ERP</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead>Registros</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {importHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{getERPLogo(record.erp_name)}</span>
                    <span className="font-medium">{getERPName(record.erp_name)}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {record.file_name}
                </TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">{record.imported_records}</span>
                  {record.failed_records > 0 && (
                    <span className="text-destructive">/{record.failed_records} erros</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(record.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
