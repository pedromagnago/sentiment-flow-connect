import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanyContext } from '@/contexts/CompanyContext';

export interface ERPConfig {
  id: string;
  name: string;
  logo: string;
  color: string;
  supportedTypes: DataType[];
  supportedFormats: string[];
  popular?: boolean;
  comingSoon?: boolean;
}

export type DataType = 
  | 'transactions' 
  | 'clients' 
  | 'products' 
  | 'payables' 
  | 'receivables'
  | 'sales';

export interface ImportRecord {
  id: string;
  company_id: string;
  erp_name: string;
  data_type: string;
  file_name: string;
  total_records: number;
  imported_records: number;
  failed_records: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface ParsedRow {
  original: Record<string, any>;
  mapped: Record<string, any>;
  errors: string[];
  isValid: boolean;
}

export const ERP_CONFIGS: ERPConfig[] = [
  {
    id: 'bling',
    name: 'Bling',
    logo: '📦',
    color: 'hsl(var(--chart-1))',
    supportedTypes: ['sales', 'products', 'clients'],
    supportedFormats: ['xlsx', 'csv'],
    popular: true
  },
  {
    id: 'conta-azul',
    name: 'Conta Azul',
    logo: '💙',
    color: 'hsl(var(--chart-2))',
    supportedTypes: ['transactions', 'payables', 'receivables'],
    supportedFormats: ['xlsx', 'csv'],
    popular: true
  },
  {
    id: 'omie',
    name: 'Omie',
    logo: '🔷',
    color: 'hsl(var(--chart-3))',
    supportedTypes: ['transactions', 'clients', 'sales'],
    supportedFormats: ['xlsx', 'csv'],
    popular: true
  },
  {
    id: 'tiny',
    name: 'Tiny ERP',
    logo: '🟢',
    color: 'hsl(var(--chart-4))',
    supportedTypes: ['sales', 'products'],
    supportedFormats: ['xlsx', 'csv']
  },
  {
    id: 'nibo',
    name: 'Nibo',
    logo: '📊',
    color: 'hsl(var(--chart-5))',
    supportedTypes: ['transactions'],
    supportedFormats: ['xlsx', 'csv']
  },
  {
    id: 'granatum',
    name: 'Granatum',
    logo: '💰',
    color: 'hsl(var(--primary))',
    supportedTypes: ['transactions'],
    supportedFormats: ['xlsx', 'csv']
  },
  {
    id: 'asaas',
    name: 'Asaas',
    logo: '💳',
    color: 'hsl(var(--secondary))',
    supportedTypes: ['receivables'],
    supportedFormats: ['xlsx', 'csv'],
    comingSoon: true
  },
  {
    id: 'generic',
    name: 'Outro / Genérico',
    logo: '📄',
    color: 'hsl(var(--muted-foreground))',
    supportedTypes: ['transactions', 'clients', 'products', 'payables', 'receivables', 'sales'],
    supportedFormats: ['xlsx', 'csv', 'ofx']
  }
];

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  transactions: 'Transações Bancárias',
  clients: 'Clientes',
  products: 'Produtos',
  payables: 'Contas a Pagar',
  receivables: 'Contas a Receber',
  sales: 'Vendas'
};

export const DATA_TYPE_ICONS: Record<DataType, string> = {
  transactions: '💳',
  clients: '👥',
  products: '📦',
  payables: '📤',
  receivables: '📥',
  sales: '🛒'
};

export function useERPImport() {
  const { toast } = useToast();
  const { selectedCompanyIds } = useCompanyContext();
  const [importing, setImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchImportHistory = useCallback(async () => {
    if (selectedCompanyIds.length === 0) {
      setImportHistory([]);
      return;
    }

    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('transaction_imports')
        .select('*')
        .in('company_id', selectedCompanyIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const mapped: ImportRecord[] = (data || []).map(item => ({
        id: item.id,
        company_id: item.company_id,
        erp_name: item.source || 'generic',
        data_type: 'transactions',
        file_name: item.file_name || 'unknown',
        total_records: item.total_transactions || 0,
        imported_records: item.imported_transactions || 0,
        failed_records: (item.total_transactions || 0) - (item.imported_transactions || 0),
        status: item.status as ImportRecord['status'],
        error_message: undefined,
        created_at: item.created_at
      }));

      setImportHistory(mapped);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [selectedCompanyIds]);

  const importFile = useCallback(async (
    file: File,
    erpId: string,
    dataType: DataType,
    companyId: string
  ) => {
    setImporting(true);
    try {
      const base64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('ingest-spreadsheet', {
        body: {
          file: base64,
          filename: file.name,
          source: erpId,
          dataType,
          companyId
        }
      });

      if (error) throw error;

      toast({
        title: 'Importação concluída',
        description: `${data.imported || 0} registros importados com sucesso.`
      });

      await fetchImportHistory();
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setImporting(false);
    }
  }, [toast, fetchImportHistory]);

  const parsePreview = useCallback(async (
    file: File,
    erpId: string,
    dataType: DataType
  ): Promise<ParsedRow[]> => {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    if (jsonData.length < 2) {
      throw new Error('Arquivo vazio ou sem dados');
    }

    const headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
    const rows = jsonData.slice(1, 11); // Preview das primeiras 10 linhas

    return rows.map((row: any) => {
      const original: Record<string, any> = {};
      const mapped: Record<string, any> = {};
      const errors: string[] = [];

      headers.forEach((header, idx) => {
        original[header] = row[idx];
      });

      // Mapeamento básico baseado no ERP e tipo de dado
      const mapping = getColumnMapping(erpId, dataType, headers);
      
      Object.entries(mapping).forEach(([targetField, sourceField]) => {
        if (sourceField && original[sourceField] !== undefined) {
          mapped[targetField] = original[sourceField];
        }
      });

      // Validações básicas
      if (dataType === 'transactions' && !mapped.date) {
        errors.push('Data não encontrada');
      }
      if (dataType === 'transactions' && !mapped.amount) {
        errors.push('Valor não encontrado');
      }

      return {
        original,
        mapped,
        errors,
        isValid: errors.length === 0
      };
    });
  }, []);

  return {
    importing,
    importHistory,
    loadingHistory,
    fetchImportHistory,
    importFile,
    parsePreview
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

function getColumnMapping(
  erpId: string, 
  dataType: DataType, 
  headers: string[]
): Record<string, string | null> {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  const findColumn = (patterns: string[]): string | null => {
    for (const pattern of patterns) {
      const idx = normalizedHeaders.findIndex(h => h.includes(pattern));
      if (idx >= 0) return headers[idx];
    }
    return null;
  };

  if (dataType === 'transactions') {
    return {
      date: findColumn(['data', 'date', 'dt', 'vencimento']),
      description: findColumn(['descri', 'histórico', 'memo', 'observ']),
      amount: findColumn(['valor', 'amount', 'quantia', 'total']),
      type: findColumn(['tipo', 'type', 'natureza', 'operação']),
      category: findColumn(['categoria', 'category', 'classificação'])
    };
  }

  if (dataType === 'clients') {
    return {
      name: findColumn(['nome', 'name', 'razão', 'cliente']),
      email: findColumn(['email', 'e-mail']),
      phone: findColumn(['telefone', 'phone', 'celular', 'fone']),
      document: findColumn(['cpf', 'cnpj', 'documento', 'document'])
    };
  }

  if (dataType === 'payables' || dataType === 'receivables') {
    return {
      description: findColumn(['descri', 'histórico', 'memo']),
      amount: findColumn(['valor', 'amount', 'total']),
      dueDate: findColumn(['vencimento', 'due', 'prazo']),
      entity: findColumn(['fornecedor', 'cliente', 'beneficiário', 'pagador'])
    };
  }

  return {};
}
