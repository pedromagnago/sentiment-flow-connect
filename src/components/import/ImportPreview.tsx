import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ParsedRow, DataType, DATA_TYPE_LABELS } from '@/hooks/useERPImport';

interface ImportPreviewProps {
  dataType: DataType;
  parsedData: ParsedRow[];
  loading?: boolean;
}

export function ImportPreview({ dataType, parsedData, loading }: ImportPreviewProps) {
  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">Analisando arquivo...</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Aguarde enquanto processamos os dados
          </p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (parsedData.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
        <h3 className="font-semibold text-foreground">Nenhum dado encontrado</h3>
        <p className="text-muted-foreground text-sm">
          O arquivo parece estar vazio ou em formato não reconhecido
        </p>
      </div>
    );
  }

  const columns = parsedData[0] 
    ? Object.keys(parsedData[0].mapped).filter(k => parsedData[0].mapped[k] !== null)
    : [];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Preview da Importação</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Verifique se os dados estão corretos antes de importar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{parsedData.length}</div>
            <div className="text-sm text-muted-foreground">Registros</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{validCount}</div>
            <div className="text-sm text-muted-foreground">Válidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{invalidCount}</div>
            <div className="text-sm text-muted-foreground">Com erros</div>
          </CardContent>
        </Card>
      </div>

      {/* Data type badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Tipo:</span>
        <Badge variant="secondary">{DATA_TYPE_LABELS[dataType]}</Badge>
      </div>

      {/* Preview table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Primeiros registros</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  {columns.map(col => (
                    <TableHead key={col} className="min-w-[120px]">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {row.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </TableCell>
                    {columns.map(col => (
                      <TableCell key={col} className="max-w-[200px] truncate">
                        {String(row.mapped[col] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Errors */}
      {invalidCount > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Problemas encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {parsedData
                .filter(r => !r.isValid)
                .flatMap((r, idx) => r.errors.map((e, eIdx) => (
                  <li key={`${idx}-${eIdx}`} className="text-muted-foreground">
                    Linha {idx + 2}: {e}
                  </li>
                )))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
