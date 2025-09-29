import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDocumentAnalysis } from '@/hooks/useDocumentAnalysis';
import { FileText, Image, Mic, Trash2, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AnalysisPage = () => {
  const { analyses, isLoading, processDocument, isProcessing, deleteAnalysis } = useDocumentAnalysis();
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'audio'>('image');

  const handleProcess = () => {
    if (!fileUrl || !fileName) {
      return;
    }
    processDocument({ file_url: fileUrl, file_type: fileType, file_name: fileName });
    setFileUrl('');
    setFileName('');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const stats = {
    total: analyses.length,
    pdf: analyses.filter(a => a.file_type === 'pdf').length,
    image: analyses.filter(a => a.file_type === 'image').length,
    audio: analyses.filter(a => a.file_type === 'audio').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise de Documentos</h1>
          <p className="text-muted-foreground">Processe PDFs, imagens e áudios com IA</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDFs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pdf}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imagens</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.image}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áudios</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.audio}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Processar Novo Documento</CardTitle>
          <CardDescription>
            Forneça a URL do arquivo para análise (imagem, PDF ou áudio)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Arquivo</label>
                <Input
                  placeholder="documento.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Arquivo</label>
                <Input
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                >
                  <option value="image">Imagem</option>
                  <option value="pdf">PDF</option>
                  <option value="audio">Áudio</option>
                </select>
              </div>
            </div>
            <Button onClick={handleProcess} disabled={isProcessing || !fileUrl || !fileName}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Processar Documento
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analyses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Realizadas</CardTitle>
          <CardDescription>Histórico de documentos processados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma análise realizada ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead>Resumo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(analysis.file_type)}
                        <span className="capitalize">{analysis.file_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{analysis.file_name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {analysis.summary || 'Sem resumo'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(analysis.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{analysis.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAnalysis(analysis.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Analysis Details Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Análise</DialogTitle>
            <DialogDescription>
              {selectedAnalysis?.file_name}
            </DialogDescription>
          </DialogHeader>
          {selectedAnalysis && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="full">Texto Completo</TabsTrigger>
                <TabsTrigger value="raw">Dados Brutos</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Resumo</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedAnalysis.summary || 'Sem resumo disponível'}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="full" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Texto Extraído</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedAnalysis.extracted_text || 'Nenhum texto extraído'}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="raw" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Dados da Análise</h4>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedAnalysis.analysis_result, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisPage;
