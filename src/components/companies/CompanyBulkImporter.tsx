import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { parseCompanyCSV, companyCSVData } from '@/utils/csvCompanyParser';
import { useToast } from '@/hooks/use-toast';

interface CompanyBulkImporterProps {
  onBulkCreate: (companiesData: any[]) => Promise<void>;
}

export const CompanyBulkImporter = ({ onBulkCreate }: CompanyBulkImporterProps) => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    try {
      setImporting(true);
      
      // Parse the CSV data
      const companies = parseCompanyCSV(companyCSVData);
      
      toast({
        title: "Iniciando importação",
        description: `Importando ${companies.length} empresas...`,
      });

      // Use the bulk create function
      await onBulkCreate(companies);
      
      toast({
        title: "Importação concluída",
        description: `${companies.length} empresas foram importadas com sucesso!`,
      });
      
    } catch (error) {
      console.error('Error importing companies:', error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar as empresas.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Importação em Lote</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Importar todas as empresas do CSV fornecido.
      </p>
      <Button 
        onClick={handleImport} 
        disabled={importing}
        className="w-full"
      >
        {importing ? 'Importando...' : 'Importar Empresas'}
      </Button>
    </div>
  );
};