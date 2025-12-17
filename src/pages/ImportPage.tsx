import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, History, BookOpen, Zap } from 'lucide-react';
import { ImportWizard } from '@/components/import/ImportWizard';
import { ImportHistory } from '@/components/import/ImportHistory';
import { ERP_CONFIGS } from '@/hooks/useERPImport';

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState('import');
  const [importKey, setImportKey] = useState(0);

  const handleImportComplete = () => {
    setActiveTab('history');
    setImportKey(k => k + 1);
  };

  const popularERPs = ERP_CONFIGS.filter(e => e.popular);
  const supportedERPs = ERP_CONFIGS.filter(e => !e.comingSoon).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Importação</h1>
          <p className="text-muted-foreground">
            Importe dados de outros sistemas para o FullBPO
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {supportedERPs} ERPs suportados
          </Badge>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ERPs Populares</p>
              <div className="flex gap-1 mt-1">
                {popularERPs.map(erp => (
                  <span key={erp.id} className="text-lg" title={erp.name}>
                    {erp.logo}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-chart-2/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Formatos Aceitos</p>
              <p className="font-semibold text-foreground">XLSX, CSV, OFX</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-chart-3/10 rounded-lg">
              <History className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dados Suportados</p>
              <p className="font-semibold text-foreground">Transações, Clientes, Vendas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Nova Importação
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          <ImportWizard key={importKey} onComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ImportHistory />
        </TabsContent>
      </Tabs>

      {/* Help section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Como exportar dados do seu ERP?
          </CardTitle>
          <CardDescription>
            Cada sistema tem um caminho diferente para exportar dados. Siga os guias abaixo:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularERPs.map(erp => (
              <Button 
                key={erp.id} 
                variant="outline" 
                className="justify-start gap-2"
                disabled
              >
                <span>{erp.logo}</span>
                <span>Guia {erp.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Em breve
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
